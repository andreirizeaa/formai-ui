import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OnboardingContextType, UserPreferences } from '../types/onboarding';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialPreferences: UserPreferences = {
  language: 'en',
  gender: null,
  goal: null,
  workoutsPerWeek: null,
  discoverySource: null,
  hasPersonalTrainer: null,
  height: null,
  weight: null,
  birthDate: null,
  unitSystem: 'metric',
};

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [isComplete, setIsComplete] = useState(false);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const setComplete = (complete: boolean) => {
    setIsComplete(complete);
  };

  return (
    <OnboardingContext.Provider
      value={{
        preferences,
        updatePreference,
        isComplete,
        setComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 