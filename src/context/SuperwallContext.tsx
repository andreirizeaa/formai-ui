import React, { createContext, useContext, ReactNode } from 'react';
import { SuperwallProvider as ExpoSuperwallProvider, SubscriptionStatus, SuperwallLoaded, useSuperwall as useExpoSuperwall } from 'expo-superwall';

interface SuperwallCustomerInfo {
  userId: string;
  isLoggedIn: boolean;
  userAttributes: Record<string, any>;
  subscriptionStatus: SubscriptionStatus;
  active: boolean;
}

interface SuperwallContextValue {
  superwallCustomerInfo: SuperwallCustomerInfo;
  identifyUser: (userId: string) => Promise<void>;
}

const SuperwallContext = createContext<SuperwallContextValue | undefined>(undefined);

interface SuperwallProviderProps {
  children: ReactNode;
}

// Component that uses Superwall hooks and provides context
function SuperwallContextProvider({ children }: SuperwallProviderProps) {
  const superwall = useExpoSuperwall();
  


  async function identifyUser(userId: string) {
    await superwall.identify(userId);
  }

  // Get subscription status from Superwall
  const subscriptionStatus = superwall.subscriptionStatus;

  const superwallCustomerInfo: SuperwallCustomerInfo = {
    userId: superwall.user?.id ?? '',
    isLoggedIn: superwall.user?.isLoggedIn ?? false,
    userAttributes: {},
    subscriptionStatus,
    active: subscriptionStatus?.status === 'ACTIVE',
  };

  const contextValue: SuperwallContextValue = {
    superwallCustomerInfo,
    identifyUser,
  };

  return (
    <SuperwallContext.Provider value={contextValue}>
      {children}
    </SuperwallContext.Provider>
  );
}

export function SuperwallProvider({ children }: SuperwallProviderProps) {
  return (
    <ExpoSuperwallProvider 
      apiKeys={{ 
        ios: "pk_zkKfyLcFhibPvjADIBNgv", 
      }}
    >
      <SuperwallLoaded>
        <SuperwallContextProvider>
          {children}
        </SuperwallContextProvider>
      </SuperwallLoaded>
    </ExpoSuperwallProvider>
  );
}

export function useSuperwall() {
  const ctx = useContext(SuperwallContext);
  if (!ctx) throw new Error('useSuperwall must be used within a SuperwallProvider');
  return ctx;
}

export function useSuperwallContext() {
  const ctx = useContext(SuperwallContext);
  if (!ctx) throw new Error('useSuperwallContext must be used within a SuperwallProvider');
  return ctx;
}
