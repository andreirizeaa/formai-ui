import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_DATE_KEY = 'selected_calendar_date';

interface SelectedDateContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined);

interface SelectedDateProviderProps {
  children: ReactNode;
}

export function SelectedDateProvider({ children }: SelectedDateProviderProps) {
  const [selectedDate, setSelectedDateState] = useState<Date>(new Date());

  // Load saved date on mount
  useEffect(() => {
    loadSelectedDate();
  }, []);

  const loadSelectedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem(SELECTED_DATE_KEY);
      if (savedDate) {
        const parsedDate = new Date(savedDate);
        // Only use saved date if it's valid
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDateState(parsedDate);
        }
      }
    } catch (error) {
      console.error('Error loading selected date:', error);
    }
  };

  const setSelectedDate = async (date: Date) => {
    try {
      setSelectedDateState(date);
      await AsyncStorage.setItem(SELECTED_DATE_KEY, date.toISOString());
    } catch (error) {
      console.error('Error saving selected date:', error);
    }
  };

  const value: SelectedDateContextType = {
    selectedDate,
    setSelectedDate,
  };

  return (
    <SelectedDateContext.Provider value={value}>
      {children}
    </SelectedDateContext.Provider>
  );
}

export function useSelectedDate() {
  const ctx = useContext(SelectedDateContext);
  if (!ctx) throw new Error('useSelectedDate must be used within a SelectedDateProvider');
  return ctx;
}
