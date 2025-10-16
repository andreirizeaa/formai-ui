import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SuperwallProvider as ExpoSuperwallProvider, SuperwallLoaded, useUser, useSuperwallEvents } from 'expo-superwall';
import { showAlert } from '../services/alertService';

// Internal subscription context derived from Superwall's useUser
interface SubscriptionContextValue {
  isInitializing: boolean;
  hasSubscription: boolean;
  hasHdVideos: boolean;
  subscriptionStatus: any | undefined;
  identify: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<Record<string, any>>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

interface SuperwallProviderProps {
  children: ReactNode;
}

export function SuperwallProvider({ children }: SuperwallProviderProps) {
  return (
    <ExpoSuperwallProvider 
      apiKeys={{ 
        ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY, 
      }}
    >
      <SuperwallLoaded>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </SuperwallLoaded>
    </ExpoSuperwallProvider>
  );
}

function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { identify, signOut, refresh, subscriptionStatus } = useUser();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasHdVideos, setHasHdVideos] = useState(false);

  // Listen for subscription status changes
  useSuperwallEvents({
    onSubscriptionStatusChange: async (status) => {
      // Check entitlements and update context immediately
      const ents = Array.isArray((status as any).entitlements) ? (status as any).entitlements : [];
      const hasFullAccess = ents?.some((e: any) => e?.id === 'full_access');
      const hasHdVideosEntitlement = ents?.some((e: any) => e?.id === 'hd_videos');
      
      setHasSubscription(hasFullAccess);
      setHasHdVideos(hasHdVideosEntitlement);
      
      // Refresh subscription status to ensure context is up to date
      try {
        await refresh();
      } catch (error) {
        // Silently handle refresh errors
      }
    },
  });

  // Update subscription state when subscriptionStatus changes
  useEffect(() => {
    if (subscriptionStatus) {
      const ents = Array.isArray((subscriptionStatus as any)?.entitlements) ? (subscriptionStatus as any).entitlements : [];
      const hasFullAccess = ents?.some((e: any) => e?.id === 'full_access');
      const hasHdVideosEntitlement = ents?.some((e: any) => e?.id === 'hd_videos');
      
      setHasSubscription(hasFullAccess);
      setHasHdVideos(hasHdVideosEntitlement);
    }
  }, [subscriptionStatus]);

  // Initial refresh
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refresh();
      } catch (error) {
        showAlert(
          'Error',
          'Unable to refresh subscription status. Please check your connection.',
          undefined,
          'SUPERWALL_REFRESH_ERROR',
          error
        );
      } finally {
        if (mounted) setIsInitializing(false);
      }
    })();
    return () => { mounted = false; };
  }, [refresh]);

  const value: SubscriptionContextValue = {
    isInitializing,
    hasSubscription,
    hasHdVideos,
    subscriptionStatus,
    identify,
    signOut,
    refresh,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SuperwallProvider');
  return ctx;
}

// Export hooks from expo-superwall for convenience
export { useUser, useSuperwallEvents };
