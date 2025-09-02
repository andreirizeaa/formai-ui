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
import { useUserDetails } from './src/context/UserDetailsContext';
import { useLiftData } from './src/context/LiftDataContext';

// Component that can access context providers to check loading states
function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<
    'Welcome' | 'Payment'
  >('Welcome');
  const { customerInfo, isInitializing } = usePurchases();
  const { isUserDetailsLoaded } = useUserDetails();
  const { isLiftDataLoaded } = useLiftData();

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
  }, [customerInfo]);

  // Check if all required data is loaded before showing the app
  const isAllDataLoaded = !isInitializing && isUserDetailsLoaded && isLiftDataLoaded;

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

  // Show loading screen until all data is loaded
  if (isLoading || !isAllDataLoaded) {
    return (
      <SafeAreaProvider>
        <LoadingScreen onLoadComplete={() => {}} />
      </SafeAreaProvider>
    );
  }

  const mainAppContent = <MainAppLayout onLogout={handleLogout} />;

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

export function Layout() {
  const queryClientRef = React.useRef<QueryClient | null>(null);

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <WalletCreditProvider>
        <UserDetailsProvider>
          <LiftDataProvider>
            <UserCheckInsProvider>
              <SelectedDateProvider>
                <LoadingLiftsProvider>
                  <AppContent />
                </LoadingLiftsProvider>
              </SelectedDateProvider>
            </UserCheckInsProvider>
          </LiftDataProvider>
        </UserDetailsProvider>
      </WalletCreditProvider>
    </QueryClientProvider>
  );
}
