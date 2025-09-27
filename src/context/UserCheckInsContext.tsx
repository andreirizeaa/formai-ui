import React, { createContext, useContext, ReactNode } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getUserId } from '../services/storageService';
import { fetchUserCheckIns, CheckInsResponse } from '../services/userCheckInsService';

interface UserCheckInsContextType {
  isLoading: boolean;
  error: string | null;
  daysLogged: string[];
  checkInDates: string[];
  currentStreak: number;
  refetch: () => void;
  invalidateAndRefetch: (opts?: { userId?: string }) => void;
  data: CheckInsResponse | undefined;
  optimisticAddToday: (opts?: { userId?: string; date?: string }) => void;
  optimisticRemoveToday: (opts?: { userId?: string; date?: string }) => void;
  setSignedInUser: (id: string | null) => void;
}

const UserCheckInsContext = createContext<UserCheckInsContextType | undefined>(undefined);

interface UserCheckInsProviderProps {
  children: ReactNode;
}

export function UserCheckInsProvider({ children }: UserCheckInsProviderProps) {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [foregroundTick, setForegroundTick] = React.useState(0);
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
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Helper to compute current streak from ISO date strings (UTC-based)
  // Definition: length of the most recent consecutive sequence ending at the latest check-in date (≤ today)
  const computeCurrentStreak = React.useCallback((isoDates: string[]): number => {
    if (!isoDates?.length) return 0;
    const today = new Date().toISOString().slice(0, 10);
    const set = new Set(isoDates);

    // Find latest check-in date that is not in the future
    const latest = isoDates
      .filter(d => d <= today)
      .sort((a, b) => (a < b ? 1 : -1))[0];
    if (!latest) return 0;

    let streak = 0;
    let cursor = latest;
    while (set.has(cursor)) {
      streak += 1;
      const d = new Date(cursor);
      d.setUTCDate(d.getUTCDate() - 1);
      cursor = d.toISOString().slice(0, 10);
    }
    return streak;
  }, []);

  // Function to invalidate and refetch data
  const invalidateAndRefetch = React.useCallback((opts?: { userId?: string }) => {
    const uid = opts?.userId ?? userId;
    if (!uid) return;
    queryClient.invalidateQueries({ queryKey: ['userCheckIns', uid] });
    if (uid === userId) refetch();
  }, [userId, queryClient, refetch]);

  // Function to set signed in user immediately
  const setSignedInUser = React.useCallback((id: string | null) => {
    setUserId(id);
  }, []);

  // Realtime subscription: update cache immediately on INSERT/DELETE
  React.useEffect(() => {
    if (!userId) return;
    const QUERY_KEY = ['userCheckIns', userId] as const;
    const channel = supabase
      .channel(`user_check_ins:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_check_ins', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          const evt = payload?.eventType;
          const havePrev = !!queryClient.getQueryData(QUERY_KEY);
          if (!havePrev) {
            // Ensure we reconcile quickly if cache is empty
            queryClient.invalidateQueries({ queryKey: QUERY_KEY as any });
          }
          queryClient.setQueryData(QUERY_KEY, (old: any) => {
            const prev = old as import('../services/userCheckInsService').CheckInsResponse | undefined;
            if (!prev) return prev;
            // If server stores an aggregated array and emits UPDATE, use the new array directly
            const nextFromUpdate = Array.isArray(payload?.new?.check_in_dates) ? (payload.new.check_in_dates as string[]) : null;
            if (evt === 'UPDATE' && nextFromUpdate) {
              const uniq = Array.from(new Set(nextFromUpdate));
              const sorted = uniq.sort((a, b) => (a < b ? 1 : -1));
              return { ...prev, check_in_dates: sorted, current_streak: computeCurrentStreak(sorted) };
            }
            // Otherwise, fall back to per-row INSERT/DELETE semantics
            const row: any = payload?.new ?? payload?.old;
            const raw: any = row?.date ?? row?.check_in_date ?? row?.day ?? row?.lift_date ?? null;
            if (!raw) return prev;
            const d = String(raw).split('T')[0];
            const set = new Set(prev.check_in_dates || []);
            if (evt === 'INSERT') set.add(d);
            if (evt === 'DELETE') set.delete(d);
            const next = Array.from(set).sort((a, b) => (a < b ? 1 : -1));
            return { ...prev, check_in_dates: next, current_streak: computeCurrentStreak(next) };
          });
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          // Immediately sync with server on (re)subscribe
          queryClient.invalidateQueries({ queryKey: QUERY_KEY as any });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient, computeCurrentStreak, foregroundTick]);

  // On app foreground, re-subscribe and refetch to ensure fresh data
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setForegroundTick((t) => t + 1);
        invalidateAndRefetch();
      }
    });
    return () => { subscription.remove(); };
  }, [invalidateAndRefetch]);

  // Resubscribe on auth/session changes to keep channel healthy across logins
  React.useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(() => {
      setForegroundTick((t) => t + 1);
      invalidateAndRefetch();
    });
    return () => { try { sub.data.subscription.unsubscribe(); } catch {} };
  }, [invalidateAndRefetch]);

  // Format dates for backward compatibility
  const daysLogged = React.useMemo(() => {
    const serverDates = data?.check_in_dates || [];
    const uniqueDates = Array.from(new Set(serverDates));
    return uniqueDates.map(date => {
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
    currentStreak: (data?.current_streak || 0),
    refetch: () => refetch(),
    invalidateAndRefetch,
    data,
    setSignedInUser,
    optimisticAddToday: React.useCallback((opts?: { userId?: string; date?: string }) => {
      const uid = opts?.userId ?? userId;
      if (!uid) return;
      const today = (opts?.date ?? new Date().toISOString().slice(0, 10));
      queryClient.setQueryData(['userCheckIns', uid], (old: CheckInsResponse | undefined) => {
        if (!old) {
          return { success: true, message: '', user_id: uid, check_in_dates: [today], current_streak: 1 } as any;
        }
        if (old.check_in_dates?.includes(today)) return old;
        const next = [today, ...(old.check_in_dates || [])].sort((a, b) => (a < b ? 1 : -1));
        return { ...old, check_in_dates: next, current_streak: computeCurrentStreak(next) } as any;
      });
    }, [userId, queryClient]),
    optimisticRemoveToday: React.useCallback((opts?: { userId?: string; date?: string }) => {
      const uid = opts?.userId ?? userId;
      if (!uid) return;
      const today = (opts?.date ?? new Date().toISOString().slice(0, 10));
      queryClient.setQueryData(['userCheckIns', uid], (old: CheckInsResponse | undefined) => {
        if (!old) return old as any;
        const next = (old.check_in_dates || []).filter(d => d !== today);
        return { ...old, check_in_dates: next, current_streak: computeCurrentStreak(next) } as any;
      });
    }, [userId, queryClient]),
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
