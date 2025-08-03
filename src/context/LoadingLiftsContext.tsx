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

interface LoadingLiftsContextType {
  loadingLifts: LoadingLiftData[];
  completedLifts: CompletedLiftData[];
  addLoadingLift: (liftData: Omit<LoadingLiftData, 'id' | 'progress' | 'isComplete'>) => void;
  updateLiftProgress: (id: string, progress: number) => void;
  completeLift: (id: string) => void;
  removeLift: (id: string) => void;
}

const LoadingLiftsContext = createContext<LoadingLiftsContextType | undefined>(undefined);

interface LoadingLiftsProviderProps {
  children: ReactNode;
}

export function LoadingLiftsProvider({ children }: LoadingLiftsProviderProps) {
  const [loadingLifts, setLoadingLifts] = useState<LoadingLiftData[]>([]);
  const [completedLifts, setCompletedLifts] = useState<CompletedLiftData[]>([]);

  const addLoadingLift = (liftData: Omit<LoadingLiftData, 'id' | 'progress' | 'isComplete'>) => {
    const newLift: LoadingLiftData = {
      ...liftData,
      id: Date.now().toString(),
      progress: 0,
      isComplete: false,
    };
    
    setLoadingLifts(prev => [newLift, ...prev]);
    
    // Simulate realistic progress over 5 seconds
    let progress = 0;
    const interval = setInterval(() => {
      // Vary the progress increment to make it more realistic
      const increment = Math.random() * 15 + 10; // 10-25% per second
      progress += increment;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        completeLift(newLift.id);
      } else {
        updateLiftProgress(newLift.id, Math.min(progress, 99)); // Cap at 99% until complete
      }
    }, 1000);
  };

  const updateLiftProgress = (id: string, progress: number) => {
    setLoadingLifts(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, progress } : lift
      )
    );
  };

  const completeLift = (id: string) => {
    // Find the loading lift to convert to completed lift
    setLoadingLifts(prevLoadingLifts => {
      const loadingLift = prevLoadingLifts.find(lift => lift.id === id);
      
      if (loadingLift) {
        // Create completed lift data
        const completedLift: CompletedLiftData = {
          id: loadingLift.id,
          liftType: loadingLift.movementType,
          liftDate: formatLiftDate(loadingLift.dateToday),
          accuracy: generateAccuracy(loadingLift.movementType),
          lineGraphValues: generateRandomLineGraph(),
          weight: loadingLift.weightValue,
          unit: loadingLift.weightUnit.toUpperCase(),
          sets: 1, // Default to 1 set for now
          reps: loadingLift.reps,
          videoURL: '', // This would be the actual video URL from your backend
          thumbnailURL: loadingLift.thumbnailUri,
        };

        // Add to completed lifts after the loading lift is removed (2 seconds)
        setTimeout(() => {
          setCompletedLifts(prev => [completedLift, ...prev]);
        }, 2000); // Changed from 500ms to 2000ms
      }

      // Update loading lift to complete
      return prevLoadingLifts.map(lift => 
        lift.id === id ? { ...lift, progress: 100, isComplete: true } : lift
      );
    });
    
    // Remove the loading lift after 2 seconds
    setTimeout(() => {
      removeLift(id);
    }, 2000);
  };

  const removeLift = (id: string) => {
    setLoadingLifts(prev => prev.filter(lift => lift.id !== id));
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