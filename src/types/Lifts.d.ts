// Types and interfaces for lift-related functionality

// Base type aliases
export type PipelineStage = 'upload_video' | 'upload_thumbnail' | 'analyze';
export type RetryStage = 'VIDEO_VALIDATION' | 'POST_ESTIMATION' | 'AI_ANALYSIS';
export type LiftStatus = 'uploading' | 'processing' | 'completed' | 'error';
export type WeightUnit = 'kg' | 'lbs';

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

export interface BaseLiftData {
  id: string;
  weightValue: number;
  reps: number;
  liftType: string;
  liftDate: string;
  isFavourite: boolean;
  thumbnailURL?: string;
}

export interface LoadingLiftData {
  id: string;
  videoLink: string;
  thumbnailUri: string;
  movementType: string;
  weightValue: number;
  weightUnit?: WeightUnit;
  reps: number;
  dateToday: string;
  timeToday: string;
  isComplete: boolean;
  status: LiftStatus;
  errorMessage?: string;
  // Pipeline metadata
  pipelineStage?: PipelineStage;
  failureStage?: PipelineStage;
  // Source local URIs for retrying uploads
  sourceVideoUri?: string;
  sourceThumbnailUri?: string;
  // Uploaded URLs retained for retrying analysis
  uploadedVideoUrl?: string;
  uploadedThumbnailUrl?: string;
  // Asset ID for unique video identification
  assetId?: string;
  // Retry stage for analysis errors
  retryStage?: RetryStage;
  // Progress tracking
  videoDurationSec?: number; // Length of video in seconds
  uiProgress?: number; // Current progress 0-1
  // In-place completion data to avoid flicker (subset for card rendering)
  finalData?: BaseLiftData & {
    liftTime: string;
    analysis: LiftAnalysis;
  };
}

export interface ILiftData extends BaseLiftData {
  liftTime: string;
  rawVideoURL: any;
  poseVideoURL: any;
  analysis: LiftAnalysis & {
    lineGraphValues: number[];
    feedback: LiftFeedback[];
  };
}

export interface LoadingLiftCardProps {
  lift: {
    id: string;
    thumbnailUri: string;
    movementType: string;
    weightValue: number;
    weightUnit?: WeightUnit;
    reps: number;
    dateToday: string;
    isComplete: boolean;
    status: LiftStatus;
    errorMessage?: string;
    pipelineStage?: PipelineStage;
    videoDurationSec?: number;
    uiProgress?: number;
    retryStage?: RetryStage;
    finalData?: BaseLiftData & {
      liftTime: string;
      analysis: LiftAnalysis;
    };
  };
}

export interface LiftDataCardProps {
  lift?: ILiftData;
  onPress?: (liftId: string) => void; // Changed to take liftId instead of full lift object
  showDate?: boolean; // When true, show formatted date instead of time
  isNoLiftsCard?: boolean; // When true, render as no lifts card
  noLiftsTitle?: string;
  noLiftsSubtitle?: string;
  onNoLiftsPress?: () => void;
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
  isLiftAutoDeleted: (liftId: string) => boolean;
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
  favouriteLiftAndRefresh: (id: string) => Promise<void>;
  isLiftDataLoaded: boolean;
}

export interface AnalyzeLiftPayload {
  userId: string;
  liftId: string;
  lift: {
    id: string;
    videoLink: string;
    thumbnailUri: string;
    movementType: string;
    weightValue: number;
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


