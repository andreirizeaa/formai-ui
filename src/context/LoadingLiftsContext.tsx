import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { ILiftData } from './LiftDataContext';
import { getUserId } from '../services/storageService';
import { analyzeLift } from '../services/liftService';
import { uploadLiftVideo, uploadLiftThumbnail } from '../services/VideoUploadService';
import { useLiftData } from './LiftDataContext';
import { useSelectedDate } from './SelectedDateContext';
import { useUserCheckIns } from './UserCheckInsContext';
import { loadLoadingLifts, saveLoadingLifts } from '../services/loadingLiftsStorage';
import { hapticFeedback } from '../utils/haptic';
import { LoadingLiftData, LoadingLiftsContextType, PipelineStage, RetryStage } from '../types/Lifts.d';
import { deleteUserStorage } from '../services/liftService';

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

  // Safe haptic wrapper to prevent non-API throws from triggering error state
  const safeHaptic = (kind: 'error' | 'success' | 'impact' = 'error') => {
    try {
      const fn = (hapticFeedback as any)?.[kind];
      if (typeof fn === 'function') fn();
    } catch { 
      // Never let haptics flip UI state
    }
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

  // Filter loading lifts to only show those matching the selected date
  const loadingLifts = allLoadingLifts.filter(lift => {
    const liftDate = new Date(lift.dateToday);
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const liftDateOnly = new Date(liftDate.getFullYear(), liftDate.getMonth(), liftDate.getDate());
    return liftDateOnly.getTime() === selectedDateOnly.getTime();
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

          // Resume processing for any lifts that were in-flight
          stored.forEach(lift => {
            if (lift.status === 'completed') return; // Skip completed lifts
            if (lift.status === 'error') return; // Keep error lifts visible for retry
            
            // Update status to processing to reflect we're resuming, but preserve progress
            setAllLoadingLifts(prev =>
              prev.map(l => l.id === lift.id ? { ...l, status: 'processing' } : l)
            );
            
            // Resume from the appropriate stage with preserved progress
            const stage = deriveStage(lift);
            void processLiftPipeline(lift, stage);
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



  // Call backend to analyze the lift
  const analyzeVideo = async (
    liftData: LoadingLiftData, 
    retryStage?: RetryStage
  ) => {
    const userId = await getUserId();
    if (!userId) return { success: false, data: null };
    const result = await analyzeLift(userId, liftData, retryStage);
    return result;
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
      uiProgress: 0, // Initialize progress at 0
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
    // Prevent multiple simultaneous pipelines for the same lift
    if (inflight.current.has(initialLift.id)) {
      console.log(`Pipeline already running for lift ${initialLift.id}, skipping duplicate`);
      return;
    }
    
    inflight.current.add(initialLift.id);
    
    try {
      // Set processing state
      setAllLoadingLifts(prev => 
        prev.map(lift => lift.id === initialLift.id ? { ...lift, status: 'processing', errorMessage: undefined, failureStage: undefined } : lift)
      );

      const userId = await getUserId();
      if (!userId) {
        setAllLoadingLifts(prev => prev.map(lift => lift.id === initialLift.id ? { ...lift, status: 'error', failureStage: startStage ?? 'upload_video', errorMessage: 'No userId available' } : lift));
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
          setAllLoadingLifts(prev => prev.map(l => l.id === current.id ? ({
            ...l,
            status: 'processing',
            errorMessage: 'Network issue - will retry automatically...'
          }) : l));
          // Schedule a retry after a short delay
          setTimeout(() => {
            if (!inflight.current.has(current.id)) {
              void processLiftPipeline(current, 'upload_video');
            }
          }, 2000);
          return;
        } else {
          setAllLoadingLifts(prev => {
            const updated = prev.map(l => l.id === current.id ? { ...l, status: 'error' as const, failureStage: 'upload_video' as const, errorMessage: error instanceof Error ? error.message : 'Video upload failed' } : l);
            // Immediately persist error state
            void saveLoadingLifts(updated);
            return updated;
          });
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
          setAllLoadingLifts(prev => prev.map(l => l.id === current.id ? ({
            ...l,
            status: 'processing',
            errorMessage: 'Network issue - will retry automatically...'
          }) : l));
          // Schedule a retry after a short delay
          setTimeout(() => {
            if (!inflight.current.has(current.id)) {
              void processLiftPipeline(current, 'upload_thumbnail');
            }
          }, 2000);
          return;
        } else {
          setAllLoadingLifts(prev => {
            const updated = prev.map(l => l.id === current.id ? { ...l, status: 'error' as const, failureStage: 'upload_thumbnail' as const, errorMessage: error instanceof Error ? error.message : 'Thumbnail upload failed' } : l);
            // Immediately persist error state
            void saveLoadingLifts(updated);
            return updated;
          });
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
        setAllLoadingLifts(prev => prev.map(l => l.id === current.id ? ({
          ...l,
          status: 'processing', // don't flip to error
          errorMessage: 'Waiting for uploads to complete…'
        }) : l));
        return; // exit gracefully; caller/hydrator can re-invoke
      }
      
      const liftForAnalysis: LoadingLiftData = { ...current, videoLink: videoUrl, thumbnailUri: thumbUrl };
      const result = await analyzeVideo(liftForAnalysis, retryStage);
      
      if (!result.success) {
        // Store the retry stage if provided by the API
        const retryStage = result.stage;
        
        // Handle specific error cases from the API
        if (result.error === 'NO_GYM_VIDEO_FOUND') {
          setAllLoadingLifts(prev => {
            const updated = prev.map(l => l.id === current.id ? { 
              ...l, 
              status: 'error' as const, 
              failureStage: 'analyze' as const, 
              errorMessage: 'No lift found',
              retryStage
            } : l);
            // Immediately persist error state
            void saveLoadingLifts(updated);
            return updated;
          });
          // Automatically delete this lift from storage in the background
          void autoDeleteErrorLift(current.id);
          return;
        } else if (result.error === 'WRONG_MOVEMENT') {
          setAllLoadingLifts(prev => {
            const updated = prev.map(l => l.id === current.id ? { 
              ...l, 
              status: 'error' as const, 
              failureStage: 'analyze' as const, 
              errorMessage: 'Lift mismatch',
              retryStage
            } : l);
            // Immediately persist error state
            void saveLoadingLifts(updated);
            return updated;
          });
          // Automatically delete this lift from storage in the background
          void autoDeleteErrorLift(current.id);
          return;
        } else if (result.error === 'ERROR_OCCURED') {
          setAllLoadingLifts(prev => {
            const updated = prev.map(l => l.id === current.id ? { 
              ...l, 
              status: 'error' as const, 
              failureStage: 'analyze' as const, 
              errorMessage: 'Analysis failed. Please try again.',
              retryStage
            } : l);
            // Immediately persist error state
            void saveLoadingLifts(updated);
            return updated;
          });
          return;
        } else {
          // Handle other API errors
          const errorMessage = result.error || 'Analysis failed';
          setAllLoadingLifts(prev => {
            const updated = prev.map(l => l.id === current.id ? { 
              ...l, 
              status: 'error' as const, 
              failureStage: 'analyze' as const, 
              errorMessage,
              retryStage
            } : l);
            // Immediately persist error state
            void saveLoadingLifts(updated);
            return updated;
          });
          return;
        }
      }
      // If API returns the final data for the card, store it to prevent flicker
      if (result.data) {
        setAllLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, finalData: mapApiDataToFinalData(result.data) } : l));
      }
      
      // Check if streak should be shown and trigger modal
      if (result.is_streak === true) {
        openStreakModal();
      }
      
      // Mark as complete with the analysis data
      completeLift(current.id, result.data);
      // Refresh lifts in background
      void (async () => { try { await refreshLifts(); } catch (_) {} })();
      // Invalidate and refetch user check-ins to update streak data
      invalidateUserCheckIns();
    } catch (error) {
      setAllLoadingLifts(prev => {
        const updated = prev.map(l => l.id === initialLift.id ? { 
          ...l, 
          status: 'error' as const, 
          failureStage: 'analyze' as const, 
          errorMessage: error instanceof Error ? error.message : 'Analysis failed' 
        } : l);
        // Immediately persist error state
        void saveLoadingLifts(updated);
        return updated;
      });
    } finally {
      // Always clean up the inflight set
      inflight.current.delete(initialLift.id);
    }
  }

  function mapApiDataToFinalData(data: any) {
    return {
      id: data.id,
      isFavourite: !!data.is_favourite,
      liftType: data.lift_type,
      liftDate: data.lift_date,
      liftTime: data.lift_time,
      weightValue: Number(data.weight_value),
      reps: Number(data.reps),
      thumbnailURL: data.thumbnail_url ?? data.thumbnailURL ?? undefined,
      analysis: {
        accuracy: Number(data.analysis?.accuracy ?? 0),
        lineGraphValues: Array.isArray(data.analysis?.lineGraphValues) ? data.analysis.lineGraphValues : [],
        feedback: Array.isArray(data.analysis?.feedback) ? data.analysis.feedback : [],
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
    
    // Immediately remove the loading lift and refresh regular lifts to show LiftDataCard
    removeLift(id);
    // Refresh lifts in background to show the new data card
    void (async () => { 
      try { 
        await refreshLifts(); 
      } catch (_) {} 
    })();
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
    setAllLoadingLifts(prev => prev.map(l => l.id === id ? { ...l, status: 'processing', errorMessage: undefined, failureStage: undefined } : l));
    await processLiftPipeline(lift, stage, lift.retryStage);
  };

  const removeLift = (id: string) => {
    setAllLoadingLifts(prev => prev.filter(lift => lift.id !== id));
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
      await deleteUserStorage(liftId);
      
      // Mark this lift as auto-deleted for instant UI removal later
      setAutoDeletedLifts(prev => new Set([...prev, liftId]));
      
      console.log(`Auto-deleted lift ${liftId} from storage`);
    } catch (error) {
      console.warn(`Failed to auto-delete lift ${liftId}:`, error);
    }
  };

  // All mock helpers removed; rely on backend data

  // Function to check if a lift has been auto-deleted
  const isLiftAutoDeleted = (liftId: string): boolean => {
    return autoDeletedLifts.has(liftId);
  };

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