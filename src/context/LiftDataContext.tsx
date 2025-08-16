import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export interface ILiftData {
  id: string;
  isFavourite: boolean;
  liftType: string;
  liftDate: string;
  weightValue: number;
  weightUnit: string;
  reps: number;
  videoURL: any;
  thumbnailURL?: any;
  analysis: {
    accuracy: number;
    lineGraphValues: number[];
    feedback: Array<{
      imageURL: any;
      flaws: string;
      improvement: string;
    }>;
  };
}

interface LiftDataContextType {
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
}

const LiftDataContext = createContext<LiftDataContextType | undefined>(undefined);

const initialLiftData: ILiftData[] = [];

interface LiftDataProviderProps {
  children: ReactNode;
}

export function LiftDataProvider({ children }: LiftDataProviderProps) {
  const [liftData, setLiftData] = useState<ILiftData[]>(initialLiftData);

  // Helper function to format date consistently
  const formatDateForLift = useCallback((date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const addLift = useCallback((lift: ILiftData) => {
    setLiftData(prev => [...prev, lift]);
  }, []);

  const updateLift = useCallback((id: string, updatedLift: Partial<ILiftData>) => {
    setLiftData(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, ...updatedLift } : lift
      )
    );
  }, []);

  const removeLift = useCallback((id: string) => {
    setLiftData(prev => prev.filter(lift => lift.id !== id));
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    setLiftData(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, isFavourite: !lift.isFavourite } : lift
      )
    );
  }, []);

  const getLiftById = useCallback((id: string): ILiftData | undefined => {
    return liftData.find(lift => lift.id === id);
  }, [liftData]);

  const getFavouriteLifts = useCallback((): ILiftData[] => {
    return liftData.filter(lift => lift.isFavourite);
  }, [liftData]);

  const getLiftsByType = useCallback((liftType: string): ILiftData[] => {
    return liftData.filter(lift => lift.liftType === liftType);
  }, [liftData]);

  const getLiftsByDate = useCallback((date: Date): ILiftData[] => {
    const dateString = formatDateForLift(date);
    return liftData.filter(lift => lift.liftDate === dateString);
  }, [liftData, formatDateForLift]);

  const getLiftsByDateString = useCallback((dateString: string): ILiftData[] => {
    return liftData.filter(lift => lift.liftDate === dateString);
  }, [liftData]);

  const clearAllLifts = useCallback(() => {
    setLiftData([]);
  }, []);

  const value = useMemo(() => ({
    liftData,
    addLift,
    updateLift,
    removeLift,
    toggleFavourite,
    getLiftById,
    getFavouriteLifts,
    getLiftsByType,
    getLiftsByDate,
    getLiftsByDateString,
    clearAllLifts,
    formatDateForLift,
  }), [
    liftData,
    addLift,
    updateLift,
    removeLift,
    toggleFavourite,
    getLiftById,
    getFavouriteLifts,
    getLiftsByType,
    getLiftsByDate,
    getLiftsByDateString,
    clearAllLifts,
    formatDateForLift,
  ]);

  return (
    <LiftDataContext.Provider value={value}>
      {children}
    </LiftDataContext.Provider>
  );
}

export function useLiftData() {
  const context = useContext(LiftDataContext);
  if (context === undefined) {
    throw new Error('useLiftData must be used within a LiftDataProvider');
  }
  return context;
} 