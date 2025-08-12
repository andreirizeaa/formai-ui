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
  workoutsPerWeek: '1-2' | '3-4' | '5-6' | 'every_day' | 'it_varies' | null;
  discoverySource: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other' | null;
  trainingReason: 'build_strength' | 'improve_physique' | 'prevent_injury' | 'train_for_sport' | 'stay_active_healthy' | null;
  gymChallenge: 'unsure_form' | 'no_results' | 'worried_injury' | 'struggling_motivation' | 'other' | null;
  lifterType: 'beginner' | 'intermediate' | 'advanced' | 'returning_after_break' | 'injury_rehab' | null;
  perfectFormGoal: 'lift_heavier_safely' | 'build_muscle_efficiently' | 'avoid_injuries' | 'boost_confidence' | 'train_longer_without_setbacks' | null;
  formConfidence: '0-25' | '25-50' | '50-75' | '75-100' | null;
  threeMonthGoal: 'lifting_heavier' | 'looking_leaner' | 'feeling_stronger_injury_free' | 'more_consistent' | 'more_confident' | null;
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