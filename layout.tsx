import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingLiftsProvider } from './src/context/LoadingLiftsContext';
import { LiftDataProvider } from './src/context/LiftDataContext';
import { UserDetailsProvider } from './src/context/UserDetailsContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainAppLayout } from './src/components/layout/MainAppLayout';
import { StreakProvider } from './src/context/StreakContext';
import { WalletCreditProvider } from './src/context/WalletCreditContext';
import { supabase } from './src/lib/supabase';
import { getUserId, removeUserId } from './src/services/storageService';
import { LoadingScreen } from './src/screens/onboarding/LoadingScreen';
import { fetchUserById, requiresOnboarding, requiresPayment } from './src/services/userService';
import { useSuperwall, useSuperwallEvents } from 'expo-superwall';
import Purchases from 'react-native-purchases';
import { hapticFeedback } from './src/utils/haptic';

function SubscriptionSync() {
  const { setSubscriptionStatus } = useSuperwall();
  
  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener((customerInfo: any) => {
      const entitlementIds = Object.keys(customerInfo.entitlements.active);      
      setSubscriptionStatus({
        status: entitlementIds.length === 0 ? "INACTIVE" : "ACTIVE",
        entitlements: entitlementIds.map(id => ({ 
          id, 
          type: "SERVICE_LEVEL" 
        }))
      });
    });
    
    // Get initial customer info
    const syncInitialStatus = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const entitlementIds = Object.keys(customerInfo.entitlements.active);
        
        setSubscriptionStatus({
          status: entitlementIds.length === 0 ? "INACTIVE" : "ACTIVE",
          entitlements: entitlementIds.map(id => ({ 
            id, 
            type: "SERVICE_LEVEL" 
          }))
        });
      } catch (error) {
        console.error("Failed to sync initial subscription status:", error);
      }
    };
    
    syncInitialStatus();
  }, [setSubscriptionStatus]);
  
  return null; // This component just handles the sync
}

export function Layout() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<
    'Welcome' | 'Payment'
  >('Welcome');
  const queryClientRef = React.useRef<QueryClient | null>(null);

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  useEffect(() => {
    async function setActiveLayout() {
      try {
        const storedUserId = await getUserId();
        if (!storedUserId) {
          setShowOnboarding(true);
          setOnboardingInitialRoute('Welcome');
          return;
        }

        const { user } = await fetchUserById(storedUserId);
        if (!user) {
          setShowOnboarding(true);
          setOnboardingInitialRoute('Welcome');
          return;
        }

        if (requiresOnboarding(user)) {
          setShowOnboarding(true);
          return;
        }

        if (requiresPayment(user)) {
          setShowOnboarding(true);
          setOnboardingInitialRoute('Payment');
          return;
        }
        setShowOnboarding(false);
      } catch (e) {
        console.warn('Bootstrap error:', e);
        setShowOnboarding(true);
        setOnboardingInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    }

    setActiveLayout();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setUserNeedsOnboarding(false);
  };

  const handleSignIn = () => {
    setShowOnboarding(false);
    setUserNeedsOnboarding(false);
  };

  const handlePaymentComplete = () => {
    handleOnboardingComplete();
  };

  const handleUserNeedsOnboarding = () => {
    setUserNeedsOnboarding(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await removeUserId();
      setShowOnboarding(true);
      setOnboardingInitialRoute('Welcome');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen onLoadComplete={() => {}} />
      </SafeAreaProvider>
    );
  }

  const mainAppContent = (
    <>
      <SubscriptionSync />
      <QueryClientProvider client={queryClientRef.current}>
        <WalletCreditProvider>
          <UserDetailsProvider>
            <LiftDataProvider>
              <LoadingLiftsProvider>
                <StreakProvider>
                  <MainAppLayout onLogout={handleLogout} />
                </StreakProvider>
              </LoadingLiftsProvider>
            </LiftDataProvider>
          </UserDetailsProvider>
        </WalletCreditProvider>
      </QueryClientProvider>
    </>
  );

  const onboardingContent = (
    <>
      <SubscriptionSync />
        <OnboardingNavigator
          onComplete={handlePaymentComplete}
          onSignIn={handleSignIn}
          onUserNeedsOnboarding={handleUserNeedsOnboarding}
          initialRouteName={onboardingInitialRoute}
        />
    </>
  );

  if (showOnboarding || userNeedsOnboarding) {
    return onboardingContent;
  }

  return mainAppContent;
}
