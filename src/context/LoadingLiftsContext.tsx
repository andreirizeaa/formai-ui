import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingLiftData {
  id: string;
  thumbnailUri: string;
  movementType: string;
  weightValue: number;
  weightUnit: 'kg' | 'lbs';
  reps: number;
  dateToday: string;
  progress: number;
  isComplete: boolean;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

interface CompletedLiftData {
  id: string;
  liftType: string;
  liftDate: string;
  accuracy: number;
  lineGraphValues: number[];
  weight: number;
  unit: string;
  sets: number;
  reps: number;
  videoURL: string;
  thumbnailURL?: string;
}

// API response interface for when you integrate real APIs
interface VideoAnalysisResponse {
  id: string;
  accuracy: number;
  lineGraphValues: number[];
  analysis: {
    formScore: number;
    recommendations: string[];
    keyFrames: string[];
  };
}

interface LoadingLiftsContextType {
  loadingLifts: LoadingLiftData[];
  completedLifts: CompletedLiftData[];
  addLoadingLift: (liftData: Omit<LoadingLiftData, 'id' | 'progress' | 'isComplete' | 'status'>) => Promise<string>;
  updateLiftProgress: (id: string, progress: number) => void;
  completeLift: (id: string, analysisData?: VideoAnalysisResponse) => void;
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
  const [completedLifts, setCompletedLifts] = useState<CompletedLiftData[]>([]);

  // Mock API function - replace with real API call
  const analyzeVideo = async (liftData: LoadingLiftData): Promise<VideoAnalysisResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 2000));
    
    // Return successful analysis data
    return {
      id: liftData.id,
      accuracy: generateAccuracy(liftData.movementType),
      lineGraphValues: generateRandomLineGraph(),
      analysis: {
        formScore: Math.floor(Math.random() * 20) + 80,
        recommendations: [
          'Keep your back straight',
          'Lower the weight slightly',
          'Focus on breathing rhythm'
        ],
        keyFrames: ['frame1.jpg', 'frame2.jpg', 'frame3.jpg']
      }
    };
  };

  const addLoadingLift = async (liftData: Omit<LoadingLiftData, 'id' | 'progress' | 'isComplete' | 'status'>): Promise<string> => {
    const liftId = Date.now().toString();
    
    const newLift: LoadingLiftData = {
      ...liftData,
      id: liftId,
      progress: 0,
      isComplete: false,
      status: 'uploading',
    };
    
    setLoadingLifts(prev => [newLift, ...prev]);
    
    try {
      // Simulate upload phase (0-30%)
      await simulateUpload(newLift.id);
      
      // Update status to processing
      setLoadingLifts(prev => 
        prev.map(lift => 
          lift.id === newLift.id ? { ...lift, status: 'processing' } : lift
        )
      );
      
      // Simulate processing phase (30-90%)
      await simulateProcessing(newLift.id);
      
      // Call mock API for analysis
      const analysisData = await analyzeVideo(newLift);
      
      // Complete the lift with analysis data
      completeLift(newLift.id, analysisData);
      
    } catch (error) {
      // Handle API errors
      setLoadingLifts(prev => 
        prev.map(lift => 
          lift.id === newLift.id ? { 
            ...lift, 
            status: 'error', 
            errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
          } : lift
        )
      );
    }
    
    return liftId;
  };

  const simulateUpload = async (liftId: string) => {
    for (let progress = 0; progress <= 30; progress += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      updateLiftProgress(liftId, progress);
    }
  };

  const simulateProcessing = async (liftId: string) => {
    for (let progress = 30; progress <= 90; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      updateLiftProgress(liftId, progress);
    }
  };

  const updateLiftProgress = (id: string, progress: number) => {
    setLoadingLifts(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, progress } : lift
      )
    );
  };

  const completeLift = (id: string, analysisData?: VideoAnalysisResponse) => {
    setLoadingLifts(prevLoadingLifts => {
      const loadingLift = prevLoadingLifts.find(lift => lift.id === id);
      
      if (loadingLift) {
        // Create completed lift data
        const completedLift: CompletedLiftData = {
          id: loadingLift.id,
          liftType: loadingLift.movementType,
          liftDate: formatLiftDate(loadingLift.dateToday),
          accuracy: analysisData?.accuracy || generateAccuracy(loadingLift.movementType),
          lineGraphValues: analysisData?.lineGraphValues || generateRandomLineGraph(),
          weight: loadingLift.weightValue,
          unit: loadingLift.weightUnit.toUpperCase(),
          sets: 1,
          reps: loadingLift.reps,
          videoURL: '', // This would be the actual video URL from your backend
          thumbnailURL: loadingLift.thumbnailUri,
        };

        // Add to completed lifts after the loading lift is removed
        setTimeout(() => {
          setCompletedLifts(prev => [completedLift, ...prev]);
        }, 2000);
      }

      // Update loading lift to complete
      return prevLoadingLifts.map(lift => 
        lift.id === id ? { ...lift, progress: 100, isComplete: true, status: 'completed' } : lift
      );
    });
    
    // Remove the loading lift after 2 seconds
    setTimeout(() => {
      removeLift(id);
    }, 2000);
  };

  const retryLift = async (id: string) => {
    const lift = loadingLifts.find(l => l.id === id);
    if (!lift) return;

    // Reset lift to initial state
    setLoadingLifts(prev => 
      prev.map(l => 
        l.id === id ? { 
          ...l, 
          progress: 0, 
          isComplete: false, 
          status: 'uploading',
          errorMessage: undefined
        } : l
      )
    );

    try {
      await simulateUpload(id);
      
      setLoadingLifts(prev => 
        prev.map(l => 
          l.id === id ? { ...l, status: 'processing' } : l
        )
      );
      
      await simulateProcessing(id);
      
      const analysisData = await analyzeVideo(lift);
      completeLift(id, analysisData);
      
    } catch (error) {
      setLoadingLifts(prev => 
        prev.map(l => 
          l.id === id ? { 
            ...l, 
            status: 'error', 
            errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
          } : l
        )
      );
    }
  };

  const removeLift = (id: string) => {
    setLoadingLifts(prev => prev.filter(lift => lift.id !== id));
  };

  const removeCompletedLift = (id: string) => {
    setCompletedLifts(prev => prev.filter(lift => lift.id !== id));
  };

  // Helper function to format date for completed lifts
  const formatLiftDate = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateString === today) {
      return 'Today, ' + new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to generate random line graph values
  const generateRandomLineGraph = () => {
    const values = [];
    let baseValue = Math.floor(Math.random() * 20) + 80; // Base between 80-100
    
    for (let i = 0; i < 8; i++) {
      const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5 variation
      values.push(Math.max(70, Math.min(100, baseValue + variation)));
    }
    
    return values;
  };

  // Helper function to generate realistic accuracy based on movement type
  const generateAccuracy = (movementType: string) => {
    // Different movements might have different typical accuracy ranges
    const movementAccuracyRanges: { [key: string]: [number, number] } = {
      'Bench Press': [85, 95],
      'Squat': [80, 90],
      'Deadlift': [75, 85],
      'Shoulder Press': [80, 90],
      'Barbell Row': [85, 95],
    };

    const range = movementAccuracyRanges[movementType] || [80, 95];
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  };

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