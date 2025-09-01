import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserId } from '../services/storageService';
import { fetchUserDetailsById, editUserDetails } from '../services/userService';
import { 
  formatWeightForDisplay, 
  formatHeightForDisplay 
} from '../utils/unitConversions';

interface UserDetails {
  unitSystem: 'metric' | 'imperial' | null;
  currentWeightKG: number | null; 
  heightCM: number | null; 
  dateOfBirth: string | null; 
  gender: string | null;
  language: string | null;
  currentStreak: number | null;
  walkthroughCompleted: boolean | null;
  hasRated: boolean | null;
}

interface UserDetailsContextType {
  userDetails: UserDetails | null;
  updateUserDetails: <K extends keyof UserDetails>(key: K, value: UserDetails[K]) => void;
  updateUnitSystem: (unitSystem: 'metric' | 'imperial') => void;
  // Helper methods for weight and height
  updateWeight: (weightKg: number) => void;
  updateHeight: (heightCm: number) => void;
  updateHasRated: (rated: boolean) => void;
  updateWalkthroughCompleted: (completed: boolean) => void;
  getWeightDisplay: () => string;
  getHeightDisplay: () => string;
  getDateOfBirthDisplay: () => string;
  formatDateForDisplay: (dateString: string) => string;
  refetchUserDetails: () => Promise<void>;
  isUserDetailsLoaded: boolean;
}

const UserDetailsContext = createContext<UserDetailsContextType | undefined>(undefined);

const initialUserDetails: UserDetails | null = null;

interface UserDetailsProviderProps {
  children: ReactNode;
}

export function UserDetailsProvider({ children }: UserDetailsProviderProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(initialUserDetails);
  const queryClient = useQueryClient();
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    getUserId().then(setUserIdState).catch(() => setUserIdState(null));
    setIsLoaded(false);
  }, []);

  // Set loaded to true if there's no userId (onboarding case)
  useEffect(() => {
    if (userId === null) {
      setIsLoaded(true);
    }
  }, [userId]);

  useQuery({
    queryKey: ['user-details', userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        if (!userId) return null;
        const row = await fetchUserDetailsById(userId);
        if (!row) return null;
        // Map server values to context state; do not hardcode defaults
        setUserDetails({
          unitSystem: row.unit_system ?? null,
          currentWeightKG: row.metric_weight ?? null,
          heightCM: row.metric_height ?? null,
          dateOfBirth: row.birth_date ? formatDateFromIso(row.birth_date) : null,
          gender: row.gender ?? null,
          language: row.language ?? null,
          currentStreak: row.current_streak ?? null,
          walkthroughCompleted: row.walkthrough_completed ?? null,
          hasRated: row.has_rated ?? null,
        });
        return row;
      } finally {
        setIsLoaded(true);
      }
    },
  });

  const updateUserDetails = <K extends keyof UserDetails>(
    key: K,
    value: UserDetails[K]
  ) => {
    setUserDetails(prev => {
      const base: UserDetails = prev ?? {
        unitSystem: null,
        currentWeightKG: null,
        heightCM: null,
        dateOfBirth: null,
        gender: null,
        language: null,
        currentStreak: null,
        walkthroughCompleted: null,
        hasRated: null,
      };
      return { ...base, [key]: value };
    });
  };

  const updateUnitSystem = (unitSystem: 'metric' | 'imperial') => {
    setUserDetails(prev => {
      const base: UserDetails = prev ?? {
        unitSystem: null,
        currentWeightKG: null,
        heightCM: null,
        dateOfBirth: null,
        gender: null,
        language: null,
        currentStreak: null,
        walkthroughCompleted: null,
        hasRated: null,
      };
      return { ...base, unitSystem };
    });
  };

  const updateWeight = (weightKg: number) => {
    setUserDetails(prev => {
      const base: UserDetails = prev ?? {
        unitSystem: null,
        currentWeightKG: null,
        heightCM: null,
        dateOfBirth: null,
        gender: null,
        language: null,
        currentStreak: null,
        walkthroughCompleted: null,
        hasRated: null,
      };
      return { ...base, currentWeightKG: weightKg };
    });
  };

  const updateHeight = (heightCm: number) => {
    setUserDetails(prev => {
      const base: UserDetails = prev ?? {
        unitSystem: null,
        currentWeightKG: null,
        heightCM: null,
        dateOfBirth: null,
        gender: null,
        language: null,
        currentStreak: null,
        walkthroughCompleted: null,
        hasRated: null,
      };
      return { ...base, heightCM: heightCm };
    });
  };

  const updateWalkthroughCompleted = (completed: boolean) => {
    setUserDetails(prev => {
      const base: UserDetails = prev ?? {
        unitSystem: null,
        currentWeightKG: null,
        heightCM: null,
        dateOfBirth: null,
        gender: null,
        language: null,
        currentStreak: null,
        walkthroughCompleted: null,
        hasRated: null,
      };
      return { ...base, walkthroughCompleted: completed };
    });
  };

  const updateHasRated = (rated: boolean) => {
    setUserDetails(prev => {
      const base: UserDetails = prev ?? {
        unitSystem: null,
        currentWeightKG: null,
        heightCM: null,
        dateOfBirth: null,
        gender: null,
        language: null,
        currentStreak: null,
        walkthroughCompleted: null,
        hasRated: null,
      };
      return { ...base, hasRated: rated };
    });
  };

  const getWeightDisplay = (): string => {
    if (!userDetails || userDetails.currentWeightKG == null || !userDetails.unitSystem) return '';
    return formatWeightForDisplay(userDetails.currentWeightKG, userDetails.unitSystem);
  };

  const getHeightDisplay = (): string => {
    if (!userDetails || userDetails.heightCM == null || !userDetails.unitSystem) return '';
    return formatHeightForDisplay(userDetails.heightCM, userDetails.unitSystem);
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      // Parse DD-MM-YYYY format
      const [day, month, year] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDateOfBirthDisplay = (): string => {
    if (!userDetails || !userDetails.dateOfBirth) return '';
    return formatDateForDisplay(userDetails.dateOfBirth);
  };

  function formatDateFromIso(iso: string): string {
    // iso: YYYY-MM-DD -> DD-MM-YYYY
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return userDetails?.dateOfBirth ?? '01-01-2000';
    return `${d}-${m}-${y}`;
  }

  const refetchUserDetails = async () => {
    await queryClient.invalidateQueries({ queryKey: ['user-details', userId] });
  };

  const value = useMemo(
    () => ({
      userDetails,
      updateUserDetails,
      updateUnitSystem,
      updateWeight,
      updateHeight,
      updateWalkthroughCompleted,
      updateHasRated,
      getWeightDisplay,
      getHeightDisplay,
      getDateOfBirthDisplay,
      formatDateForDisplay,
      refetchUserDetails,
      isUserDetailsLoaded: isLoaded,
    }), [
      userDetails,
      updateUserDetails,
      updateUnitSystem,
      updateWeight,
      updateHeight,
      updateWalkthroughCompleted,
      updateHasRated,
      getWeightDisplay,
      getHeightDisplay,
      getDateOfBirthDisplay,
      formatDateForDisplay,
      refetchUserDetails,
      isLoaded,
    ]
  );

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
}

export function useUserDetails() {
  const context = useContext(UserDetailsContext);
  if (context === undefined) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
} 