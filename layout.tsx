import React, { useEffect, useState } from 'react';
import { View, InteractionManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
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
import { AccountLoadingScreen } from './src/screens/onboarding/AccountLoadingScreen';
import { fetchUserById, requiresOnboarding } from './src/services/userService';
import { usePurchases } from './src/context/PurchasesContext';
import { useUserDetails } from './src/context/UserDetailsContext';
import { useLiftData } from './src/context/LiftDataContext';
import { useUserCheckIns } from './src/context/UserCheckInsContext';
import { showAlert } from './src/services/alertService';

type AppRoute = 'SPLASH' | 'ONBOARDING_WELCOME' | 'ONBOARDING_PAYMENT' | 'ACCOUNT_LOADING' | 'MAIN';

// Keep splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

// Component that can access context providers to check loading states
function AppContent() {
  const [route, setRoute] = useState<AppRoute>('SPLASH');
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [routingDecided, setRoutingDecided] = useState(false);
  const [passedInitialDataGate, setPassedInitialDataGate] = useState(false);
  const [extraDelayDone, setExtraDelayDone] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  const { hasSubscription, isInitializing } = usePurchases();
  const { isUserDetailsLoaded, refetchUserDetails, userDetails, setSignedInUser: setUserDetailsSignedInUser } = useUserDetails();
  const { isLiftDataLoaded, liftData } = useLiftData();
  const { 
    isLoading: isUserCheckInsLoading, 
    data: checkIns, 
    refetch: refetchUserCheckIns,
    setSignedInUser: setCheckInsSignedInUser
  } = useUserCheckIns();

  // Centralized data gate check - single source of truth
  const contextsReady =
    isUserDetailsLoaded &&
    isLiftDataLoaded &&
    !isUserCheckInsLoading &&
    userDetails != null &&
    liftData != null &&
    checkIns != null;

  // Hide splash screen when content is ready
  useEffect(() => {
    if (!contentReady) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          await SplashScreen.hideAsync();
        } catch {}
        // Mark app visible to the user
        setSplashHidden(true);
      });
    });
  }, [contentReady]);

  // Asset preloading effect - defer heavy assets until after first interactions
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        const assetsToLoad = [
          require('./assets/formai-homescreen.mp4'),
          require('./assets/recording-tip.png'),
          require('./assets/refer-friends.jpg'),
          require('./assets/refer-friends-group.png'),
          require('./assets/formai-ios-icon.png'),
          require('./assets/app-overview-photo.png'),
          require('./assets/homescreen-refer-image.png'),
          require('./assets/icons/instagram.png'),
          require('./assets/icons/tiktok.png'),
          require('./assets/icons/fasebook.png'),
          require('./assets/icons/google.png'),
          require('./assets/icons/apple.png'),
          require('./assets/icons/fire.png'),
          require('./assets/icons/appstore.png'),
          require('./assets/icons/playstore.png'),
          require('./assets/icons/x.png'),
          require('./assets/animations/confetti.json'),
          require('./assets/animations/star-rating.json'),
          require('./assets/animations/bell.json'),
          require('./assets/animations/loading.json'),
          require('./assets/tutorial/formai-example-feedback.png'),
          require('./assets/tutorial/formai-example-pose.mp4'),
          require('./assets/tutorial/formai-example-video-thumbnail.jpg'),
          require('./assets/tutorial/formai-example-video.mp4'),
          require('./assets/onboarding/progress_tracking.png'),
        ];
        await Asset.loadAsync(assetsToLoad);
      } catch (error) {
        console.warn('Asset preloading failed:', error);
      }
    });
    return () => task.cancel();
  }, []);

  // Set routing decided when route is determined
  useEffect(() => {
    if (route !== 'SPLASH') setRoutingDecided(true);
  }, [route]);

  useEffect(() => {
    async function setActiveLayout() {
      try {
        if (isInitializing === true || isInitializing === undefined) return;

        const storedUserId = await getUserId();
        if (!storedUserId) {
          setRoute('ONBOARDING_WELCOME');
          return;
        }

        const { user } = await fetchUserById(storedUserId);
        if (!user) {
          setRoute('ONBOARDING_WELCOME');
          return;
        }

        if (requiresOnboarding(user)) {
          setRoute('ONBOARDING_WELCOME');
          return;
        }

        if (!hasSubscription) {
          setRoute('ONBOARDING_PAYMENT');
          return;
        }

        goToMainGated();
      } catch {
        setRoute('ONBOARDING_WELCOME');
      } finally {
        setIsLoading(false);
      }
    }

    setActiveLayout();
  }, [hasSubscription, isInitializing]);

  // Add an artificial universal 2.5s boot delay (optional)
  useEffect(() => {
    if (extraDelayDone) return;
    const t = setTimeout(() => setExtraDelayDone(true), 2500);
    return () => clearTimeout(t);
  }, [extraDelayDone]);

  // Set sticky data gate once per app session - wait for RevenueCat + initial data
  useEffect(() => {
    if (!passedInitialDataGate && !isInitializing && contextsReady) {
      setPassedInitialDataGate(true);
    }
  }, [passedInitialDataGate, isInitializing, contextsReady]);

  // Set app ready when all conditions are met (don't wait for assets)
  // For onboarding routes, only wait for extra delay. For MAIN, wait for data gate.
  useEffect(() => {
    const isOnboardingRoute =
      route === 'ONBOARDING_WELCOME' ||
      route === 'ONBOARDING_PAYMENT' ||
      route === 'ACCOUNT_LOADING';

    if (isOnboardingRoute) {
      setAppReady(extraDelayDone); // true after delay
      return;
    }

    // MAIN requires data gate *every time* we land on MAIN
    setAppReady(!isLoading && extraDelayDone && contextsReady);
  }, [route, isLoading, extraDelayDone, contextsReady]);

  // Set content ready when app is ready and routing is decided
  // For onboarding routes, use routingDecided. For MAIN, use appReady.
  useEffect(() => {
    const needsDataGate = route === 'MAIN';
    const canShow = needsDataGate ? appReady : routingDecided;
    if (canShow) {
      const timer = setTimeout(() => setContentReady(true), 150);
      return () => clearTimeout(timer);
    } else {
      // Important when bouncing back to MAIN to re-apply gate
      setContentReady(false);
    }
  }, [route, appReady, routingDecided]);

  // Ensure splash can hide quickly for non-MAIN routes
  useEffect(() => {
    if (route !== 'MAIN' && routingDecided) {
      setAppReady(true); // harmless if already true
    }
  }, [route, routingDecided]);

  // Force re-gate on every MAIN transition
  const goToMainGated = () => {
    setAppReady(false);
    setContentReady(false);
    setRoute('MAIN');
  };

  const handleOnboardingComplete = () => {
    goToMainGated();
  };
  const handleSignIn = () => setRoute('ACCOUNT_LOADING');
  const handlePaymentComplete = () => handleOnboardingComplete();

  const handleAccountLoadingComplete = async () => {
    // Make sure providers *know* the userId immediately
    const id = await getUserId().catch(() => null);
    if (id) {
      // Set the user ID in both contexts immediately
      try { 
        setUserDetailsSignedInUser?.(id); 
      } catch {}
      try { 
        setCheckInsSignedInUser?.(id); 
      } catch {}
    }
    
    // Now refetch both contexts
    await Promise.all([
      refetchUserDetails(),
      refetchUserCheckIns ? refetchUserCheckIns() : Promise.resolve(),
    ]);
    goToMainGated();            // land on MAIN but still wait for contextsReady
  };

  const handleUserNeedsOnboarding = () => setRoute('ONBOARDING_WELCOME');

  const handleLogout = async () => {
    try {
      // Set route to onboarding immediately to prevent AccountLoadingScreen from showing
      setRoute('ONBOARDING_WELCOME');

      // Reset loading states immediately
      setIsLoading(true);
      setAppReady(false);
      setContentReady(false);
      setRoutingDecided(false);
      setPassedInitialDataGate(false);
      setExtraDelayDone(false);

      if ((global as any).resetUserDetailsContext) {
        (global as any).resetUserDetailsContext();
      }
      await supabase.auth.signOut();
      await removeUserId();
    } catch (error) {
      showAlert(
        'Logout Error',
        'An error occurred during logout. Please try again.',
        undefined,
        'LAYOUT_LOGOUT_ERROR',
        error
      );
    }
  };

  // Single switch statement for rendering based on route
  const renderContent = () => {
    switch (route) {
      case 'SPLASH':
        return null; // Let splash screen handle this
      case 'ONBOARDING_WELCOME':
        return (
          <OnboardingNavigator
            onComplete={handlePaymentComplete}
            onSignIn={handleSignIn}
            onUserNeedsOnboarding={handleUserNeedsOnboarding}
            initialRouteName="Welcome"
            isAppVisible={splashHidden}
          />
        );
      case 'ONBOARDING_PAYMENT':
        return (
          <OnboardingNavigator
            onComplete={handlePaymentComplete}
            onSignIn={handleSignIn}
            onUserNeedsOnboarding={handleUserNeedsOnboarding}
            initialRouteName="Payment"
            isAppVisible={splashHidden}
          />
        );
      case 'ACCOUNT_LOADING':
        return (
          <SafeAreaProvider>
            <AccountLoadingScreen onComplete={handleAccountLoadingComplete} />
          </SafeAreaProvider>
        );
      case 'MAIN': {
        if (!contextsReady) {
          return (
            <SafeAreaProvider>
              <AccountLoadingScreen onComplete={handleAccountLoadingComplete} />
            </SafeAreaProvider>
          );
        }

        return <MainAppLayout onLogout={handleLogout} isAppVisible={splashHidden} />;
      }
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        // Match native splash background to avoid flash during transition
        backgroundColor: '#ffffff',
      }}
    >
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
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
