import React, { useEffect, useState, useRef } from 'react';
import { Animated } from 'react-native';
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
import { AccountLoadingScreen } from './src/screens/onboarding/AccountLoadingScreen';
import { fetchUserById, requiresOnboarding } from './src/services/userService';
import { usePurchases } from './src/context/PurchasesContext';
import { useUserDetails } from './src/context/UserDetailsContext';
import { useLiftData } from './src/context/LiftDataContext';
import { track } from './src/services/analytics';
import { showAlert } from './src/services/alertService';

// Component that can access context providers to check loading states
function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(false); // Start as false to prevent flickering
  const [isLoading, setIsLoading] = useState(true);
  const [extraDelayDone, setExtraDelayDone] = useState(false);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<
    'Welcome' | 'Payment'
  >('Welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAccountLoading, setShowAccountLoading] = useState(false);
  const [passedInitialDataGate, setPassedInitialDataGate] = useState(false);
  const [appReady, setAppReady] = useState(false); // New state to control when app is ready
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { customerInfo, hasSubscription, isInitializing } = usePurchases();
  const { isUserDetailsLoaded, refetchUserDetails } = useUserDetails();
  const { isLiftDataLoaded } = useLiftData();

  useEffect(() => {
    async function setActiveLayout() {
      try {
        // Don't make routing decisions until RevenueCat is fully initialized
        if (isInitializing === true || isInitializing === undefined) {
          return;
        }

        // Skip if we're currently transitioning (e.g., during logout)
        if (isTransitioning) {
          return;
        }

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

        if (!hasSubscription) {
          setShowOnboarding(true);
          setOnboardingInitialRoute('Payment');
          return;
        }
        // User has subscription and completed onboarding - go straight to main app
        setShowOnboarding(false);
      } catch (e) {
        setShowOnboarding(true);
        setOnboardingInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    }

    // Only run if we're in a valid state to make routing decisions
    if (!isTransitioning) {
      setActiveLayout();
    }
  }, [customerInfo, hasSubscription, isInitializing, isTransitioning]);

  // Add an artificial universal 2s boot delay
  useEffect(() => {
    // Only start delay if not already done and not transitioning
    if (!extraDelayDone && !isTransitioning) {
      const t = setTimeout(() => setExtraDelayDone(true), 2500);
      return () => clearTimeout(t);
    }
  }, [extraDelayDone, isTransitioning]);

  // Set sticky data gate once per app session - wait for RevenueCat to initialize
  useEffect(() => {
    if (!passedInitialDataGate && !isInitializing && isUserDetailsLoaded && isLiftDataLoaded) {
      setPassedInitialDataGate(true);
    }
  }, [passedInitialDataGate, isInitializing, isUserDetailsLoaded, isLiftDataLoaded]);

  // Set app ready when all conditions are met
  useEffect(() => {
    if (!isLoading && passedInitialDataGate && extraDelayDone && !isTransitioning) {
      setAppReady(true);
    }
  }, [isLoading, passedInitialDataGate, extraDelayDone, isTransitioning]);

  const handleOnboardingComplete = () => {
    setIsTransitioning(true);
    
    // Start fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After fade out completes, switch to main app
      setShowOnboarding(false);
      setUserNeedsOnboarding(false);
      
      // Start fade in animation for main app
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const handleSignIn = () => {
    // Instantly transition to account loading screen (no fade out)
    setShowOnboarding(false);
    setUserNeedsOnboarding(false);
    setShowAccountLoading(true);
  };

  const handlePaymentComplete = () => {
    handleOnboardingComplete();
  };

  const handleUserNeedsOnboarding = () => {
    // Instant transition without fade animation to prevent flash
    setUserNeedsOnboarding(true);
  };

  const handleLogout = async () => {
    try {
      // Reset context state that might have global listeners
      if ((global as any).resetUserDetailsContext) {
        (global as any).resetUserDetailsContext();
      }

      await supabase.auth.signOut();
      await removeUserId();

      // Simple state reset without complex animations during logout
      setIsTransitioning(true);
      setAppReady(false);
      setIsLoading(true);
      setShowOnboarding(false); // Start with false to show loading first
      setOnboardingInitialRoute('Welcome');
      setPassedInitialDataGate(false);
      setExtraDelayDone(false);

      // Restart app flow with a delay
      setTimeout(() => {
        setIsTransitioning(false);
        // This will trigger the loading process to restart
      }, 500);

    } catch (error) {
      console.error('Error during logout:', error);
      setIsTransitioning(false); // Reset transitioning state on error
      showAlert(
        'Logout Error',
        'An error occurred during logout. Please try again.',
        undefined,
        'LAYOUT_LOGOUT_ERROR',
        error
      );
    }
  };

  // Show loading screen until app is completely ready
  if (!appReady) {
    return (
      <SafeAreaProvider>
        <LoadingScreen onLoadComplete={() => {}} />
      </SafeAreaProvider>
    );
  }

  if (showAccountLoading) {
    return (
      <SafeAreaProvider>
        <AccountLoadingScreen onComplete={async () => {
          // Ensure context is populated, silently
          await refetchUserDetails();
          
          // Transition to main app
          setIsTransitioning(true);
          setShowAccountLoading(false);
          
          // Start fade in animation for main app
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setIsTransitioning(false);
          });
        }} />
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
    return (
      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim,
        backgroundColor: isTransitioning ? '#1d293d' : 'transparent'
      }}>
        {onboardingContent}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ 
      flex: 1, 
      opacity: fadeAnim,
      backgroundColor: isTransitioning ? '#1d293d' : 'transparent'
    }}>
      {mainAppContent}
    </Animated.View>
  );
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
