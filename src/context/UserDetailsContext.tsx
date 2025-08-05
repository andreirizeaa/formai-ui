import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  formatWeightForDisplay, 
  formatHeightForDisplay, 
  parseWeightToMetric, 
  parseHeightToMetric 
} from '../utils/unitConversions';

interface UserDetails {
  unitSystem: 'metric' | 'imperial';
  currentWeight: number; // Always stored in kg
  height: number; // Always stored in cm
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
}

const UserDetailsContext = createContext<UserDetailsContextType | undefined>(undefined);

const initialUserDetails: UserDetails = {
  unitSystem: 'metric',
  currentWeight: 70, // 70 kg
  height: 175, // 175 cm
  dateOfBirth: 'January 15, 1990',
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
      currentWeight: weightKg,
    }));
  };

  const updateHeight = (heightCm: number) => {
    setUserDetails(prev => ({
      ...prev,
      height: heightCm,
    }));
  };

  const getWeightDisplay = (): string => {
    return formatWeightForDisplay(userDetails.currentWeight, userDetails.unitSystem);
  };

  const getHeightDisplay = (): string => {
    return formatHeightForDisplay(userDetails.height, userDetails.unitSystem);
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