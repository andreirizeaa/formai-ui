import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  formatWeightForDisplay, 
  formatHeightForDisplay, 
  parseWeightToMetric, 
  parseHeightToMetric 
} from '../utils/unitConversions';

interface UserDetails {
  unitSystem: 'metric' | 'imperial';
  currentWeightKG: number; 
  heightCM: number; 
  dateOfBirth: string; 
  gender: string;
  language: string;
}

interface UserDetailsContextType {
  userDetails: UserDetails;
  updateUserDetails: <K extends keyof UserDetails>(key: K, value: UserDetails[K]) => void;
  updateUnitSystem: (unitSystem: 'metric' | 'imperial') => void;
  // Helper methods for weight and height
  updateWeight: (weightKg: number) => void;
  updateHeight: (heightCm: number) => void;
  getWeightDisplay: () => string;
  getHeightDisplay: () => string;
  getDateOfBirthDisplay: () => string;
  formatDateForDisplay: (dateString: string) => string;
}

const UserDetailsContext = createContext<UserDetailsContextType | undefined>(undefined);

const initialUserDetails: UserDetails = {
  unitSystem: 'metric',
  currentWeightKG: 70,
  heightCM: 175,
  dateOfBirth: '15-01-1990',
  gender: 'Male',
  language: 'en',
};

interface UserDetailsProviderProps {
  children: ReactNode;
}

export function UserDetailsProvider({ children }: UserDetailsProviderProps) {
  const [userDetails, setUserDetails] = useState<UserDetails>(initialUserDetails);

  const updateUserDetails = <K extends keyof UserDetails>(
    key: K,
    value: UserDetails[K]
  ) => {
    setUserDetails(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateUnitSystem = (unitSystem: 'metric' | 'imperial') => {
    setUserDetails(prev => ({
      ...prev,
      unitSystem,
    }));
  };

  const updateWeight = (weightKg: number) => {
    setUserDetails(prev => ({
      ...prev,
      currentWeightKG: weightKg,
    }));
  };

  const updateHeight = (heightCm: number) => {
    setUserDetails(prev => ({
      ...prev,
      heightCM: heightCm,
    }));
  };

  const getWeightDisplay = (): string => {
    return formatWeightForDisplay(userDetails.currentWeightKG, userDetails.unitSystem);
  };

  const getHeightDisplay = (): string => {
    return formatHeightForDisplay(userDetails.heightCM, userDetails.unitSystem);
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      // Parse DD-MM-YYYY format
      const [day, month, year] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDateOfBirthDisplay = (): string => {
    return formatDateForDisplay(userDetails.dateOfBirth);
  };

  return (
    <UserDetailsContext.Provider
      value={{
        userDetails,
        updateUserDetails,
        updateUnitSystem,
        updateWeight,
        updateHeight,
        getWeightDisplay,
        getHeightDisplay,
        getDateOfBirthDisplay,
        formatDateForDisplay,
      }}
    >
      {children}
    </UserDetailsContext.Provider>
  );
}

export function useUserDetails() {
  const context = useContext(UserDetailsContext);
  if (context === undefined) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
} 