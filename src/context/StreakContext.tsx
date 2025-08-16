import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { getUserId } from '../services/storageService';
import { fetchUserStreakDays } from '../services/streakService';

interface StreakContextType {
  isLoading: boolean;
  error: string | null;
  daysLogged: string[];
  refetch: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

interface StreakProviderProps {
  children: ReactNode;
}

export function StreakProvider({ children }: StreakProviderProps) {
  const [daysLogged, setDaysLogged] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStreaks(): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const userId = await getUserId();
      if (!userId) {
        setDaysLogged([]);
        setIsLoading(false);
        return;
      }

      const list = await fetchUserStreakDays(userId);
      setDaysLogged(list);
    } catch (e: any) {
      setDaysLogged([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStreaks();
  }, []);

  const value = useMemo<StreakContextType>(() => ({
    isLoading,
    error,
    daysLogged,
    refetch: fetchStreaks,
  }), [isLoading, error, daysLogged]);

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within a StreakProvider');
  return ctx;
}


