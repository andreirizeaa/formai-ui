import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ILiftData } from './LiftDataContext';
import { getUserId } from '../services/storageService';
import { analyzeLift } from '../services/liftService';
import { uploadLiftVideo, uploadLiftThumbnail } from '../services/VideoUploadService';
import { useLiftData } from './LiftDataContext';

export interface LoadingLiftData {
  id: string;
  videoLink: string;
  thumbnailUri: string;
  movementType: string;
  weightValue: number;
  weightUnit?: 'kg' | 'lbs';
  reps: number;
  dateToday: string;
  timeToday: string;
  progress: number;
  isComplete: boolean;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  // Pipeline metadata
  pipelineStage?: 'upload_video' | 'upload_thumbnail' | 'analyze';
  failureStage?: 'upload_video' | 'upload_thumbnail' | 'analyze';
  // Source local URIs for retrying uploads
  sourceVideoUri?: string;
  sourceThumbnailUri?: string;
  // Uploaded URLs retained for retrying analysis
  uploadedVideoUrl?: string;
  uploadedThumbnailUrl?: string;
  // Asset ID for unique video identification
  assetId?: string;
  // In-place completion data to avoid flicker (subset for card rendering)
  finalData?: {
    id: string;
    isFavourite: boolean;
    liftType: string;
    liftDate: string;
    weightValue: number;
    reps: number;
    thumbnailURL?: string;
    analysis: { accuracy: number; lineGraphValues?: number[]; feedback?: any[] };
  };
}

interface LoadingLiftsContextType {
  loadingLifts: LoadingLiftData[];
  completedLifts: ILiftData[];
  addLoadingLift: (liftData: Omit<LoadingLiftData, 'id' | 'progress' | 'isComplete' | 'status'>) => Promise<string>;
  updateLiftProgress: (id: string, progress: number) => void;
  completeLift: (id: string, analysisData?: ILiftData) => void;
  removeLift: (id: string) => void;
  removeCompletedLift: (id: string) => void;
  retryLift: (id: string) => Promise<void>;
}

const LoadingLiftsContext = createContext<LoadingLiftsContextType | undefined>(undefined);

interface LoadingLiftsProviderProps {
  children: ReactNode;
}

export function LoadingLiftsProvider({ children }: LoadingLiftsProviderProps) {
  const [loadingLifts, setLoadingLifts] = useState<LoadingLiftData[]>([]);
  const [completedLifts, setCompletedLifts] = useState<ILiftData[]>([]);
  const { refreshLifts } = useLiftData();

  // Call backend to analyze the lift
  const analyzeVideo = async (liftData: LoadingLiftData) => {
    const userId = await getUserId();
    if (!userId) return { success: false, data: null };
    const result = await analyzeLift(userId, liftData);
    return result;
  };

  const addLoadingLift = async (liftData: Omit<LoadingLiftData, 'id' | 'progress' | 'isComplete' | 'status'>): Promise<string> => {
    const liftId = Date.now().toString();
    
    // Check if we already have a lift with the same video source to prevent duplicates
    const existingLift = loadingLifts.find(lift => 
      lift.sourceVideoUri === liftData.videoLink || 
      lift.videoLink === liftData.videoLink
    );
    
    if (existingLift && existingLift.status !== 'error') {
      return existingLift.id;
    }
    
    const newLift: LoadingLiftData = {
      ...liftData,
      id: liftId,
      progress: 0,
      isComplete: false,
      status: 'uploading',
      pipelineStage: 'upload_video',
      failureStage: undefined,
      sourceVideoUri: liftData.videoLink,
      sourceThumbnailUri: liftData.thumbnailUri,
      uploadedVideoUrl: undefined,
      uploadedThumbnailUrl: undefined,
    };
    setLoadingLifts(prev => [newLift, ...prev]);
    
    // Fire-and-forget processing pipeline with fresh lift snapshot
    void processLiftPipeline(newLift);
    
    return liftId;
  };

  // Remove local simulation in favor of backend-driven progress updates if needed

  const updateLiftProgress = (id: string, progress: number) => {
    setLoadingLifts(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, progress } : lift
      )
    );
  };

  async function processLiftPipeline(initialLift: LoadingLiftData, startStage?: 'upload_video' | 'upload_thumbnail' | 'analyze') {
    // Set processing state
    setLoadingLifts(prev => 
      prev.map(lift => lift.id === initialLift.id ? { ...lift, status: 'processing', errorMessage: undefined, failureStage: undefined } : lift)
    );

    const userId = await getUserId();
    if (!userId) {
      setLoadingLifts(prev => prev.map(lift => lift.id === initialLift.id ? { ...lift, status: 'error', failureStage: startStage ?? 'upload_video', errorMessage: 'No userId available' } : lift));
      return;
    }

    // Keep a local, authoritative snapshot
    let current = { ...initialLift } as LoadingLiftData;

    // Stage 1: Upload Video
    try {
      setLoadingLifts(prev => prev.map(lift => lift.id === current.id ? { ...lift, pipelineStage: 'upload_video', progress: Math.max(lift.progress, 10) } : lift));
      
      // Only upload video if we don't already have a successful upload URL
      if ((!startStage || startStage === 'upload_video') && !current.uploadedVideoUrl) {
        const videoSource = current.sourceVideoUri ?? current.videoLink;
        const { publicUrl: videoUrl } = await uploadLiftVideo(userId, videoSource, current.assetId);
        current.uploadedVideoUrl = videoUrl;
        setLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, uploadedVideoUrl: videoUrl } : l));
      }
    } catch (error) {
      setLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, status: 'error', failureStage: 'upload_video', errorMessage: error instanceof Error ? error.message : 'Video upload failed' } : l));
      return;
    }

    // Stage 2: Upload Thumbnail
    try {
      setLoadingLifts(prev => prev.map(lift => lift.id === current.id ? { ...lift, pipelineStage: 'upload_thumbnail', progress: Math.max(lift.progress, 30) } : lift));
      
      // Only upload thumbnail if we don't already have a successful upload URL
      if ((!startStage || startStage === 'upload_video' || startStage === 'upload_thumbnail') && !current.uploadedThumbnailUrl) {
        const thumbSource = current.sourceThumbnailUri ?? current.thumbnailUri;
        const { publicUrl: thumbUrl } = await uploadLiftThumbnail(userId, thumbSource);
        current.uploadedThumbnailUrl = thumbUrl;
        setLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, uploadedThumbnailUrl: thumbUrl } : l));
      }
    } catch (error) {
      setLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, status: 'error', failureStage: 'upload_thumbnail', errorMessage: error instanceof Error ? error.message : 'Thumbnail upload failed' } : l));
      return;
    }

    // Stage 3: Analyze
    try {
      setLoadingLifts(prev => prev.map(lift => lift.id === current.id ? { ...lift, pipelineStage: 'analyze', progress: Math.max(lift.progress, 60) } : lift));
      
      // Ensure we have both video and thumbnail URLs before analysis
      const videoUrl = current.uploadedVideoUrl ?? current.videoLink;
      const thumbUrl = current.uploadedThumbnailUrl ?? current.thumbnailUri;
      
      if (!videoUrl || !thumbUrl) {
        setLoadingLifts(prev => prev.map(l => l.id === current.id ? { 
          ...l, 
          status: 'error', 
          failureStage: 'analyze', 
          errorMessage: 'Missing required upload URLs for analysis' 
        } : l));
        return;
      }
      const liftForAnalysis: LoadingLiftData = { ...current, videoLink: videoUrl, thumbnailUri: thumbUrl };
      const result = await analyzeVideo(liftForAnalysis);
      
      if (!result.success) {
        // Handle specific error cases from the API
        if ((result as any).error === 'NO_GYM_VIDEO_FOUND') {
          setLoadingLifts(prev => prev.map(l => l.id === current.id ? { 
            ...l, 
            status: 'error', 
            failureStage: 'analyze', 
            errorMessage: 'No lift found' 
          } : l));
          return;
        } else if ((result as any).error === 'ERROR_OCCURED') {
          setLoadingLifts(prev => prev.map(l => l.id === current.id ? { 
            ...l, 
            status: 'error', 
            failureStage: 'analyze', 
            errorMessage: 'Analysis failed. Please try again.' 
          } : l));
          return;
        } else {
          // Handle other API errors
          const errorMessage = (result as any).message || 'Analysis failed';
          setLoadingLifts(prev => prev.map(l => l.id === current.id ? { 
            ...l, 
            status: 'error', 
            failureStage: 'analyze', 
            errorMessage 
          } : l));
          return;
        }
      }
      // If API returns the final data for the card, store it to prevent flicker
      if (result.data) {
        setLoadingLifts(prev => prev.map(l => l.id === current.id ? { ...l, finalData: mapApiDataToFinalData(result.data) } : l));
      }
      // Mark as complete with the analysis data
      completeLift(current.id, result.data);
      // Refresh lifts in background
      void (async () => { try { await refreshLifts(); } catch (_) {} })();
    } catch (error) {
      setLoadingLifts(prev => prev.map(l => l.id === current.id ? { 
        ...l, 
        status: 'error', 
        failureStage: 'analyze', 
        errorMessage: error instanceof Error ? error.message : 'Analysis failed' 
      } : l));
      return;
    }
  }

  function mapApiDataToFinalData(data: any) {
    return {
      id: data.id,
      isFavourite: !!data.is_favourite,
      liftType: data.lift_type,
      liftDate: data.lift_date,
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
    // Update the loading lift to completed state but keep it visible
    setLoadingLifts(prev => 
      prev.map(lift => 
        lift.id === id 
          ? { 
              ...lift, 
              progress: 100, 
              isComplete: true, 
              status: 'completed',
              finalData: analysisData ? mapApiDataToFinalData(analysisData) : lift.finalData
            } 
          : lift
      )
    );
    
    // Remove the completed loading lift after a short delay to allow smooth transition
    setTimeout(() => {
      removeLift(id);
      // Refresh lifts in background to show the new data card
      void (async () => { 
        try { 
          await refreshLifts(); 
        } catch (_) {} 
      })();
    }, 500); // Reduced from 2000ms to 500ms for smoother transition
  };

  const retryLift = async (id: string) => {
    const lift = loadingLifts.find(l => l.id === id);
    if (!lift) {
      return;
    }

    // Prevent multiple simultaneous retries for the same lift
    if (lift.status === 'processing') {
      return;
    }

    // Determine stage to restart from based on what's already completed
    let stage: 'upload_video' | 'upload_thumbnail' | 'analyze' = 'upload_video';
    
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
    setLoadingLifts(prev => prev.map(l => l.id === id ? { ...l, status: 'processing', errorMessage: undefined, failureStage: undefined } : l));
    await processLiftPipeline(lift, stage);
  };

  const removeLift = (id: string) => {
    setLoadingLifts(prev => prev.filter(lift => lift.id !== id));
  };

  const removeCompletedLift = (id: string) => {
    setCompletedLifts(prev => prev.filter(lift => lift.id !== id));
  };

  // All mock helpers removed; rely on backend data

  return (
    <LoadingLiftsContext.Provider
      value={{
        loadingLifts,
        completedLifts,
        addLoadingLift,
        updateLiftProgress,
        completeLift,
        removeLift,
        removeCompletedLift,
        retryLift,
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