import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OnboardingContextType, UserPreferences } from '../types/onboarding';
import { formatOnboardingDataForAPI, submitOnboardingData } from '../utils/onboardingAPI';

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const initialPreferences: UserPreferences = {
  language: 'en',
  gender: null,
  workoutsPerWeek: null,
  discoverySource: null,
  trainingReason: null,
  gymChallenge: null,
  lifterType: null,
  perfectFormGoal: null,
  formConfidence: null,
  threeMonthGoal: null,
  hasPersonalTrainer: null,
  unitSystem: 'metric',
  referralCode: null,
  referralCodeDiscount: null,
  referralCodeValidOn: null,
  metricHeight: 170,
  metricWeight: 60,
  birthDate: null,
  hasRated: null,
  subscriptionPlan: null,
  subscriptionCost: null,
  subscriptionActive: null,
  subscriptionStartDate: null,
  subscriptionRenewalDate: null,
  freeTrialActive: null,
  freeTrialStartDate: null,
  freeTrialEndDate: null,
  signInMethod: null,
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

  // Function to get all onboarding data in API-ready format
  const getOnboardingDataForAPI = () => {
    return preferences;
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
      'trainingReason',
      'gymChallenge',
      'lifterType',
      'perfectFormGoal',
      'formConfidence',
      'threeMonthGoal',
      'hasPersonalTrainer',
      'metricHeight',
      'metricWeight',
      'birthDate',
      'hasRated',
      'subscriptionPlan',
      'subscriptionActive',
    ];
    
    const completedFields = requiredFields.filter(field => 
      preferences[field as keyof UserPreferences] !== null && 
      preferences[field as keyof UserPreferences] !== undefined
    );
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Function to persist onboarding data to API/database
  const persistOnboardingData = async (apiEndpoint?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Format data for API
      const apiPayload = formatOnboardingDataForAPI(preferences);
      
      // Use provided endpoint or default
      const endpoint = apiEndpoint || 'https://api.yourapp.com/onboarding';
      
      // Submit to API
      const result = await submitOnboardingData(apiPayload, endpoint);
      
      if (result.success) {
        console.log('Onboarding data persisted successfully');
        return { success: true };
      } else {
        console.error('Failed to persist onboarding data:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error persisting onboarding data:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        preferences,
        updatePreference,
        isComplete,
        setComplete,
        getOnboardingDataForAPI,
        resetOnboarding,
        getOnboardingProgress,
        persistOnboardingData,
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