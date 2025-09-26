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
  const [isNewUserSession, setIsNewUserSession] = useState(false);

  const { hasSubscription, isInitializing } = usePurchases();
  const { isUserDetailsLoaded, refetchUserDetails } = useUserDetails();
  const { isLiftDataLoaded } = useLiftData();

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
          require('./assets/recording-tip.jpg'),
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

        setRoute('MAIN');
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
    if (!passedInitialDataGate && !isInitializing && isUserDetailsLoaded && isLiftDataLoaded) {
      setPassedInitialDataGate(true);
    }
  }, [passedInitialDataGate, isInitializing, isUserDetailsLoaded, isLiftDataLoaded]);

  // Set app ready when all conditions are met (don't wait for assets)
  useEffect(() => {
    if (!isLoading && passedInitialDataGate && extraDelayDone) {
      setAppReady(true);
    }
  }, [isLoading, passedInitialDataGate, extraDelayDone]);

  // Set content ready when app is ready and routing is decided
  useEffect(() => {
    if (appReady && routingDecided) {
      const timer = setTimeout(() => setContentReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [appReady, routingDecided]);

  const handleOnboardingComplete = () => {
    setIsNewUserSession(true); // Mark as new user since they just completed onboarding
    setRoute('MAIN');
  };
  const handleSignIn = () => setRoute('ACCOUNT_LOADING');
  const handlePaymentComplete = () => handleOnboardingComplete();

  const handleAccountLoadingComplete = async () => {
    await refetchUserDetails();
    setIsNewUserSession(true); // Mark as new user session since they just completed account setup
    setRoute('MAIN');
  };

  const handleUserNeedsOnboarding = () => setRoute('ONBOARDING_WELCOME');

  const handleLogout = async () => {
    try {
      if ((global as any).resetUserDetailsContext) {
        (global as any).resetUserDetailsContext();
      }
      await supabase.auth.signOut();
      await removeUserId();

      // Reset loading states and go to onboarding
      setIsLoading(true);
      setAppReady(false);
      setContentReady(false);
      setRoutingDecided(false);
      setPassedInitialDataGate(false);
      setExtraDelayDone(false);

      setRoute('ONBOARDING_WELCOME');
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
      case 'MAIN':
        return <MainAppLayout onLogout={handleLogout} isNewUser={isNewUserSession} isAppVisible={splashHidden} />;
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
