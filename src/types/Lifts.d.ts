// Types and interfaces for lift-related functionality

// Base type aliases
export type PipelineStage = 'upload_video' | 'upload_thumbnail' | 'analyze';
export type RetryStage = 'VIDEO_VALIDATION' | 'POST_ESTIMATION' | 'AI_ANALYSIS' | 'force';
export type LiftStatus = 'uploading' | 'processing' | 'completed' | 'error';
export type WeightUnit = 'kg' | 'lbs';
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

// Common interfaces
export interface LiftAnalysis {
  accuracy: number;
  lineGraphValues?: number[];
  feedback?: any[];
}

export interface LiftFeedback {
  imageURL: any;
  flaws: string[];
  improvement: string[];
}

export interface JobRow {
  id: string;
  user_id: string;
  status: JobStatus;
  progress: number;
  error?: string | null;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
}

export interface BaseLiftData {
  id: string;
  metricWeight: number;
  reps: number;
  liftType: string;
  liftDate: string;
  isFavourite: boolean;
  thumbnailURL?: string;
  is_streak?: boolean;
}

export interface LoadingLiftData {
  id: string;
  assetId?: string;          // Caller-provided correlation id; never override
  videoLink?: string;
  thumbnailUri?: string;
  uploadedVideoUrl?: string; // set after client upload
  uploadedThumbnailUrl?: string;
  movementType?: string;
  metricWeight?: number;
  weightUnit?: WeightUnit;
  reps?: number;
  dateToday: string;
  timeToday: string;

  status: 'uploading' | 'processing' | 'completed' | 'error';
  pipelineStage: 'upload_video' | 'upload_thumbnail' | 'analyze';
  isComplete: boolean;
  uiProgress?: number;
  simStartAt?: number;
  simStartProgress?: number;
  simDurationMs?: number;

  errorMessage?: string;
  failureStage?: 'upload_video' | 'upload_thumbnail' | 'analyze';
  finalData?: ILiftData;
  
  // Legacy fields for backward compatibility
  sourceVideoUri?: string;
  sourceThumbnailUri?: string;
  retryStage?: RetryStage;
  videoDurationSec?: number;
  analysisStartedAt?: number;
}

export interface ILiftData extends BaseLiftData {
  liftTime: string;
  rawVideoURL: any;
  poseVideoURL: any;
  analysis: LiftAnalysis & {
    lineGraphValues: number[];
    barChartValues: number[];
    feedback: LiftFeedback[];
  };
}


export interface LoadingLiftsContextType {
  loadingLifts: LoadingLiftData[];
  completedLifts: ILiftData[];
  addLoadingLift: (liftData: Omit<LoadingLiftData, 'id' | 'isComplete' | 'status'>) => Promise<string>;
  completeLift: (id: string, analysisData?: ILiftData) => void;
  removeLift: (id: string) => void;
  removeCompletedLift: (id: string) => void;
  retryLift: (id: string) => Promise<void>;
  updateLiftProgress: (id: string, progress: number) => void;
  showStreakModal: boolean;
  openStreakModal: () => void;
  closeStreakModal: () => void;
  handleStreakModalContinue: () => void;
  isLiftAutoDeleted: (liftId: string) => boolean;
  removeLoadingLiftByFinalId: (finalId: string) => void;
  purgeAllLoadingLifts: () => void;
  setHomeActive?: (isActive: boolean) => void;
}

export interface LiftDataContextType {
  liftData: ILiftData[];
  addLift: (lift: ILiftData) => void;
  updateLift: (id: string, updatedLift: Partial<ILiftData>) => void;
  removeLift: (id: string) => void;
  toggleFavourite: (id: string) => void;
  getLiftById: (id: string) => ILiftData | undefined;
  getFavouriteLifts: () => ILiftData[];
  getLiftsByType: (liftType: string) => ILiftData[];
  getLiftsByDate: (date: Date) => ILiftData[];
  getLiftsByDateString: (dateString: string) => ILiftData[];
  clearAllLifts: () => void;
  formatDateForLift: (date: Date) => string;
  refreshLifts: () => Promise<void>;
  invalidateAndRefetch: () => Promise<void>;
  favouriteLiftAndRefresh: (id: string) => Promise<void>;
  isLiftDataLoaded: boolean;
  isTutorialReplay: boolean;
  saveLiftDataToStorage: () => Promise<void>;
  restoreLiftDataFromStorage: () => Promise<void>;
  clearLiftDataForTutorial: () => void;
  restoreLiftDataAfterTutorial: () => Promise<void>;
}

export interface AnalyzeLiftPayload {
  userId: string;
  liftId: string;
  lift: {
    id: string;
    videoLink: string;
    thumbnailUri: string;
    movementType: string;
    metricWeight: number;
    reps: number;
    dateToday: string;
    timeToday: string;
    assetId?: string;
  };
  stage?: RetryStage;
}

export interface AnalyzeLiftResponse<T = any> {
  success: boolean;
  data?: T | null;
  stage?: RetryStage;
  error?: string;
  is_streak?: boolean;
  assetId?: string;
}

export interface VideoPlayerComponentProps {
  videoUri: string;
  onReady: () => void;
}

export interface LiftDetailsProps {
  onClose: () => void;
  onShowFeedbackSlideshow: () => void;
  liftData: ILiftData;
}


