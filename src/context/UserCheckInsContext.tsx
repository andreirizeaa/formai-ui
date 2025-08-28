import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserId } from '../services/storageService';
import { fetchUserCheckIns, CheckInsResponse } from '../services/userCheckInsService';

interface UserCheckInsContextType {
  isLoading: boolean;
  error: string | null;
  daysLogged: string[];
  checkInDates: string[];
  currentStreak: number;
  refetch: () => void;
  invalidateAndRefetch: () => void;
  data: CheckInsResponse | undefined;
}

const UserCheckInsContext = createContext<UserCheckInsContextType | undefined>(undefined);

interface UserCheckInsProviderProps {
  children: ReactNode;
}

export function UserCheckInsProvider({ children }: UserCheckInsProviderProps) {
  const [userId, setUserId] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get user ID on mount
  React.useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userCheckIns', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user ID available');
      return fetchUserCheckIns(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Function to invalidate and refetch data
  const invalidateAndRefetch = React.useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['userCheckIns', userId] });
    }
  }, [userId, queryClient]);

  // Format dates for backward compatibility
  const daysLogged = React.useMemo(() => {
    if (!data?.check_in_dates) return [];
    return data.check_in_dates.map(date => {
      const [year, month, day] = date.split('-');
      if (!year || !month || !day) return date;
      return `${day}-${month}-${year}`;
    });
  }, [data?.check_in_dates]);

  const value: UserCheckInsContextType = {
    isLoading,
    error: error?.message || null,
    daysLogged,
    checkInDates: data?.check_in_dates || [],
    currentStreak: data?.current_streak || 0,
    refetch: () => refetch(),
    invalidateAndRefetch,
    data,
  };

  return (
    <UserCheckInsContext.Provider value={value}>
      {children}
    </UserCheckInsContext.Provider>
  );
}

export function useUserCheckIns() {
  const ctx = useContext(UserCheckInsContext);
  if (!ctx) throw new Error('useUserCheckIns must be used within a UserCheckInsProvider');
  return ctx;
}
