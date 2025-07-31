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
  discoverySource: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'google' | 'tv' | null;
}

export interface OnboardingContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  isComplete: boolean;
  setComplete: (complete: boolean) => void;
} 