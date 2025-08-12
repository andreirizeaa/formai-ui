import { UserPreferences } from '../types/onboarding';
import { Platform } from 'react-native';

// Interface for the API request payload
export interface OnboardingAPIPayload {
  language: string;
  unitSystem: 'metric' | 'imperial';
  gender: 'male' | 'female' | null;
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | null;
  workoutsPerWeek: '1-2' | '3-4' | '5-6' | 'every_day' | 'it_varies' | null;
  discoverySource: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other' | null;
  lifterType: 'beginner' | 'intermediate' | 'advanced' | 'returning_after_break' | 'injury_rehab' | null;
  perfectFormGoal: 'lift_heavier_safely' | 'build_muscle_efficiently' | 'avoid_injuries' | 'boost_confidence' | 'train_longer_without_setbacks' | null;
  formConfidence: '0-25' | '25-50' | '50-75' | '75-100' | null;
  threeMonthGoal: 'lifting_heavier' | 'looking_leaner' | 'feeling_stronger_injury_free' | 'more_consistent' | 'more_confident' | null;
  trainingReason: 'build_strength' | 'improve_physique' | 'prevent_injury' | 'train_for_sport' | 'stay_active_healthy' | null;
  gymChallenge: 'unsure_form' | 'no_results' | 'worried_injury' | 'struggling_motivation' | 'other' | null;
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

  for (const field of requiredFields) {
    const value = preferences[field as keyof UserPreferences];
    if (value === null || value === undefined) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

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

  const age = preferences.birthDate ? calculateAge(preferences.birthDate) : null;
  const bmi = preferences.metricHeight && preferences.metricWeight ? calculateBMI(preferences.metricHeight, preferences.metricWeight) : null;

  return {
    language: preferences.language,
    unitSystem: preferences.unitSystem,
    gender: preferences.gender,
    goal: preferences.goal,
    workoutsPerWeek: preferences.workoutsPerWeek,
    discoverySource: preferences.discoverySource,
    trainingReason: preferences.trainingReason,
    gymChallenge: preferences.gymChallenge,
    lifterType: preferences.lifterType,
    perfectFormGoal: preferences.perfectFormGoal,
    formConfidence: preferences.formConfidence,
    threeMonthGoal: preferences.threeMonthGoal,
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
      version: (Platform.Version as any)?.toString?.() || String(Platform.Version) || 'unknown',
      model: Platform.constants && (Platform.constants as any).Model ? (Platform.constants as any).Model : 'unknown',
    },
  };
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export async function submitOnboardingData(apiPayload: OnboardingAPIPayload, apiEndpoint: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export function getOnboardingAnalytics(preferences: UserPreferences) {
  const totalSteps = 15;
  const completedSteps = [
    preferences.language && 1,
    preferences.unitSystem && 1,
    preferences.gender && 1,
    preferences.goal && 1,
    preferences.workoutsPerWeek && 1,
    preferences.discoverySource && 1,
    preferences.trainingReason && 1,
    preferences.gymChallenge && 1,
    preferences.lifterType && 1,
    preferences.perfectFormGoal && 1,
    preferences.formConfidence && 1,
    preferences.threeMonthGoal && 1,
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

function getMissingFields(preferences: UserPreferences): string[] {
  const requiredFields = [
    { key: 'language', label: 'Language' },
    { key: 'unitSystem', label: 'Unit System' },
    { key: 'gender', label: 'Gender' },
    { key: 'goal', label: 'Goal' },
    { key: 'workoutsPerWeek', label: 'Workouts per Week' },
    { key: 'discoverySource', label: 'Discovery Source' },
    { key: 'trainingReason', label: 'Training Reason' },
    { key: 'gymChallenge', label: 'Gym Challenge' },
    { key: 'lifterType', label: 'Lifter Type' },
    { key: 'perfectFormGoal', label: 'Perfect Form Goal' },
    { key: 'formConfidence', label: 'Form Confidence' },
    { key: 'threeMonthGoal', label: 'Three Month Goal' },
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