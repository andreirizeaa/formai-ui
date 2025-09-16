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

// Component that can access context providers to check loading states
function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [extraDelayDone, setExtraDelayDone] = useState(false);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<
    'Welcome' | 'Payment'
  >('Welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAccountLoading, setShowAccountLoading] = useState(false);
  const [passedInitialDataGate, setPassedInitialDataGate] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { customerInfo, isInitializing } = usePurchases();
  const { isUserDetailsLoaded, refetchUserDetails } = useUserDetails();
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

  // Add an artificial universal 2s boot delay
  useEffect(() => {
    const t = setTimeout(() => setExtraDelayDone(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // Set sticky data gate once per app session
  useEffect(() => {
    if (!passedInitialDataGate && !isInitializing && isUserDetailsLoaded && isLiftDataLoaded) {
      setPassedInitialDataGate(true);
    }
  }, [passedInitialDataGate, isInitializing, isUserDetailsLoaded, isLiftDataLoaded]);

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
    setIsTransitioning(true);
    
    // Start fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // After fade out completes, switch to onboarding
      setUserNeedsOnboarding(true);
      
      // Start fade in animation for onboarding
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsTransitioning(false);
      });
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await removeUserId();
      
      setIsTransitioning(true);
      
      // Start fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // After fade out completes, switch to onboarding
        setShowOnboarding(true);
        setOnboardingInitialRoute('Welcome');
        
        // Start fade in animation for onboarding
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
        });
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading screen until all data is loaded (sticky gate prevents mid-session reverts)
  if (isLoading || !passedInitialDataGate || !extraDelayDone) {
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
