import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingLiftsProvider } from './src/context/LoadingLiftsContext';
import { LiftDataProvider } from './src/context/LiftDataContext';
import { UserDetailsProvider } from './src/context/UserDetailsContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainAppLayout } from './src/components/layout/MainAppLayout';
import { UserCheckInsProvider } from './src/context/UserCheckInsContext';
import { WalletCreditProvider } from './src/context/WalletCreditContext';
import { SelectedDateProvider } from './src/context/SelectedDateContext';
import { supabase } from './src/lib/supabase';
import { getUserId, removeUserId } from './src/services/storageService';
import { LoadingScreen } from './src/screens/onboarding/LoadingScreen';
import { fetchUserById, requiresOnboarding } from './src/services/userService';
import { usePurchases } from './src/context/PurchasesContext';

export function Layout() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<
    'Welcome' | 'Payment'
  >('Welcome');
  const queryClientRef = React.useRef<QueryClient | null>(null);
  const { customerInfo } = usePurchases();

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

        if (customerInfo?.activeSubscriptions.length === 0) {
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
      <QueryClientProvider client={queryClientRef.current}>
        <WalletCreditProvider>
          <UserDetailsProvider>
            <LiftDataProvider>
              <LoadingLiftsProvider>
                <UserCheckInsProvider>
                  <SelectedDateProvider>
                    <MainAppLayout onLogout={handleLogout} />
                  </SelectedDateProvider>
                </UserCheckInsProvider>
              </LoadingLiftsProvider>
            </LiftDataProvider>
          </UserDetailsProvider>
        </WalletCreditProvider>
      </QueryClientProvider>
    </>
  );

  const onboardingContent = (
    <OnboardingNavigator
      onComplete={handlePaymentComplete}
      onSignIn={handleSignIn}
      onUserNeedsOnboarding={handleUserNeedsOnboarding}
      initialRouteName={onboardingInitialRoute}
    />
  );

  if (showOnboarding || userNeedsOnboarding) {
    return onboardingContent;
  }

  return mainAppContent;
}
