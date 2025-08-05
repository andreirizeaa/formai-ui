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
  liftingGoal: null,
  formBarrier: null,
  rating: null,
  referralCode: null,
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

  // Function to validate if all required onboarding data is complete
  const isOnboardingComplete = (): boolean => {
    return !!(
      preferences.language &&
      preferences.unitSystem &&
      preferences.gender &&
      preferences.goal &&
      preferences.workoutsPerWeek &&
      preferences.discoverySource &&
      preferences.hasPersonalTrainer !== null &&
      preferences.height &&
      preferences.weight &&
      preferences.birthDate &&
      preferences.liftingGoal &&
      preferences.formBarrier &&
      preferences.rating
    );
  };

  // Function to get all onboarding data in API-ready format
  const getOnboardingDataForAPI = () => {
    if (!isOnboardingComplete()) {
      throw new Error('Onboarding data is incomplete');
    }

    return {
      language: preferences.language,
      unitSystem: preferences.unitSystem,
      gender: preferences.gender,
      goal: preferences.goal,
      workoutsPerWeek: preferences.workoutsPerWeek,
      discoverySource: preferences.discoverySource,
      hasPersonalTrainer: preferences.hasPersonalTrainer,
      height: preferences.height, // Always in cm
      weight: preferences.weight, // Always in kg
      birthDate: preferences.birthDate,
      liftingGoal: preferences.liftingGoal,
      formBarrier: preferences.formBarrier,
      rating: preferences.rating,
      referralCode: preferences.referralCode || null,
      // Add computed fields for API
      age: preferences.birthDate ? calculateAge(preferences.birthDate) : null,
      bmi: preferences.height && preferences.weight ? calculateBMI(preferences.height, preferences.weight) : null,
    };
  };

  // Helper function to calculate age from birth date
  const calculateAge = (birthDate: { month: number | null; day: number | null; year: number | null }) => {
    if (!birthDate.month || !birthDate.day || !birthDate.year) {
      return null;
    }
    
    const today = new Date();
    const birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper function to calculate BMI
  const calculateBMI = (heightCm: number, weightKg: number) => {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  };

  // Function to reset onboarding data
  const resetOnboarding = () => {
    setPreferences(initialPreferences);
    setIsComplete(false);
  };

  // Function to get onboarding progress percentage
  const getOnboardingProgress = (): number => {
    const requiredFields = [
      'language',
      'unitSystem', 
      'gender',
      'goal',
      'workoutsPerWeek',
      'discoverySource',
      'hasPersonalTrainer',
      'height',
      'weight',
      'birthDate',
      'liftingGoal',
      'formBarrier',
      'rating'
    ];
    
    const completedFields = requiredFields.filter(field => 
      preferences[field as keyof UserPreferences] !== null && 
      preferences[field as keyof UserPreferences] !== undefined
    );
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <OnboardingContext.Provider
      value={{
        preferences,
        updatePreference,
        isComplete,
        setComplete,
        isOnboardingComplete,
        getOnboardingDataForAPI,
        resetOnboarding,
        getOnboardingProgress,
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