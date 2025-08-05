import { UserPreferences } from '../types/onboarding';
import { Platform } from 'react-native';

// Interface for the API request payload
export interface OnboardingAPIPayload {
  language: string;
  unitSystem: 'metric' | 'imperial';
  gender: 'male' | 'female' | 'other';
  goal: 'lose_weight' | 'maintain' | 'gain_weight';
  workoutsPerWeek: '0' | '1-3' | '3-5' | '5-7';
  discoverySource: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other';
  hasPersonalTrainer: boolean;
  height: number; // Always in cm
  weight: number; // Always in kg
  birthDate: {
    month: number;
    day: number;
    year: number;
  };
  liftingGoal: 'muscle_building' | 'powerlifting' | 'toning' | 'strength' | 'weight_loss';
  formBarrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time' | 'other';
  rating: number;
  referralCode?: string;
  age: number;
  bmi: number;
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
    'hasPersonalTrainer',
    'height',
    'weight',
    'birthDate',
    'liftingGoal',
    'formBarrier',
    'rating'
  ];

  for (const field of requiredFields) {
    const value = preferences[field as keyof UserPreferences];
    if (value === null || value === undefined) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate birth date structure
  if (preferences.birthDate) {
    const { month, day, year } = preferences.birthDate;
    if (!month || !day || !year) {
      console.error('Invalid birth date structure');
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

  // Calculate age
  const age = calculateAge(preferences.birthDate!);
  
  // Calculate BMI
  const bmi = calculateBMI(preferences.height!, preferences.weight!);

  return {
    language: preferences.language,
    unitSystem: preferences.unitSystem,
    gender: preferences.gender!,
    goal: preferences.goal!,
    workoutsPerWeek: preferences.workoutsPerWeek!,
    discoverySource: preferences.discoverySource!,
    hasPersonalTrainer: preferences.hasPersonalTrainer!,
    height: preferences.height!, // Always in cm
    weight: preferences.weight!, // Always in kg
    birthDate: preferences.birthDate!,
    liftingGoal: preferences.liftingGoal!,
    formBarrier: preferences.formBarrier!,
    rating: preferences.rating!,
    referralCode: preferences.referralCode || undefined,
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
function calculateAge(birthDate: { month: number; day: number; year: number }): number {
  const today = new Date();
  const birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
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
  const totalSteps = 13;
  const completedSteps = [
    preferences.language && 1,
    preferences.unitSystem && 1,
    preferences.gender && 1,
    preferences.goal && 1,
    preferences.workoutsPerWeek && 1,
    preferences.discoverySource && 1,
    preferences.hasPersonalTrainer !== null && 1,
    preferences.height && 1,
    preferences.weight && 1,
    preferences.birthDate && 1,
    preferences.liftingGoal && 1,
    preferences.formBarrier && 1,
    preferences.rating && 1,
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
    { key: 'hasPersonalTrainer', label: 'Personal Trainer' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' },
    { key: 'birthDate', label: 'Birth Date' },
    { key: 'liftingGoal', label: 'Lifting Goal' },
    { key: 'formBarrier', label: 'Form Barrier' },
    { key: 'rating', label: 'Rating' },
  ];

  return requiredFields
    .filter(field => {
      const value = preferences[field.key as keyof UserPreferences];
      return value === null || value === undefined;
    })
    .map(field => field.label);
} 