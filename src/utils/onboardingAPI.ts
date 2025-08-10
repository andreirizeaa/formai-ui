import { UserPreferences } from '../types/onboarding';
import { Platform } from 'react-native';

// Interface for the API request payload
export interface OnboardingAPIPayload {
  language: string;
  unitSystem: 'metric' | 'imperial';
  gender: 'male' | 'female' | null;
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | null;
  workoutsPerWeek: '0' | '1-3' | '3-5' | '5-7' | null;
  discoverySource: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other' | null;
  liftingGoal: 'muscle_building' | 'powerlifting' | 'toning' | 'strength' | 'weight_loss' | null;
  formBarrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time' | 'other' | null;
  hasPersonalTrainer: boolean | null;
  referralCode: string | null;
  referralCodeDiscount: number | null;
  referralCodeValidOn: 'monthly' | 'yearly' | null;
  metricHeight: number | null;
  metricWeight: number | null;
  birthDate: string | null; // Format: 'YYYY-MM-DD'
  hasRated: boolean | null;
  subscriptionPlan: 'monthly' | 'yearly' | null;
  subscriptionCost: number | null;
  subscriptionActive: boolean | null;
  subscriptionStartDate: string | null;
  subscriptionRenewalDate: string | null;
  freeTrialActive: boolean | null;
  freeTrialStartDate: string | null;
  freeTrialEndDate: string | null;
  signInMethod: 'google' | 'apple' | null;
  age: number | null;
  bmi: number | null;
  createdAt: string;
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
  };
}

// Function to validate onboarding data before API submission
export function validateOnboardingData(preferences: UserPreferences): boolean {
  const requiredFields = [
    'language',
    'unitSystem',
    'gender',
    'goal',
    'workoutsPerWeek',
    'discoverySource',
    'liftingGoal',
    'formBarrier',
    'hasPersonalTrainer',
    'metricHeight',
    'metricWeight',
    'birthDate',
    'hasRated',
    'subscriptionPlan',
    'subscriptionActive'
  ];

  for (const field of requiredFields) {
    const value = preferences[field as keyof UserPreferences];
    if (value === null || value === undefined) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate birth date format (should be YYYY-MM-DD string)
  if (preferences.birthDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(preferences.birthDate)) {
      console.error('Invalid birth date format. Expected YYYY-MM-DD');
      return false;
    }
  }

  return true;
}

// Function to format onboarding data for API submission
export function formatOnboardingDataForAPI(preferences: UserPreferences): OnboardingAPIPayload {
  if (!validateOnboardingData(preferences)) {
    throw new Error('Invalid onboarding data');
  }

  // Calculate age from birthDate string
  const age = preferences.birthDate ? calculateAge(preferences.birthDate) : null;
  
  // Calculate BMI from metric height and weight
  const bmi = preferences.metricHeight && preferences.metricWeight ? calculateBMI(preferences.metricHeight, preferences.metricWeight) : null;

  return {
    language: preferences.language,
    unitSystem: preferences.unitSystem,
    gender: preferences.gender,
    goal: preferences.goal,
    workoutsPerWeek: preferences.workoutsPerWeek,
    discoverySource: preferences.discoverySource,
    liftingGoal: preferences.liftingGoal,
    formBarrier: preferences.formBarrier,
    hasPersonalTrainer: preferences.hasPersonalTrainer,
    referralCode: preferences.referralCode,
    referralCodeDiscount: preferences.referralCodeDiscount,
    referralCodeValidOn: preferences.referralCodeValidOn,
    metricHeight: preferences.metricHeight,
    metricWeight: preferences.metricWeight,
    birthDate: preferences.birthDate,
    hasRated: preferences.hasRated,
    subscriptionPlan: preferences.subscriptionPlan,
    subscriptionCost: preferences.subscriptionCost,
    subscriptionActive: preferences.subscriptionActive,
    subscriptionStartDate: preferences.subscriptionStartDate,
    subscriptionRenewalDate: preferences.subscriptionRenewalDate,
    freeTrialActive: preferences.freeTrialActive,
    freeTrialStartDate: preferences.freeTrialStartDate,
    freeTrialEndDate: preferences.freeTrialEndDate,
    signInMethod: preferences.signInMethod,
    age,
    bmi,
    createdAt: new Date().toISOString(),
    deviceInfo: {
      platform: Platform.OS,
      version: Platform.Version?.toString() || 'unknown',
      model: Platform.constants?.Brand || 'unknown',
    },
  };
}

// Helper function to calculate age from birth date
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to calculate BMI
function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// Function to submit onboarding data to API
export async function submitOnboardingData(apiPayload: OnboardingAPIPayload, apiEndpoint: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Function to get onboarding progress for analytics
export function getOnboardingAnalytics(preferences: UserPreferences) {
  const totalSteps = 15;
  const completedSteps = [
    preferences.language && 1,
    preferences.unitSystem && 1,
    preferences.gender && 1,
    preferences.goal && 1,
    preferences.workoutsPerWeek && 1,
    preferences.discoverySource && 1,
    preferences.liftingGoal && 1,
    preferences.formBarrier && 1,
    preferences.hasPersonalTrainer !== null && 1,
    preferences.metricHeight && 1,
    preferences.metricWeight && 1,
    preferences.birthDate && 1,
    preferences.hasRated !== null && 1,
    preferences.subscriptionPlan && 1,
    preferences.subscriptionActive !== null && 1,
  ].filter(Boolean).length;

  return {
    progress: Math.round((completedSteps / totalSteps) * 100),
    completedSteps,
    totalSteps,
    isComplete: completedSteps === totalSteps,
    missingFields: getMissingFields(preferences),
  };
}

// Helper function to get missing fields
function getMissingFields(preferences: UserPreferences): string[] {
  const requiredFields = [
    { key: 'language', label: 'Language' },
    { key: 'unitSystem', label: 'Unit System' },
    { key: 'gender', label: 'Gender' },
    { key: 'goal', label: 'Goal' },
    { key: 'workoutsPerWeek', label: 'Workouts per Week' },
    { key: 'discoverySource', label: 'Discovery Source' },
    { key: 'liftingGoal', label: 'Lifting Goal' },
    { key: 'formBarrier', label: 'Form Barrier' },
    { key: 'hasPersonalTrainer', label: 'Personal Trainer' },
    { key: 'metricHeight', label: 'Height' },
    { key: 'metricWeight', label: 'Weight' },
    { key: 'birthDate', label: 'Birth Date' },
    { key: 'hasRated', label: 'Has Rated' },
    { key: 'subscriptionPlan', label: 'Subscription Plan' },
    { key: 'subscriptionActive', label: 'Subscription Active' },
  ];

  return requiredFields
    .filter(field => {
      const value = preferences[field.key as keyof UserPreferences];
      return value === null || value === undefined;
    })
    .map(field => field.label);
} 