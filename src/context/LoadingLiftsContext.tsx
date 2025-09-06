import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AppState } from 'react-native';
import { ILiftData } from './LiftDataContext';
import { getUserId } from '../services/storageService';
import { analyzeLift } from '../services/liftService';
import { uploadLiftVideo, uploadLiftThumbnail } from '../services/VideoUploadService';
import { useLiftData, extractObjectKeyFromUrl, signPath } from './LiftDataContext';
import { useSelectedDate } from './SelectedDateContext';
import { useUserCheckIns } from './UserCheckInsContext';
import { loadLoadingLifts, saveLoadingLifts } from '../services/loadingLiftsStorage';
import { hapticFeedback } from '../utils/haptic';
import { LoadingLiftData, LoadingLiftsContextType, PipelineStage, RetryStage } from '../types/Lifts.d';
import { deleteUserStorage, searchLiftByAssetId } from '../services/liftService';

const LoadingLiftsContext = createContext<LoadingLiftsContextType | undefined>(undefined);

interface LoadingLiftsProviderProps {
  children: ReactNode;
}

export function LoadingLiftsProvider({ children }: LoadingLiftsProviderProps) {
  const [allLoadingLifts, setAllLoadingLifts] = useState<LoadingLiftData[]>([]);
  const [completedLifts, setCompletedLifts] = useState<ILiftData[]>([]);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [autoDeletedLifts, setAutoDeletedLifts] = useState<Set<string>>(new Set());
  const { refreshLifts, getLiftsByDate, formatDateForLift } = useLiftData();
  const { selectedDate } = useSelectedDate();
  const { invalidateAndRefetch: invalidateUserCheckIns } = useUserCheckIns();
  const persistTimer = useRef<NodeJS.Timeout | null>(null);
  const inflight = useRef<Set<string>>(new Set());
  const appState = useRef(AppState.currentState);
  const analyzeAbortRef = useRef<AbortController | null>(null);
  const analyzeAttempts = useRef(new Map<string, number>());
  const pollersRef = useRef(new Map<string, NodeJS.Timeout>());
  // keep latest snapshot in sync
  const latestLiftsRef = useRef<LoadingLiftData[]>([]);
  useEffect(() => { latestLiftsRef.current = allLoadingLifts; }, [allLoadingLifts]);

  // hard guard
  const isCompletedNow = (id: string) =>
    latestLiftsRef.current.some(l => l.id === id && l.status === 'completed' && !!l.finalData);

  // never downgrade a completed card
  const safeUpdateLift = (id: string, updater: (l: LoadingLiftData) => LoadingLiftData) => {
    setAllLoadingLifts(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        if (l.status === 'completed') return l;     // lock
        return updater(l);
      })
    );
  };

  // one place to mark completion
  const markCompleted = (id: string, mapped: ILiftData) => {
    setAllLoadingLifts(prev =>
      prev.map(l =>
        l.id === id
          ? { ...l, finalData: mapped, status: 'completed', uiProgress: 1, pipelineStage: 'analyze' }
          : l
      )
    );
    analyzeAttempts.current.delete(id);
    stopPoller(id);
  };

  // Retry configuration
  const ANALYZE_BACKOFF = [2000, 4000, 8000]; // ms
  const isTransientErrorCode = (c?: string) =>
    !!c && /(NETWORK|TIMEOUT|HTTP_5\d\d|HTTP_429|BAD_JSON|ABORT|ABORTED|CANCEL|CANCELLED)/i.test(c);
  
  // Only these server codes may show an error card
  const HARD_API_ERRORS = new Set([
    'NO_GYM_VIDEO_FOUND',
    'WRONG_MOVEMENT',
    'ERROR_OCCURED',       // keep your server spelling
  ]);
  
  // Polling configuration
  const ANALYZE_TTL_MS = 10 * 60 * 1000;   // consider "in-progress" for up to 10m
  const POLL_EVERY_MS = 7000;              // poll every 7 seconds

  // Only "soft fail" while analysis is in flight
  const SOFT_FAIL_TTL_MS = ANALYZE_TTL_MS; // during this window, don't flip to hard error

  const softFail = (id: string, msg: string) => {
    safeUpdateLift(id, l => ({
      ...l,
      status: 'processing',
      errorMessage: msg || 'Temporary issue — retrying…'
    }));
  };

  // Serialization helpers
  const hasActiveAnalyzeJob = (exceptId?: string) => {
    const now = Date.now();
    return latestLiftsRef.current.some(l =>
      l.id !== exceptId &&
      l.pipelineStage === 'analyze' &&
      typeof l.analysisStartedAt === 'number' &&
      (now - l.analysisStartedAt) < ANALYZE_TTL_MS &&
      (l.status === 'processing' || l.status === 'uploading')
    );
  };
  // Utility function to compute simulation duration
  const computeSimDurationMs = (videoDurationSec?: number) =>
    (((videoDurationSec || 10) * 2) + 20) * 1000; // same formula as before

  // Wall-clock progress calculation
  const tickProgressFromClock = () => {
    const now = Date.now();
    setAllLoadingLifts(prev => {
      const updated = prev.map(l => {
        if (!(l.status === 'uploading' || l.status === 'processing')) return l;
        const start = l.simStartAt ?? now;
        const dur = l.simDurationMs ?? computeSimDurationMs(l.videoDurationSec);
        const base = l.simStartProgress ?? 0.02;
        const frac = Math.min(0.95, Math.max(base, (now - start) / dur));
        if (typeof l.uiProgress === 'number' && frac <= l.uiProgress) return l;
        return { ...l, uiProgress: frac };
      });
      return updated;
    });
  };

  // Polling helpers
  const stopPoller = (id: string) => {
    const t = pollersRef.current.get(id);
    if (t) {
      clearInterval(t);
      pollersRef.current.delete(id);
    }
  };

  const startAnalyzePoll = (lift: LoadingLiftData) => {
    stopPoller(lift.id);
    const startedAt = lift.analysisStartedAt ?? Date.now();
    setAllLoadingLifts(prev => prev.map(l => l.id === lift.id ? { ...l, analysisStartedAt: startedAt } : l));

    const tick = async () => {
      // if expired, stop and allow retry by pipeline
      if (Date.now() - (startedAt || 0) > ANALYZE_TTL_MS) {
        stopPoller(lift.id);
        // leave it "processing" — the pipeline may decide to retry
        return;
      }

      // check if server wrote the lift row yet
      if (lift.assetId) {
        const found = await searchLiftByAssetId(lift.assetId);
        if (found) {
          stopPoller(lift.id);
          // map to final state directly
          const mapped = await mapApiDataToFinalData({
            id: found.id,
            is_favourite: found.isFavourite,
            lift_type: found.liftType,
            lift_date: found.liftDate,
            lift_time: found.liftTime,
            weight_value: found.weightValue,
            reps: found.reps,
            thumbnail_url: found.thumbnailURL,
            analysis: found.analysis,
          });
          markCompleted(lift.id, mapped);
          // Invalidate user check-ins to refresh streak data
          invalidateUserCheckIns();
        }
      }
    };

    // fire once immediately on resume, then every N seconds
    void tick();
    const t = setInterval(() => { if (AppState.currentState === 'active') void tick(); }, POLL_EVERY_MS);
    pollersRef.current.set(lift.id, t);
  };

  // Helper to detect transient errors that should be retryable
  const isTransientError = (error: any): boolean => {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    const transientPatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /fetch/i,
      /abort/i,
      /5\d\d/, // 5xx server errors
      /429/, // rate limiting
    ];
    
    return transientPatterns.some(pattern => pattern.test(errorMessage));
  };

  // Helper function to parse DD-MM-YYYY format dates
  const parseLiftDate = (dateString: string): Date => {
    // Handle DD-MM-YYYY format
    const match = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [, day, month, year] = match.map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    }
    // Fallback for other formats
    return new Date(dateString);
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Filter loading lifts to only show those matching the selected date
  const loadingLifts = allLoadingLifts.filter(lift => {
    const liftDate = parseLiftDate(lift.dateToday);
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    return isSameDay(liftDate, selectedDateOnly);
  });

  /**
   * Derive the correct stage to resume from based on what's already completed
   */
  function deriveStage(lift: LoadingLiftData): PipelineStage {
    if (lift.failureStage) return lift.failureStage;
    if (lift.uploadedVideoUrl && lift.uploadedThumbnailUrl) return 'analyze';
    if (lift.uploadedVideoUrl) return 'upload_thumbnail';
    return 'upload_video';
  }



  // Hydrate loading lifts from AsyncStorage on app start
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const stored = await loadLoadingLifts();
        if (cancelled) return;
        
        if (stored.length > 0) {
          // Put stored lifts into state so the UI shows cards immediately
          setAllLoadingLifts(stored);

          // Ensure sim fields exist for in-flight lifts so progress can catch up
          setAllLoadingLifts(prev => prev.map(l => {
            if ((l.status === 'uploading' || l.status === 'processing') && !l.simStartAt) {
              return {
                ...l,
                simStartAt: Date.now(),
                simDurationMs: l.simDurationMs || computeSimDurationMs(l.videoDurationSec),
                simStartProgress: typeof l.uiProgress === 'number' ? Math.max(0.02, l.uiProgress) : 0.02,
              };
            }
            return l;
          }));

          // Resume processing for any lifts that were in-flight
          stored.forEach(lift => {
            if (lift.status === 'completed') return; // Skip completed lifts
            if (lift.status === 'error') {
              const isPermanent =
                lift.failureStage === 'analyze' &&
                (lift.errorMessage === 'No lift found' || lift.errorMessage === 'Lift mismatch');

              if (!isPermanent) {
                safeUpdateLift(lift.id, l => ({ ...l, status: 'processing', errorMessage: undefined, failureStage: undefined }));
                // resume analyze or stage…
                if (deriveStage(lift) === 'analyze') {
                  if (lift.analysisStartedAt && (Date.now() - lift.analysisStartedAt) < ANALYZE_TTL_MS) {
                    startAnalyzePoll(lift);
                  } else {
                    void processLiftPipeline(lift, 'analyze', lift.retryStage);
                  }
                } else {
                  void processLiftPipeline(lift, deriveStage(lift));
                }
              }
              return;
            }
            
            // Update status to processing to reflect we're resuming, but preserve progress
            safeUpdateLift(lift.id, l => ({ ...l, status: 'processing' }));
            
            // Resume from the appropriate stage with preserved progress
            const stage = deriveStage(lift);
            if (stage === 'analyze') {
              if (lift.analysisStartedAt && (Date.now() - lift.analysisStartedAt) < ANALYZE_TTL_MS) {
                startAnalyzePoll(lift); // already started previously
              } else if (hasActiveAnalyzeJob(lift.id)) {
                // defer kicking analyze
                setTimeout(() => { void processLiftPipeline(lift, 'analyze', lift.retryStage); }, 4000);
              } else {
                void processLiftPipeline(lift, 'analyze', lift.retryStage);
              }
            } else {
              void processLiftPipeline(lift, stage);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to hydrate loading lifts:', error);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Auto-persist loading lifts whenever state changes (with debouncing)
  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    
    persistTimer.current = setTimeout(() => {
      void saveLoadingLifts(allLoadingLifts);
    }, 200); // Small debounce to avoid chatty writes
    
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [allLoadingLifts]);

  // Listen for background/foreground to abort long-running requests and catch up progress
  useEffect(() => {
    // Catch up immediately at boot
    tickProgressFromClock();

    const sub = AppState.addEventListener('change', s => {
      if (appState.current === 'active' && s.match(/inactive|background/)) {
        // App is going to background, abort any ongoing analysis
        analyzeAbortRef.current?.abort();
      } else if (s === 'active') {
        // App is coming to foreground, catch up progress based on wall clock
        tickProgressFromClock();

        // Ensure we resume any analyze cards without ever showing error
        setTimeout(() => {
          latestLiftsRef.current.forEach(l => {
            if (l.pipelineStage === 'analyze' && l.status !== 'completed' && !inflight.current.has(l.id)) {
              safeUpdateLift(l.id, x => ({ ...x, status: 'processing', errorMessage: 'Resuming…' }));
              void processLiftPipeline(l, 'analyze', l.retryStage);
            }
          });
        }, 200);
      }
      appState.current = s;
    });
    return () => sub.remove();
  }, []);

  // Optional: Update progress every second while active for smooth animation
  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    id = setInterval(() => { 
      if (AppState.currentState === 'active') {
        tickProgressFromClock(); 
      }
    }, 1000);
    return () => { if (id) clearInterval(id); };
  }, []);



  // Call backend to analyze the lift
  const analyzeVideo = async (
    liftData: LoadingLiftData, 
    retryStage?: RetryStage
  ) => {
    const userId = await getUserId();
    if (!userId) return { success: false, error: 'CLIENT_NO_USERID' };

    analyzeAbortRef.current = new AbortController();
    try {
      const result = await analyzeLift(userId, liftData, retryStage, { signal: analyzeAbortRef.current.signal });
      return result;
    } catch (err: any) {
      const msg = String(err?.message || '');
      const isAbort = err?.name === 'AbortError' || /abort|cancell?ed/i.test(msg);
      if (isAbort) return { success: false, error: 'ABORT' };
      // Any thrown client-side issue is soft
      return { success: false, error: 'CLIENT_THROW' };
    }
  };

  const addLoadingLift = async (liftData: Omit<LoadingLiftData, 'id' | 'isComplete' | 'status'>): Promise<string> => {
    const liftId = Date.now().toString();
    
    // Check if we already have a lift with the same video source to prevent duplicates
    const existingLift = allLoadingLifts.find(lift => 
      lift.sourceVideoUri === liftData.videoLink || 
      lift.videoLink === liftData.videoLink
    );
    
    if (existingLift && existingLift.status !== 'error') {
      return existingLift.id;
    }

    const now = Date.now();
    const startProg = 0.02;
    const newLift: LoadingLiftData = {
      ...liftData,
      id: liftId,
      isComplete: false,
      status: 'uploading',
      pipelineStage: 'upload_video',
      failureStage: undefined,
      sourceVideoUri: liftData.videoLink,
      sourceThumbnailUri: liftData.thumbnailUri,
      uploadedVideoUrl: undefined,
      uploadedThumbnailUrl: undefined,
      uiProgress: startProg,
      simStartAt: now,
      simDurationMs: computeSimDurationMs(liftData.videoDurationSec),
      simStartProgress: startProg,
    };
    setAllLoadingLifts(prev => [newLift, ...prev]);
    
    // Fire-and-forget processing pipeline with fresh lift snapshot
    void processLiftPipeline(newLift);
    
    return liftId;
  };



  async function processLiftPipeline(
    initialLift: LoadingLiftData, 
    startStage?: PipelineStage,
    retryStage?: RetryStage
  ) {
    // ⚠️ FIRST THING: guard + lock to prevent re-entry for this lift
    if (inflight.current.has(initialLift.id)) {
      return; // already running a pipeline for this lift
    }
    
    inflight.current.add(initialLift.id);
    
    try {
      // Set processing state
      safeUpdateLift(initialLift.id, l => ({ 
        ...l, 
        status: 'processing', 
        errorMessage: undefined, 
        failureStage: undefined,
        simStartAt: l.simStartAt ?? Date.now(),
        simDurationMs: l.simDurationMs ?? computeSimDurationMs(l.videoDurationSec),
        simStartProgress: typeof l.simStartProgress === 'number'
          ? l.simStartProgress
          : (typeof l.uiProgress === 'number' ? Math.max(0.02, l.uiProgress) : 0.02),
      }));

      const userId = await getUserId();
      if (!userId) {
        safeUpdateLift(initialLift.id, l => ({ ...l, status: 'error', failureStage: startStage ?? 'upload_video', errorMessage: 'No userId available' }));
        return;
      }

      // Keep a local, authoritative snapshot
      let current = { ...initialLift } as LoadingLiftData;

      // Stage 1: Upload Video
      try {
        setAllLoadingLifts(prev => prev.map(lift => lift.id === current.id ? { 
          ...lift, 
          pipelineStage: 'upload_video'
        } : lift));
        
        // Only upload video if we don't already have a successful upload URL
        if (!current.uploadedVideoUrl) {
          const videoSource = current.sourceVideoUri ?? current.videoLink;
          const { publicUrl: videoUrl } = await uploadLiftVideo(userId, current.id, videoSource, current.assetId);
          
          current.uploadedVideoUrl = videoUrl;
          setAllLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, uploadedVideoUrl: videoUrl } : l));
        }
      } catch (error) {
        if (isTransientError(error)) {
          // For transient errors, keep processing and show retryable message
          safeUpdateLift(current.id, l => ({
            ...l,
            status: 'processing',
            errorMessage: 'Network issue - will retry automatically...'
          }));
          // Schedule a retry after a short delay
          setTimeout(() => {
            if (!inflight.current.has(current.id)) {
              void processLiftPipeline(current, 'upload_video');
            }
          }, 2000);
          return;
        } else {
          // Non-transient upload failures are also SOFT (never show error card)
          safeUpdateLift(current.id, l => ({
            ...l,
            status: 'processing',
            errorMessage: 'Upload issue — retrying…',
          }));
          inflight.current.delete(current.id);
          setTimeout(() => { void processLiftPipeline(current, 'upload_video'); }, 3000);
          return;
        }
      }

      // Stage 2: Upload Thumbnail
      try {
        setAllLoadingLifts(prev => prev.map(lift => lift.id === current.id ? { 
          ...lift, 
          pipelineStage: 'upload_thumbnail'
        } : lift));
        
        // Only upload thumbnail if we don't already have a successful upload URL
        if (!current.uploadedThumbnailUrl) {
          const thumbSource = current.sourceThumbnailUri ?? current.thumbnailUri;
          const { publicUrl: thumbUrl } = await uploadLiftThumbnail(userId, current.id, thumbSource);
          
          current.uploadedThumbnailUrl = thumbUrl;
          setAllLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, uploadedThumbnailUrl: thumbUrl } : l));
        }
      } catch (error) {
        if (isTransientError(error)) {
          // For transient errors, keep processing and show retryable message
          safeUpdateLift(current.id, l => ({
            ...l,
            status: 'processing',
            errorMessage: 'Network issue - will retry automatically...'
          }));
          // Schedule a retry after a short delay
          setTimeout(() => {
            if (!inflight.current.has(current.id)) {
              void processLiftPipeline(current, 'upload_thumbnail');
            }
          }, 2000);
          return;
        } else {
          // Non-transient upload failures are also SOFT (never show error card)
          safeUpdateLift(current.id, l => ({
            ...l,
            status: 'processing',
            errorMessage: 'Upload issue — retrying…',
          }));
          inflight.current.delete(current.id);
          setTimeout(() => { void processLiftPipeline(current, 'upload_thumbnail'); }, 3000);
          return;
        }
      }

      // Stage 3: Analyze
      setAllLoadingLifts(prev => prev.map(lift => lift.id === current.id ? { 
        ...lift, 
        pipelineStage: 'analyze'
      } : lift));
      
      // Ensure we have both video and thumbnail URLs before analysis
      const videoUrl = current.uploadedVideoUrl ?? current.videoLink;
      const thumbUrl = current.uploadedThumbnailUrl ?? current.thumbnailUri;
      
      if (!videoUrl || !thumbUrl) {
        // Instead of hard error, keep processing (or mark retryable) – missing prerequisites usually means a race
        safeUpdateLift(current.id, l => ({
          ...l,
          status: 'processing', // don't flip to error
          errorMessage: 'Waiting for uploads to complete…'
        }));
        return; // exit gracefully; caller/hydrator can re-invoke
      }

      // Check if another lift is currently analyzing (serialization guard)
      const shouldDefer = hasActiveAnalyzeJob(current.id);

      if (shouldDefer && !current.analysisStartedAt) {
        // Don't call analyze yet — queue a retry and keep the card in "processing"
        safeUpdateLift(current.id, l => ({ ...l, status: 'processing', errorMessage: 'Queued — waiting for previous analysis' }));
        // let this invocation end so the "inflight" Set releases in finally{}
        inflight.current.delete(current.id);
        setTimeout(() => { void processLiftPipeline(current, 'analyze', retryStage); }, 4000);
        return;
      }

      // If we recently kicked off analyze, DO NOT call the API again — just poll.
      const freshKick = typeof current.analysisStartedAt === 'number'
        && (Date.now() - current.analysisStartedAt) < ANALYZE_TTL_MS;

      if (freshKick) {
        // make sure polling is running
        startAnalyzePoll(current);
        return;
      }

      // First-time kick: mark start time, call API once (idempotent), and start polling.
      const liftForAnalysis: LoadingLiftData = {
        ...current,
        videoLink: videoUrl,
        thumbnailUri: thumbUrl,
        analysisStartedAt: Date.now(),
      };

      setAllLoadingLifts(prev => prev.map(l =>
        l.id === current.id ? { ...l, analysisStartedAt: liftForAnalysis.analysisStartedAt } : l
      ));
      // persist immediately so a crash/resume knows we already started
      void saveLoadingLifts(
        allLoadingLifts.map(l => l.id === current.id ? { ...l, analysisStartedAt: liftForAnalysis.analysisStartedAt } : l)
      );

      // start polling right away (even if the call is still running)
      startAnalyzePoll(liftForAnalysis);

      // make the call once, pass abort signal & idempotency key under the hood
      const result = await analyzeVideo(liftForAnalysis, retryStage);
      
      if (isCompletedNow(current.id)) return;
      
      if (!result.success) {
        if (isCompletedNow(current.id)) return;

        // If backend already wrote the row, finish from DB
        if (current.assetId) {
          const found = await searchLiftByAssetId(current.assetId);
          if (found) {
            const mapped = await mapApiDataToFinalData({
              id: found.id,
              is_favourite: found.isFavourite,
              lift_type: found.liftType,
              lift_date: found.liftDate,
              lift_time: found.liftTime,
              weight_value: found.weightValue,
              reps: found.reps,
              thumbnail_url: found.thumbnailURL,
              analysis: found.analysis,
            });
            markCompleted(current.id, mapped);
            invalidateUserCheckIns();
            return;
          }
        }

        // Hard server errors → show error card
        if (HARD_API_ERRORS.has(String(result.error))) {
          const err = String(result.error);
          safeUpdateLift(current.id, l => ({
            ...l,
            status: 'error' as const,
            failureStage: 'analyze' as const,
            errorMessage:
              err === 'NO_GYM_VIDEO_FOUND' ? 'No lift found' :
              err === 'WRONG_MOVEMENT'     ? 'Lift mismatch' :
              'Analysis failed. Please try again.',
            retryStage: result.stage
          }));
          // Optional: auto-delete only for those two well-defined cases
          if (err === 'NO_GYM_VIDEO_FOUND' || err === 'WRONG_MOVEMENT') {
            void autoDeleteErrorLift(current.id);
          }
          return;
        }

        // Everything else (ABORT, TIMEOUT, 5xx, client throw, etc.) is SOFT
        safeUpdateLift(current.id, l => ({
          ...l,
          status: 'processing',
          errorMessage:
            result.error === 'ABORT' ? 'Paused — resuming…' :
            'Temporary issue — retrying…',
        }));
        // backoff/resume
        const prev = analyzeAttempts.current.get(current.id) ?? 0;
        const delay = ANALYZE_BACKOFF[Math.min(prev, ANALYZE_BACKOFF.length - 1)];
        analyzeAttempts.current.set(current.id, prev + 1);
        inflight.current.delete(current.id);
        setTimeout(() => { void processLiftPipeline(current, 'analyze', retryStage); }, delay);
        return;
      }
      
      // success path - clear retry attempts
      analyzeAttempts.current.delete(current.id);
      
      // Store final data & flip to 'completed' (keep the same id so the UI swaps content seamlessly)
      if (result.data) {
        const mapped = await mapApiDataToFinalData(result.data);
        markCompleted(current.id, mapped);   // <- single place, no flicker
      }
      
      // Check if streak should be shown and trigger modal
      if (result.is_streak === true) {
        openStreakModal();
      }
      
      // pull latest lifts from backend (so ILiftData exists for future screens)
      void (async () => { try { await refreshLifts(); } catch (_) {} })();
      invalidateUserCheckIns();
    } catch (error) {
      // Never show error card here — only analyze() hard server codes may do that
      if (!isCompletedNow(initialLift.id)) {
        safeUpdateLift(initialLift.id, l => ({
          ...l,
          status: 'processing',
          errorMessage: 'Temporary issue — retrying…'
        }));
        inflight.current.delete(initialLift.id);
        setTimeout(() => { void processLiftPipeline(initialLift, startStage ?? deriveStage(initialLift), retryStage); }, 1500);
      }
    } finally {
      // Always clean up the inflight set
      inflight.current.delete(initialLift.id);
    }
  }

  async function mapApiDataToFinalData(data: any): Promise<ILiftData> {
    // Sign the thumbnail URL
    const thumbKey = await extractObjectKeyFromUrl(data.thumbnail_url);
    const thumbnailURL = await signPath(thumbKey);
    
    // Sign feedback image URLs if they exist
    const rawFeedback: Array<{ imageURL: any; flaws: any; improvement: any }> = Array.isArray(data.analysis?.feedback) ? data.analysis.feedback : [];
    const signedFeedback = await Promise.all(
      rawFeedback.map(async (f) => {
        const feedbackKey = await extractObjectKeyFromUrl(typeof f.imageURL === 'string' ? f.imageURL : undefined);
        const signedUrl = await signPath(feedbackKey);
        return { ...f, imageURL: signedUrl ?? f.imageURL };
      })
    );

    return {
      id: data.id,
      isFavourite: !!data.is_favourite,
      liftType: data.lift_type,
      liftDate: data.lift_date,
      liftTime: data.lift_time,
      weightValue: Number(data.weight_value),
      reps: Number(data.reps),
      rawVideoURL: undefined, // Not needed for final data display
      poseVideoURL: undefined, // Not needed for final data display
      thumbnailURL: thumbnailURL ?? data.thumbnail_url ?? undefined,
      analysis: {
        accuracy: Number(data.analysis?.accuracy ?? 0),
        lineGraphValues: Array.isArray(data.analysis?.lineGraphValues) ? data.analysis.lineGraphValues : [],
        feedback: signedFeedback,
      },
    };
  }

  const completeLift = (id: string, analysisData?: any) => {
    // Check if this is the first lift for today's date and trigger streak modal
    const completedLift = allLoadingLifts.find(lift => lift.id === id);
    if (completedLift) {
      const today = new Date();
      const todayString = formatDateForLift(today);
      const liftDateString = formatDateForLift(new Date(completedLift.dateToday));
      
      // Check if this lift is for today's date
      if (liftDateString === todayString) {
        // Get all existing lifts for today from LiftDataContext
        const existingLiftsForToday = getLiftsByDate(today);
        
        // If this is the first lift for today (no existing lifts), trigger streak modal
        if (existingLiftsForToday.length === 0) {
          openStreakModal();
        }
      }
    }
    
    // Note: We no longer immediately remove the loading lift here
    // The UI will show the completed loading lift with finalData until it's cleaned up
    // This prevents the "pop" effect when transitioning from loading to final state
  };

  const retryLift = async (id: string) => {
    const lift = allLoadingLifts.find(l => l.id === id);
    if (!lift) {
      return;
    }

    // Prevent multiple simultaneous retries for the same lift
    if (lift.status === 'processing') {
      return;
    }

    // Determine stage to restart from based on what's already completed
    let stage: PipelineStage = 'upload_video';
    
    if (lift.failureStage) {
      // Use the failure stage if available
      stage = lift.failureStage;
    } else if (lift.uploadedVideoUrl && lift.uploadedThumbnailUrl) {
      // If both uploads are complete, start from analysis
      stage = 'analyze';
    } else if (lift.uploadedVideoUrl) {
      // If only video is uploaded, start from thumbnail
      stage = 'upload_thumbnail';
    } else {
      // Default to video upload
      stage = 'upload_video';
    }
    
    // Reset error and set processing
    safeUpdateLift(id, l => ({ ...l, status: 'processing', errorMessage: undefined, failureStage: undefined }));
    await processLiftPipeline(lift, stage, lift.retryStage);
  };

  const removeLift = (id: string) => {
    analyzeAttempts.current.delete(id);
    stopPoller(id);
    setAllLoadingLifts(prev => prev.filter(lift => lift.id !== id));
  };

  const removeLoadingLiftByFinalId = (finalId: string) => {
    setAllLoadingLifts(prev =>
      prev.filter(l => !(l.status === 'completed' && l.finalData?.id === finalId))
    );
  };

  const removeCompletedLift = (id: string) => {
    setCompletedLifts(prev => prev.filter(lift => lift.id !== id));
  };

  const updateLiftProgress = (id: string, progress: number) => {
    setAllLoadingLifts(prev => {
      const updated = prev.map(lift => 
        lift.id === id ? { ...lift, uiProgress: progress } : lift
      );
      // Immediately persist progress update
      void saveLoadingLifts(updated);
      return updated;
    });
  };

  const openStreakModal = () => {
    setShowStreakModal(true);
  };

  const closeStreakModal = () => {
    setShowStreakModal(false);
  };

  // Function to automatically delete error lifts in the background
  const autoDeleteErrorLift = async (liftId: string) => {
    try {
      // Call the storage delete API in the background
      const success = await deleteUserStorage(liftId);
      
      if (success) {
        // Mark this lift as auto-deleted for instant UI removal later
        setAutoDeletedLifts(prev => new Set([...prev, liftId]));
        // Invalidate user check-ins to refresh streak data
        invalidateUserCheckIns();
      }
    } catch (error) {
      console.warn(`Failed to auto-delete lift ${liftId}:`, error);
    }
  };

  // All mock helpers removed; rely on backend data

  // Function to check if a lift has been auto-deleted
  const isLiftAutoDeleted = (liftId: string): boolean => {
    return autoDeletedLifts.has(liftId);
  };


  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up all pollers on unmount
      pollersRef.current.forEach((timer) => clearInterval(timer));
      pollersRef.current.clear();
    };
  }, []);

  return (
    <LoadingLiftsContext.Provider
      value={{
        loadingLifts,
        completedLifts,
        addLoadingLift,
        completeLift,
        removeLift,
        removeCompletedLift,
        retryLift,
        updateLiftProgress,
        showStreakModal,
        openStreakModal,
        closeStreakModal,
        isLiftAutoDeleted,
        removeLoadingLiftByFinalId,
      }}
    >
      {children}
    </LoadingLiftsContext.Provider>
  );
}

export function useLoadingLifts() {
  const context = useContext(LoadingLiftsContext);
  if (context === undefined) {
    throw new Error('useLoadingLifts must be used within a LoadingLiftsProvider');
  }
  return context;
} 