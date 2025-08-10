export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UserPreferences {
  language: string;
  gender: 'male' | 'female' | null;
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | null;
  workoutsPerWeek: '0' | '1-3' | '3-5' | '5-7' | null;
  discoverySource: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other' | null;
  liftingGoal: 'muscle_building' | 'powerlifting' | 'toning' | 'strength' | 'weight_loss' | null;
  formBarrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time' | 'other' | null;
  hasPersonalTrainer: boolean | null;
  unitSystem: 'metric' | 'imperial';
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
}

export interface OnboardingContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  isComplete: boolean;
  setComplete: (complete: boolean) => void;
  getOnboardingDataForAPI: () => UserPreferences;
  resetOnboarding: () => void;
  getOnboardingProgress: () => number;
} 