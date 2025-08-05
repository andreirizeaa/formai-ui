import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const formatDateForLift = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const addLift = (lift: ILiftData) => {
    setLiftData(prev => [...prev, lift]);
  };

  const updateLift = (id: string, updatedLift: Partial<ILiftData>) => {
    setLiftData(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, ...updatedLift } : lift
      )
    );
  };

  const removeLift = (id: string) => {
    setLiftData(prev => prev.filter(lift => lift.id !== id));
  };

  const toggleFavourite = (id: string) => {
    setLiftData(prev => 
      prev.map(lift => 
        lift.id === id ? { ...lift, isFavourite: !lift.isFavourite } : lift
      )
    );
  };

  const getLiftById = (id: string): ILiftData | undefined => {
    return liftData.find(lift => lift.id === id);
  };

  const getFavouriteLifts = (): ILiftData[] => {
    return liftData.filter(lift => lift.isFavourite);
  };

  const getLiftsByType = (liftType: string): ILiftData[] => {
    return liftData.filter(lift => lift.liftType === liftType);
  };

  const getLiftsByDate = (date: Date): ILiftData[] => {
    const dateString = formatDateForLift(date);
    return liftData.filter(lift => lift.liftDate === dateString);
  };

  const getLiftsByDateString = (dateString: string): ILiftData[] => {
    return liftData.filter(lift => lift.liftDate === dateString);
  };

  const clearAllLifts = () => {
    setLiftData([]);
  };

  return (
    <LiftDataContext.Provider
      value={{
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
      }}
    >
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