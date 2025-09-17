import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { AppState, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { ILiftData } from './LiftDataContext';
import { getUserId } from '../services/storageService';
import { uploadLiftVideo, uploadLiftThumbnail } from '../services/VideoUploadService';
import { useLiftData, extractObjectKeyFromUrl, signPath } from './LiftDataContext';
import { useSelectedDate } from './SelectedDateContext';
import { useUserCheckIns } from './UserCheckInsContext';
import { usePurchases } from './PurchasesContext';
import { loadLoadingLifts, saveLoadingLifts } from '../services/loadingLiftsStorage';
import { eventBus, AppEvents, LiftReadyPayload, LiftFailedPayload } from '../services/event-bus';
import { hapticFeedback } from '../utils/haptic';
import { LoadingLiftData, LoadingLiftsContextType, PipelineStage, RetryStage } from '../types/Lifts.d';
import { autoDeleteLiftErrorCardData, searchLiftByAssetId, lookupLift, findLiftFailure } from '../services/liftService';
import { enqueueLiftAnalysis, getJobStatus, deleteJob } from '../services/liftApi';

const LoadingLiftsContext = createContext<LoadingLiftsContextType | undefined>(undefined);

interface LoadingLiftsProviderProps {
  children: ReactNode;
}

export function LoadingLiftsProvider({ children }: LoadingLiftsProviderProps) {
  const [allLoadingLifts, setAllLoadingLifts] = useState<LoadingLiftData[]>([]);
  const [completedLifts, setCompletedLifts] = useState<ILiftData[]>([]);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [isHomeActive, setIsHomeActive] = useState<boolean>(false);
  const [autoDeletedLifts, setAutoDeletedLifts] = useState<Set<string>>(new Set());
  const { liftData, refreshLifts, formatDateForLift, getLiftById, addLift, updateLift, invalidateAndRefetch: invalidateAndRefetchLiftData } = useLiftData();
  const { selectedDate } = useSelectedDate();
  const { optimisticAddToday, invalidateAndRefetch: invalidateUserCheckIns } = useUserCheckIns();
  const { hasHdVideos } = usePurchases();
  const persistTimer = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);
  const streakShownForRef = useRef(new Set<string>());
  // keep latest snapshot in sync
  const latestLiftsRef = useRef<LoadingLiftData[]>([]);
  useEffect(() => { latestLiftsRef.current = allLoadingLifts; }, [allLoadingLifts]);

  const PENDING_KEY = 'pendingLiftCompletions';
  const PENDING_FAIL_KEY = 'pendingLiftFailures';
  const INFLIGHT_KEY = 'inflightAssetIds';

  // Global sweeper configuration
  const SWEEP_MS = 6000; // poll every 6s
  const PROGRESS_MAX_BEFORE_DONE = 0.95;
  const sweeperRef = useRef<NodeJS.Timeout | null>(null);

  // Strong per-lift lock + queued retries
  const inflightRef = useRef(new Set<string>());
  const retryTimersRef = useRef(new Map<string, NodeJS.Timeout>());
  const queuedRef = useRef(new Set<string>()); // ids with a scheduled retry
  const deletingRef = useRef(new Set<string>()); // guard: auto-delete once per lift
  


  // Utility helpers
  const isLockedOrQueued = (id: string) =>
    inflightRef.current.has(id) || queuedRef.current.has(id);

  const tryLock = (id: string) => {
    if (inflightRef.current.has(id) || queuedRef.current.has(id)) return false;
    inflightRef.current.add(id);
    return true;
  };

  const releaseLock = (id: string) => {
    inflightRef.current.delete(id);
  };

  const cancelRetry = (id: string) => {
    const t = retryTimersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      retryTimersRef.current.delete(id);
    }
    queuedRef.current.delete(id);
  };

  const scheduleRetry = (
    id: string,
    stage: PipelineStage,
    ms: number,
    retryStage?: RetryStage
  ) => {
    // prevent multiple timers
    cancelRetry(id);
    queuedRef.current.add(id);
    const t = setTimeout(() => {
      // release the "queued" flag and lock just-in-time for the next run
      queuedRef.current.delete(id);
      releaseLock(id);
      retryTimersRef.current.delete(id);
      // Retry is now handled by re-enqueuing in the retryLift function
      // No need to call processLiftPipeline anymore
    }, ms);
    retryTimersRef.current.set(id, t);
  };

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
          ? {
              ...l,
              finalData: mapped,
              status: 'completed',
              isComplete: true,             // <-- critical
              uiProgress: 1,
              pipelineStage: 'analyze',
              errorMessage: undefined,
              failureStage: undefined,
            }
          : l
      )
    );
    
    // Invalidate LiftDataContext to fetch fresh data when lift completes
    try {
      invalidateAndRefetchLiftData();
    } catch (_) {}
  };

  // Retry configuration
  const ANALYZE_BACKOFF = [2000, 4000, 8000]; // ms
  const isTransientErrorCode = (c?: string) =>
    !!c && /(NETWORK|TIMEOUT|HTTP_5\d\d|HTTP_429|BAD_JSON|ABORT|ABORTED|CANCEL|CANCELLED)/i.test(c);
  
  // Only these server codes may show an error card
  const HARD_API_ERRORS = new Set([
    'NO_GYM_VIDEO_FOUND',
    'NO_LIFT_FOUND',
    'WRONG_MOVEMENT',
    'ERROR_OCCURED',       // keep your server spelling
  ]);
  
  // Polling configuration
  const ANALYZE_TTL_MS = 10 * 60 * 1000;   // consider "in-progress" for up to 10m

  // Only "soft fail" while analysis is in flight
  const SOFT_FAIL_TTL_MS = ANALYZE_TTL_MS; // during this window, don't flip to hard error

  const softFail = (id: string, msg: string) => {
    safeUpdateLift(id, l => ({
      ...l,
      status: 'processing',
      errorMessage: msg || 'Temporary issue — retrying…'
    }));
  };

  // Map backend job error codes to UI error messages used by LiftCard
  function mapJobErrorToUiMessage(errorCode?: string | null): string {
    if (!errorCode) return 'Error occurred';
    const code = String(errorCode).toUpperCase();
    if (code.includes('WRONG_MOVEMENT')) return 'Lift mismatch';
    if (code.includes('NO_LIFT_FOUND') || code.includes('NO_GYM_VIDEO_FOUND')) return 'No lift found';
    return 'Error occurred';
  }

  // Utility function to compute simulation duration
  const computeSimDurationMs = (videoDurationSec?: number) =>
    (((videoDurationSec || 10) * 4) + 30) * 1000; // same formula as before

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

  // Wait until the final lift appears in LiftDataContext, with small retries
  async function waitForLiftInContext(finalId: string, attempts: number = 20, delayMs: number = 200): Promise<boolean> {
    for (let i = 0; i < attempts; i++) {
      try {
        const exists = !!getLiftById(finalId);
        if (exists) return true;
      } catch (_) {}
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    // Final check
    try {
      return !!getLiftById(finalId);
    } catch (_) {
      return false;
    }
  }

  // Global sweeper for all analysis completion using enqueue/poll pattern
  const globalSweeper = async () => {
    if (AppState.currentState !== 'active') return;
    const userId = await getUserId();
    if (!userId) return;
    
    const snapshot = latestLiftsRef.current; // IMPORTANT: use the full list, not filtered by date

    for (const l of snapshot) {
      if (l.status === 'completed') continue;

      const key = l.assetId;
      if (!key) {
        console.warn('[globalSweeper] missing assetId for lift', l.id);
        continue;
      }

      // 1) Try to find finished lift row
      const found = await lookupLift(key, userId);
      if (found) {
        // Before marking complete, check if server flagged this lift as failure
        const failure = await findLiftFailure({ userId, liftId: found.id as string, assetId: key });
        if (failure && failure.error) {
          const message = mapJobErrorToUiMessage(failure.error);
          // Flip to error card instead of completing
          safeUpdateLift(l.id, x => ({
            ...x,
            status: 'error',
            failureStage: 'analyze',
            errorMessage: message,
            uiProgress: x.uiProgress ?? 0.02,
          }));
          // Remove from inflight set in storage
          try {
            const arr: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]');
            const next = arr.filter(k => k !== key);
            await AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(next));
          } catch {}
          // Optional auto-delete
          if (['WRONG_MOVEMENT','NO_GYM_VIDEO_FOUND','NO_LIFT_FOUND','ERROR_OCCURED'].includes(String(failure.error).toUpperCase())) {
            void autoDeleteErrorLift(l.id);
          }
        } else {
          const mapped = await mapApiDataToFinalData(found);
          // Immediately seed LiftDataContext with the completed server lift to avoid waiting on refetch
          try {
            const existing = getLiftById(mapped.id);
            if (existing) {
              updateLift(mapped.id, mapped);
            } else {
              addLift(mapped);
            }
          } catch (_) {}
          markCompleted(l.id, mapped); // sets status=completed, uiProgress=1
          // Streak write may have occurred; show instant optimistic bump
          try {
            const uid = await getUserId();
            if (uid) try { optimisticAddToday?.({ userId: uid }); } catch (_) {}
          } catch (_) {}
          // If jobs API marks streak, invalidate check-ins to fetch latest streak value
          try {
            const job = await getJobStatus(key, userId, l.id);
            if (job?.is_streak && !streakShownForRef.current.has(key)) {
              try {
                const uid2 = await getUserId();
                if (uid2) try { optimisticAddToday?.({ userId: uid2 }); } catch (_) {}
              } catch (_) {}
              streakShownForRef.current.add(key);
            }
          } catch (_) {}
          try { await deleteJob(key, userId); } catch (_) {}
          // Ensure LiftDataContext also refetches to refresh signatures/urls if needed
          try { await invalidateAndRefetchLiftData(); } catch (_) {}
          // Wait for the final lift to be visible in LiftDataContext before pruning
          let isPresent = false;
          try { isPresent = await waitForLiftInContext(mapped.id); } catch (_) { isPresent = false; }
          // PRUNE only when we can see the final card in LiftDataContext
          if (isPresent) {
            setAllLoadingLifts(prev => prev.filter(x => x.id !== l.id));
          }
        }
        continue;
      }

      // 2) Show server job status/progress to the user
      const job = await getJobStatus(key, userId, l.id);
      const status = String(job?.status || '').toLowerCase();
      if (status === 'failed') {
        const message = mapJobErrorToUiMessage(job?.error);
        safeUpdateLift(l.id, x => ({ ...x, status: 'error', errorMessage: message, failureStage: (job?.stage as PipelineStage) || 'analyze' }));
        // Remove from inflight set in storage
        try {
          const arr: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]');
          const next = arr.filter(k => k !== key);
          await AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(next));
        } catch {}
        // Optional: auto-delete for well-defined error cases
        if (job?.error && ['WRONG_MOVEMENT','NO_GYM_VIDEO_FOUND','NO_LIFT_FOUND'].includes(String(job.error).toUpperCase())) {
          void autoDeleteErrorLift(l.id);
        }
      } else if (status === 'running' || status === 'queued') {
        const pct = typeof job.progress === 'number' ? job.progress / 100 : (l.uiProgress ?? 0.02);
        const capped = Math.min(PROGRESS_MAX_BEFORE_DONE, Math.max(l.uiProgress ?? 0.02, pct));
        updateLiftProgress(l.id, capped);
      } else if (status === 'succeeded' || status === 'success' || status === 'completed') {
        // If server reports success, check lift_failures proactively in case API succeeded but result was invalid
        try {
          const uid = await getUserId();
          if (uid) {
            const failure = await findLiftFailure({ userId: uid, assetId: key });
            if (failure && failure.error) {
              const message = mapJobErrorToUiMessage(failure.error);
              safeUpdateLift(l.id, x => ({ ...x, status: 'error', errorMessage: message, failureStage: 'analyze' }));
              // Remove inflight since we will not complete this card
              try {
                const arr: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]');
                const next = arr.filter(k => k !== key);
                await AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(next));
              } catch {}
              // Optional auto-delete
              if (['WRONG_MOVEMENT','NO_GYM_VIDEO_FOUND','NO_LIFT_FOUND','ERROR_OCCURED'].includes(String(failure.error).toUpperCase())) {
                void autoDeleteErrorLift(l.id);
              }
              // Skip the success path
            } else {
              // Advance UI to 100% and let the next lookup cycle finish completion mapping
              updateLiftProgress(l.id, 1);
              if (job?.is_streak && !streakShownForRef.current.has(key)) {
                try {
                  const uid3 = await getUserId();
                  if (uid3) try { optimisticAddToday?.({ userId: uid3 }); } catch (_) {}
                } catch (_) {}
                streakShownForRef.current.add(key);
              }
              try { await refreshLifts(); } catch (_) {}
            }
          } else {
            // Fallback: no user, just advance
            updateLiftProgress(l.id, 1);
          }
        } catch (_) {
          updateLiftProgress(l.id, 1);
        }
      }
    }
  };

  // Instant completion on push signal
  useEffect(() => {
    const off = eventBus.on(AppEvents.LiftReady, async (p?: LiftReadyPayload) => {
      try {
        const liftId = p?.liftId;
        if (!liftId) return;
        // If we already have a loading card for this final lift, map immediately from API
        const local = latestLiftsRef.current.find(x => x.status !== 'completed');
        // Fetch the finished lift directly by id and map to final data
        const { data: row } = await supabase
          .from('lifts')
          .select('id,user_id,is_favourite,lift_type,lift_date,lift_time,metric_weight,reps,thumbnail_url,analysis,asset_id,pose_video_url,raw_video_url')
          .eq('id', liftId)
          .maybeSingle();
        if (!row) return;
        // Check lift_failures before completing; API may succeed but result deemed invalid
        try {
          const uid = await getUserId();
          if (uid) {
            const failure = await findLiftFailure({ userId: uid, liftId });
            if (failure && failure.error) {
              const assetId: string | undefined = (row as any)?.asset_id;
              if (assetId) {
                await applyFailureToLocalCard({ assetId, error: failure.error, stage: 'analyze' });
              } else if (local) {
                const message = mapJobErrorToUiMessage(failure.error);
                safeUpdateLift(local.id, l => ({ ...l, status: 'error', failureStage: 'analyze', errorMessage: message }));
              }
              return; // do not mark as completed
            }
          }
        } catch (_) {}
        const mapped = await mapApiDataToFinalData(row);
        // Seed LiftDataContext so the details screen works instantly
        try {
          const existing = getLiftById(mapped.id);
          if (existing) updateLift(mapped.id, mapped); else addLift(mapped);
        } catch (_) {}
        // If there's a matching local loading lift by final id, complete it; otherwise just ensure list refresh
        if (local) {
          markCompleted(local.id, mapped);
        }
        // Optimistically bump today's check-in and refresh check-ins cache
        try {
          const uid = await getUserId();
          if (uid) {
            try { optimisticAddToday({ userId: uid }); } catch (_) {}
            try { invalidateUserCheckIns({ userId: uid }); } catch (_) {}
          }
        } catch (_) {}
        // Invalidate LiftDataContext to ensure fresh data is fetched
        try {
          invalidateAndRefetchLiftData();
        } catch (_) {}
        try { await refreshLifts(); } catch (_) {}
      } catch (_) {}
    });
    return () => { try { off(); } catch {} };
  }, [addLift, updateLift, getLiftById, refreshLifts]);

  // Instant failure on push signal
  useEffect(() => {
    const off = eventBus.on(AppEvents.LiftFailed, async (p?: LiftFailedPayload) => {
      try {
        const uid = await getUserId();
        if (!uid) return;
        const code = p?.error ? String(p.error).toUpperCase() : undefined;
        // Prefer assetId to match local loading card quickly
        let targetAssetId = p?.assetId;
        if (!targetAssetId && p?.liftId) {
          try {
            const { data } = await supabase
              .from('lifts')
              .select('asset_id')
              .eq('id', p.liftId)
              .eq('user_id', uid)
              .maybeSingle();
            targetAssetId = (data as any)?.asset_id ? String((data as any).asset_id) : undefined;
          } catch {}
        }

        const local = targetAssetId
          ? latestLiftsRef.current.find(x => x.assetId === targetAssetId && x.status !== 'completed')
          : latestLiftsRef.current.find(x => x.status !== 'completed');
        if (!local) return;

        const message = mapJobErrorToUiMessage(code);
        safeUpdateLift(local.id, l => ({
          ...l,
          status: 'error',
          failureStage: 'analyze',
          errorMessage: message,
          uiProgress: l.uiProgress ?? 0.02,
        }));

        // Remove from inflight so background sweep won't keep it
        try {
          const arr: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]');
          const next = targetAssetId ? arr.filter(k => k !== targetAssetId) : arr;
          await AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(next));
        } catch {}

        // Optional: auto-delete for well-defined cases
        if (code && ['WRONG_MOVEMENT','NO_GYM_VIDEO_FOUND','NO_LIFT_FOUND'].includes(code)) {
          try { await autoDeleteErrorLift(local.id); } catch {}
        }
      } catch (_) {}
    });
    return () => { try { off(); } catch {} };
  }, []);

  // On app load/foreground: immediately reconcile any loading cards with already-fetched final lifts in LiftDataContext
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!liftData?.length || !allLoadingLifts.length) return;
        // Build a map of thumbnail object key -> final ILiftData for quick lookup
        const pairs = await Promise.all(
          liftData.map(async (f) => {
            try {
              const key = await extractObjectKeyFromUrl(typeof (f as any).thumbnailURL === 'string' ? (f as any).thumbnailURL : undefined);
              return key ? ([key, f] as const) : null;
            } catch {
              return null;
            }
          })
        );
        const keyToFinal = new Map<string, ILiftData>();
        for (const p of pairs) if (p) keyToFinal.set(p[0], p[1]);

        const updates: Array<{ id: string; final: ILiftData }> = [];
        for (const l of allLoadingLifts) {
          if (l.status === 'completed') continue;
          const key = await extractObjectKeyFromUrl(l.uploadedThumbnailUrl);
          if (key && keyToFinal.has(key)) {
            const final = keyToFinal.get(key)!;
            updates.push({ id: l.id, final });
          }
        }
        if (cancelled || updates.length === 0) return;
        setAllLoadingLifts(prev => prev.map(l => {
          const hit = updates.find(u => u.id === l.id);
          if (!hit) return l;
          return {
            ...l,
            finalData: hit.final,
            status: 'completed',
            isComplete: true,
            uiProgress: 1,
            pipelineStage: 'analyze',
            errorMessage: undefined,
            failureStage: undefined,
          };
        }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [liftData, allLoadingLifts]);

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

  // Filter loading lifts to only show those matching the selected date (keep completed to swap content in place)
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

          // Drop any completed items from storage so only server lifts remain
          setAllLoadingLifts(prev => prev.filter(l => !(l.status === 'completed' || (l.finalData && l.status !== 'error'))));

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
                // For the new enqueue pattern, we just need to re-enqueue failed lifts
                // The retryLift function will handle this
              }
              return;
            }
            
            // Update status to processing to reflect we're resuming, but preserve progress
            safeUpdateLift(lift.id, l => ({ ...l, status: 'processing' }));
            
            // For the new enqueue pattern, the global sweeper will handle completion
            // No need to call processLiftPipeline anymore
          });

          // Track inflight assetIds for BackgroundFetch safety net
          const inflightAssetIds = stored
            .filter(l => l.status !== 'completed' && !!l.assetId)
            .map(l => l.assetId as string)
          await AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(inflightAssetIds))
        }
      } catch (error) {
        console.warn('Failed to hydrate loading lifts:', error);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Apply any pending completions cached by background tasks on app start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PENDING_KEY)
        if (!raw) return
        const pending: Array<{ assetId: string; lift: any }> = JSON.parse(raw)
        for (const p of pending) {
          const local = latestLiftsRef.current.find(x => x.assetId === p.assetId && x.status !== 'completed')
          if (local) {
            const mapped = await mapApiDataToFinalData(p.lift)
            markCompleted(local.id, mapped)
            // Realtime will handle streak updates; no explicit invalidation needed
            // Try to trigger streak if the job marks it
            try {
              const userId = await getUserId();
              if (userId) {
                const job = await getJobStatus(p.assetId, userId, local.id)
                if (job?.is_streak && !streakShownForRef.current.has(p.assetId)) {
                  streakShownForRef.current.add(p.assetId)
                }
              }
            } catch (_) {}
          }
        }
        // Invalidate LiftDataContext to ensure fresh data is fetched after applying pending completions
        try {
          invalidateAndRefetchLiftData();
        } catch (_) {}
        await AsyncStorage.removeItem(PENDING_KEY)
        // Ensure lifts are refreshed after applying pending completions
        try { await refreshLifts(); } catch (_) {}
      } catch (_) {}
    })()
  }, [])

  // Helper to apply a failure payload to local card
  const applyFailureToLocalCard = useCallback(async (f: { assetId: string; error?: string | null; stage?: string }) => {
    const local = latestLiftsRef.current.find(x => x.assetId === f.assetId && x.status !== 'completed');
    if (!local) return false;

    const msg = mapJobErrorToUiMessage(f.error);
    safeUpdateLift(local.id, l => ({
      ...l,
      status: 'error',
      failureStage: (f.stage as PipelineStage) || 'analyze',
      errorMessage: msg,
      uiProgress: l.uiProgress ?? 0.02,
    }));

    // Remove from inflight set in storage so BackgroundFetch won’t keep sweeping it
    try {
      const arr: string[] = JSON.parse((await AsyncStorage.getItem(INFLIGHT_KEY)) || '[]');
      const next = arr.filter(k => k !== f.assetId);
      await AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(next));
    } catch {}

    // Optional: auto-delete for well-defined cases
    if (f?.error && ['WRONG_MOVEMENT', 'NO_GYM_VIDEO_FOUND', 'NO_LIFT_FOUND'].includes(String(f.error).toUpperCase())) {
      try { await autoDeleteErrorLift(local.id); } catch {}
    }
    return true;
  }, []);

  // Apply any pending failures cached by background tasks on app start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PENDING_FAIL_KEY);
        if (!raw) return;
        const pending: Array<{ assetId: string; error?: string; stage?: string }> = JSON.parse(raw);
        for (const f of pending) {
          await applyFailureToLocalCard(f);
        }
        await AsyncStorage.removeItem(PENDING_FAIL_KEY);
      } catch {}
    })();
  }, [applyFailureToLocalCard]);

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

  // Listen for background/foreground to catch up progress
  useEffect(() => {
    // Catch up immediately at boot
    tickProgressFromClock();

    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        // App is coming to foreground, catch up progress based on wall clock
        tickProgressFromClock();

        // Apply any pending completions cached by background tasks
        void (async () => {
          try {
            const raw = await AsyncStorage.getItem(PENDING_KEY)
            if (raw) {
              const pending: Array<{ assetId: string; lift: any }> = JSON.parse(raw)
              for (const p of pending) {
                const local = latestLiftsRef.current.find(x => x.assetId === p.assetId && x.status !== 'completed')
                if (local) {
                  const mapped = await mapApiDataToFinalData(p.lift)
                  markCompleted(local.id, mapped)
                  // Realtime will handle streak updates after foreground
                  // Try to trigger streak if the job marks it
                  try {
                    const userId = await getUserId();
                    if (userId) {
                      const job = await getJobStatus(p.assetId, userId, local.id)
                      if (job?.is_streak && !streakShownForRef.current.has(p.assetId)) {
                        streakShownForRef.current.add(p.assetId)
                      }
                    }
                  } catch (_) {}
                }
              }
              // Invalidate LiftDataContext to ensure fresh data is fetched after applying pending completions
              try {
                invalidateAndRefetchLiftData();
              } catch (_) {}
              await AsyncStorage.removeItem(PENDING_KEY)
              // Ensure lifts are refreshed after applying pending completions
              try { await refreshLifts(); } catch (_) {}
            }
          } catch (_) {}
        })()

        // Apply any pending failures cached while backgrounded
        void (async () => {
          try {
            const raw = await AsyncStorage.getItem(PENDING_FAIL_KEY);
            if (!raw) return;
            const pending: Array<{ assetId: string; error?: string; stage?: string }> = JSON.parse(raw);
            for (const f of pending) {
              await applyFailureToLocalCard(f);
            }
            await AsyncStorage.removeItem(PENDING_FAIL_KEY);
          } catch {}
        })()

        // Note: Removed refreshLifts() call as it was causing lifts to disappear when reopening home screen
        // The LiftDataContext will handle data fetching naturally

        // One-shot direct Supabase sweep for any inflight items in case a push was missed
        void (async () => {
          try {
            const inflight = latestLiftsRef.current.filter(l => l.status !== 'completed' && !!l.assetId)
            await Promise.all(
              inflight.map(async (l) => {
                const key = l.assetId as string
                const { data: lift } = await supabase
                  .from('lifts')
                  .select('id,user_id,is_favourite,lift_type,lift_date,lift_time,metric_weight,reps,thumbnail_url,analysis,asset_id')
                  .eq('asset_id', key)
                  .maybeSingle()
                if (lift) {
                  const mapped = await mapApiDataToFinalData(lift)
                  markCompleted(l.id, mapped)
                  // Realtime will deliver streak updates; no explicit invalidation needed
                }
              })
            )
            // Invalidate LiftDataContext after sweep to ensure fresh data is fetched
            try {
              invalidateAndRefetchLiftData();
            } catch (_) {}
          } catch (_) {}
        })()
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

  // Global sweeper effect - runs for the lifetime of the provider
  useEffect(() => {
    // boot + interval
    globalSweeper();
    sweeperRef.current = setInterval(globalSweeper, SWEEP_MS);

    return () => {
      if (sweeperRef.current) clearInterval(sweeperRef.current);
      sweeperRef.current = null;
    };
  }, []);

  // Realtime: subscribe to finished lifts for instant completion mapping
  useEffect(() => {
    let channel: any = null;
    (async () => {
      try {
        const uid = await getUserId();
        if (!uid) return;
        channel = supabase
          .channel(`lifts:${uid}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'lifts', filter: `user_id=eq.${uid}` },
            async (payload: any) => {
              try {
                const row: any = payload?.new ?? payload?.old;
                const assetId: string | undefined = row?.asset_id ?? row?.assetId;
                if (!assetId) return;
                const local = latestLiftsRef.current.find(x => x.assetId === assetId && x.status !== 'completed');
                if (!local) return;
                const mapped = await mapApiDataToFinalData(row);
                // Seed LiftDataContext as well
                try {
                  const existing = getLiftById(mapped.id);
                  if (existing) updateLift(mapped.id, mapped); else addLift(mapped);
                } catch (_) {}
                markCompleted(local.id, mapped);
                // Invalidate LiftDataContext to ensure fresh data is fetched
                try {
                  invalidateAndRefetchLiftData();
                } catch (_) {}
              } catch (_) {}
            }
          )
          .subscribe();
      } catch (_) {}
    })();
    return () => { if (channel) try { supabase.removeChannel(channel); } catch {} };
  }, []);

  // Realtime: subscribe to jobs for instant failure updates
  useEffect(() => {
    let channel: any = null;
    (async () => {
      try {
        const uid = await getUserId();
        if (!uid) return;
        channel = supabase
          .channel(`jobs:${uid}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'jobs', filter: `user_id=eq.${uid}` },
            async (payload: any) => {
              try {
                const row: any = payload?.new ?? payload?.old;
                const status: string = String(row?.status || '').toLowerCase();
                const assetId: string | undefined = row?.job_id ?? row?.asset_id ?? row?.assetId ?? row?.key;
                if (!assetId) return;
                if (status === 'failed') {
                  await applyFailureToLocalCard({ assetId, error: row?.error ?? row?.error_code ?? row?.errorCode, stage: row?.stage });
                } else if (status === 'succeeded' || status === 'success' || status === 'completed') {
                  const local = latestLiftsRef.current.find(x => x.assetId === assetId && x.status !== 'completed');
                  if (local) updateLiftProgress(local.id, 1);
                }
              } catch (_) {}
            }
          )
          .subscribe();
      } catch (_) {}
    })();
    return () => { if (channel) try { supabase.removeChannel(channel); } catch {} };
  }, [applyFailureToLocalCard]);

  // Keep inflight assetIds in storage up-to-date for BackgroundFetch
  useEffect(() => {
    const inflight = allLoadingLifts
      .filter(l => l.status !== 'completed' && !!l.assetId)
      .map(l => l.assetId as string)
    void AsyncStorage.setItem(INFLIGHT_KEY, JSON.stringify(inflight))
  }, [allLoadingLifts])




  const addLoadingLift = async (liftData: Omit<LoadingLiftData, 'id' | 'isComplete' | 'status' | 'pipelineStage'>): Promise<string> => {
    const liftId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!liftData.assetId) {
      Alert.alert('Error', 'An error occurred while processing your video. Please try again.');
      const now = Date.now();
      const startProg = 0.02;
      const errLift: LoadingLiftData = {
        ...liftData,
        id: liftId,
        status: 'error',
        isComplete: false,
        pipelineStage: 'analyze',
        uiProgress: startProg,
        simStartAt: now,
        simStartProgress: startProg,
        simDurationMs: (((liftData.videoDurationSec || 10) * 2) + 20) * 1000,
        errorMessage: 'Missing assetId',
      } as LoadingLiftData;
      setAllLoadingLifts(prev => [errLift, ...prev]);
      return liftId;
    }

    // 1) Show local card immediately
    const now = Date.now();
    const startProg = 0.02;

    const newLift: LoadingLiftData = {
      ...liftData,
      id: liftId,
      assetId: liftData.assetId,
      status: 'processing',
      isComplete: false,
      pipelineStage: 'analyze',
      uiProgress: startProg,
      simStartAt: now,
      simStartProgress: startProg,
      simDurationMs: (((liftData.videoDurationSec || 10) * 2) + 20) * 1000,
    };

    setAllLoadingLifts(prev => [newLift, ...prev]);

    // 2) Upload raw video + thumbnail first
    try {
      const userId = await getUserId();
      if (!userId) {
        safeUpdateLift(liftId, l => ({ ...l, status: 'error', errorMessage: 'No userId available' }));
        return liftId;
      }

      // Upload video
      if (!liftData.videoLink) throw new Error('No video link provided');
      const { publicUrl: videoUrl } = await uploadLiftVideo(userId, liftId, liftData.videoLink, liftData.assetId, hasHdVideos);
      setAllLoadingLifts(prev => prev.map(l => l.id === liftId ? { ...l, uploadedVideoUrl: videoUrl } : l));

      // Upload thumbnail
      if (!liftData.thumbnailUri) throw new Error('No thumbnail URI provided');
      const { publicUrl: thumbUrl } = await uploadLiftThumbnail(userId, liftId, liftData.thumbnailUri);
      setAllLoadingLifts(prev => prev.map(l => l.id === liftId ? { ...l, uploadedThumbnailUrl: thumbUrl } : l));

      // 3) Enqueue analysis (fast 202)
      await enqueueLiftAnalysis({
        userId,
        liftId, // DB id
        lift: {
          ...liftData,
          videoLink: videoUrl,       // uploaded raw URL
          thumbnailUri: thumbUrl, // uploaded thumb URL
          assetId: liftData.assetId,
        },
        hasHdVideos,
      });
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload your video. Please check your connection and try again.');
      safeUpdateLift(liftId, l => ({ 
        ...l, 
        status: 'error', 
        errorMessage: 'Failed to upload video. Please try again.' 
      }));
    }

    return liftId;
  };




  function normalizeApiLift(data: any) {
    return {
      id: data.id,
      is_favourite: data.is_favourite ?? data.isFavourite,
      lift_type: data.lift_type ?? data.liftType,
      lift_date: data.lift_date ?? data.liftDate,
      lift_time: data.lift_time ?? data.liftTime,
      metric_weight: data.metric_weight ?? data.metricWeight,
      reps: data.reps,
      thumbnail_url: data.thumbnail_url ?? data.thumbnailURL,
      analysis: data.analysis,
    };
  }

  async function mapApiDataToFinalData(data: any): Promise<ILiftData> {
    const rawThumb = data.thumbnail_url ?? data.thumbnailURL;
    let thumbnailURL = rawThumb;
    try {
      const key = await extractObjectKeyFromUrl(rawThumb);
      if (key) thumbnailURL = await signPath(key) ?? rawThumb;
    } catch (_) {
      // keep raw URL; don't fail the completion
    }

    // NEW: video sources (raw + pose)
    const rawVideo = data.raw_video_url ?? data.rawVideoURL;
    const poseVideo = data.pose_video_url ?? data.poseVideoURL;

    let rawVideoURL = rawVideo;
    let poseVideoURL = poseVideo;

    try {
      const k = await extractObjectKeyFromUrl(typeof rawVideo === 'string' ? rawVideo : undefined);
      if (k) rawVideoURL = (await signPath(k)) ?? rawVideo;
    } catch {}

    try {
      const k = await extractObjectKeyFromUrl(typeof poseVideo === 'string' ? poseVideo : undefined);
      if (k) poseVideoURL = (await signPath(k)) ?? poseVideo;
    } catch {}

    const rawFeedback = Array.isArray(data.analysis?.feedback) ? data.analysis.feedback : [];
    const signedFeedback = await Promise.all(rawFeedback.map(async (f: any) => {
      try {
        const k = await extractObjectKeyFromUrl(typeof f.imageURL === 'string' ? f.imageURL : undefined);
        const u = k ? await signPath(k) : undefined;
        return { ...f, imageURL: u ?? f.imageURL };
      } catch {
        return f; // don't block completion
      }
    }));

    // Normalize/format date to DD-MM-YYYY using LiftDataContext's helper
    const rawDate: any = (data.lift_date ?? data.liftDate) as any;
    let formattedLiftDate: string | null = null;
    try {
      if (typeof rawDate === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
          // ISO-like string: safe to parse
          formattedLiftDate = formatDateForLift(new Date(rawDate));
        } else if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)) {
          // Already in DD-MM-YYYY
          formattedLiftDate = rawDate;
        } else {
          // Fallback attempt
          const d = new Date(rawDate);
          formattedLiftDate = isNaN(d.getTime()) ? null : formatDateForLift(d);
        }
      } else if (rawDate instanceof Date) {
        formattedLiftDate = formatDateForLift(rawDate);
      }
    } catch (_) {
      formattedLiftDate = null;
    }

    return {
      id: data.id,
      isFavourite: !!(data.is_favourite ?? data.isFavourite),
      liftType: data.lift_type ?? data.liftType,
      liftDate: formattedLiftDate || formatDateForLift(new Date()),
      liftTime: data.lift_time ?? data.liftTime,
      metricWeight: Number(data.metric_weight ?? data.metricWeight),
      reps: Number(data.reps),
      rawVideoURL,          // <-- now populated
      poseVideoURL,         // <-- now populated
      thumbnailURL,
      analysis: {
        accuracy: Number(data.analysis?.accuracy ?? 0),
        lineGraphValues: Array.isArray(data.analysis?.lineGraphValues) ? data.analysis.lineGraphValues : [],
        barChartValues: Array.isArray(data.analysis?.barChartValues) ? data.analysis.barChartValues : [],
        feedback: signedFeedback,
      },
    };
  }

  const completeLift = (id: string, analysisData?: any) => {
    // No-op: streak modal is no longer triggered manually
    
    // Note: We no longer immediately remove the loading lift here
    // The UI will show the completed loading lift with finalData until it's cleaned up
    // This prevents the "pop" effect when transitioning from loading to final state
  };

  const retryLift = async (id: string) => {
    const l = allLoadingLifts.find(x => x.id === id);
    if (!l) return;
    if (!l.assetId) {
      console.warn('[retryLift] missing assetId for', id);
      return;
    }

    safeUpdateLift(id, x => ({ ...x, status: 'processing', errorMessage: undefined }));

    const userId = await getUserId();
    if (!userId) return;
    
    await enqueueLiftAnalysis({
      userId,
      liftId: l.id,
      lift: {
        movementType: l.movementType || '',
        reps: l.reps || 0,
        metricWeight: l.metricWeight || 0,
        dateToday: l.dateToday,
        timeToday: l.timeToday,
        videoLink: (l.uploadedVideoUrl ?? l.videoLink) || '',   // ensure URLs are there
        thumbnailUri: (l.uploadedThumbnailUrl ?? l.thumbnailUri) || '',
        assetId: l.assetId,
      },
      hasHdVideos,
    });
  };

  const removeLift = (id: string) => {
    
    setAllLoadingLifts(prev => prev.filter(lift => lift.id !== id));
  };

  const removeLoadingLiftByFinalId = (finalId: string) => {
    setAllLoadingLifts(prev => {
      const filtered = prev.filter(l => !(l.status === 'completed' && l.finalData?.id === finalId));
      return filtered;
    });
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
  const handleStreakModalContinue = () => {
    setShowStreakModal(false);
  };

  // Function to automatically delete error lifts in the background
  const autoDeleteErrorLift = async (liftId: string) => {
    if (deletingRef.current.has(liftId)) return;
    if (autoDeletedLifts.has(liftId)) return;
    deletingRef.current.add(liftId);
    try {
      // Call the storage delete API in the background
      const success = await autoDeleteLiftErrorCardData(liftId);
      
      if (success) {
        // Mark this lift as auto-deleted for instant UI removal later
        setAutoDeletedLifts(prev => new Set([...prev, liftId]));
        // Note: invalidateUserCheckIns() is now handled manually in StreakModal when user clicks continue
      }
    } catch (error) {
      console.warn(`Failed to auto-delete lift ${liftId}:`, error);
    } finally {
      deletingRef.current.delete(liftId);
    }
  };

  // All mock helpers removed; rely on backend data

  // Function to check if a lift has been auto-deleted
  const isLiftAutoDeleted = (liftId: string): boolean => {
    return autoDeletedLifts.has(liftId);
  };

  // Emergency purge helper for debugging
  const purgeAllLoadingLifts = useCallback(() => {
    inflightRef.current.clear();
    retryTimersRef.current.forEach(clearTimeout);
    retryTimersRef.current.clear();
    queuedRef.current.clear();
    setAllLoadingLifts([]);
    void saveLoadingLifts([]);
  }, []);


  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up sweeper on unmount
      if (sweeperRef.current) {
        clearInterval(sweeperRef.current);
        sweeperRef.current = null;
      }
    };
  }, []);

  // Reset function for account deletion
  const resetContext = React.useCallback(() => {
    setAllLoadingLifts([]);
    setCompletedLifts([]);
    setShowStreakModal(false);
    setIsHomeActive(false);
    setAutoDeletedLifts(new Set());
    // Clear all refs
    inflightRef.current.clear();
    retryTimersRef.current.forEach(clearTimeout);
    retryTimersRef.current.clear();
    queuedRef.current.clear();
    deletingRef.current.clear();
    streakShownForRef.current.clear();
    latestLiftsRef.current = [];
  }, []);

  // Expose reset function globally for account deletion
  React.useEffect(() => {
    (global as any).resetLoadingLiftsContext = resetContext;
    return () => {
      (global as any).resetLoadingLiftsContext = undefined;
    };
  }, [resetContext]);

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
        handleStreakModalContinue,
        isLiftAutoDeleted,
        removeLoadingLiftByFinalId,
        purgeAllLoadingLifts,
        setHomeActive: setIsHomeActive,
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