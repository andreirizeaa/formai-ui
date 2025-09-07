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
import { SelectedDateProvider } from './src/context/SelectedDateContext';
import { supabase } from './src/lib/supabase';
import { getUserId, removeUserId } from './src/services/storageService';
import { LoadingScreen } from './src/screens/onboarding/LoadingScreen';
import { fetchUserById, requiresOnboarding } from './src/services/userService';
import { useUserDetails } from './src/context/UserDetailsContext';
import { useLiftData } from './src/context/LiftDataContext';
import { useSuperwallContext } from './src/context/SuperwallContext';

// Component that can access context providers to check loading states
function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<
    'Welcome' | 'Payment'
  >('Welcome');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { isUserDetailsLoaded } = useUserDetails();
  const { isLiftDataLoaded } = useLiftData();
  const { superwallCustomerInfo, identifyUser } = useSuperwallContext();

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

        console.log('>>>>>>>>>>>>>>superwallCustomerInfo', superwallCustomerInfo);

        if (!superwallCustomerInfo.active) {
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
  }, [superwallCustomerInfo]);

  // Check if all required data is loaded before showing the app
  const isAllDataLoaded = isUserDetailsLoaded && isLiftDataLoaded;

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
    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {onboardingContent}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
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
    </QueryClientProvider>
  );
}
