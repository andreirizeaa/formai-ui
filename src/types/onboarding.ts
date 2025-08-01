export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UserPreferences {
  language: string;
  gender: 'male' | 'female' | 'other' | null;
  goal: 'lose_weight' | 'maintain' | 'gain_weight' | null;
  workoutsPerWeek: '0' | '1-3' | '3-5' | '5-7' | null;
  discoverySource: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other' | null;
  hasPersonalTrainer: boolean | null;
  height: number | null; // in cm
  weight: number | null; // in kg
  birthDate: {
    month: number | null;
    day: number | null;
    year: number | null;
  } | null;
  unitSystem: 'metric' | 'imperial';
  liftingGoal: 'muscle_building' | 'powerlifting' | 'toning' | 'strength' | 'weight_loss' | null;
  formBarrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time' | 'other' | null;
  rating: number | null;
  referralCode: string | null;
}

export interface OnboardingContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  isComplete: boolean;
  setComplete: (complete: boolean) => void;
} 