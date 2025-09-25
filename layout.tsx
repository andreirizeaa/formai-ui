import React, { useEffect, useState, useRef, useReducer, useCallback } from 'react';
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
import { track } from './src/services/analytics';
import { showAlert } from './src/services/alertService';

type AppRoute = 'SPLASH' | 'ONBOARDING_WELCOME' | 'ONBOARDING_PAYMENT' | 'ACCOUNT_LOADING' | 'MAIN';
type AppPhase = 'BOOT' | 'READY_TO_DECIDE' | 'DECIDED';

type AppState = {
  route: AppRoute;
  phase: AppPhase;
  isTransitioning: boolean;
};

type AppAction =
  | { type: 'SET_ROUTE'; route: AppRoute }
  | { type: 'SET_PHASE'; phase: AppPhase }
  | { type: 'START_TRANSITION' }
  | { type: 'END_TRANSITION' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ROUTE':
      return { ...state, route: action.route, phase: 'DECIDED' };
    case 'SET_PHASE':
      return { ...state, phase: action.phase };
    case 'START_TRANSITION':
      return { ...state, isTransitioning: true };
    case 'END_TRANSITION':
      return { ...state, isTransitioning: false };
    default:
      return state;
  }
}

// Component that can access context providers to check loading states
function AppContent() {
  const [state, dispatch] = useReducer(appReducer, {
    route: 'SPLASH',
    phase: 'BOOT',
    isTransitioning: false
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [routingDecided, setRoutingDecided] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [showAccountLoading, setShowAccountLoading] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState('Welcome');
  const [passedInitialDataGate, setPassedInitialDataGate] = useState(false);
  const [extraDelayDone, setExtraDelayDone] = useState(false);
  const isMountedRef = useRef(true);
  const hasHiddenSplash = useRef(false);
  const { customerInfo, hasSubscription, isInitializing } = usePurchases();
  const { isUserDetailsLoaded, refetchUserDetails } = useUserDetails();
  const { isLiftDataLoaded } = useLiftData();

  // Extract isTransitioning from state
  const { isTransitioning } = state;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Hide splash screen when first screen is laid out
  const onLayout = useCallback(() => {
    if (hasHiddenSplash.current) return;
    hasHiddenSplash.current = true;
    // Let the first frame commit, then hide
    requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  // Asset preloading effect - defer heavy assets until after first paint
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      try {
        // Preload all assets using static require statements (excluding SVG)
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
        if (isMountedRef.current) {
          setAssetsLoaded(true);
        }
      } catch (error) {
        console.warn('Asset preloading failed:', error);
        if (isMountedRef.current) {
          setAssetsLoaded(true); // Continue even if preloading fails
        }
      }
    });

    return () => task.cancel();
  }, []);


  // Set routing decided when route is determined
  useEffect(() => {
    if (state.route !== 'SPLASH' && state.phase === 'DECIDED') {
      setRoutingDecided(true);
    }
  }, [state.route, state.phase]);

  useEffect(() => {
    async function setActiveLayout() {
      try {
        if (isInitializing === true || isInitializing === undefined) return;
        if (state.isTransitioning) return;

        const storedUserId = await getUserId();
        if (!storedUserId) {
          dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_WELCOME' });
          return;
        }

        const { user } = await fetchUserById(storedUserId);
        if (!user) {
          dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_WELCOME' });
          return;
        }

        if (requiresOnboarding(user)) {
          dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_WELCOME' });
          return;
        }

        if (!hasSubscription) {
          dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_PAYMENT' });
          return;
        }

        dispatch({ type: 'SET_ROUTE', route: 'MAIN' });
      } catch (e) {
        dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_WELCOME' });
      } finally {
        setIsLoading(false);
      }
    }

    if (!state.isTransitioning) {
      setActiveLayout();
    }
  }, [customerInfo, hasSubscription, isInitializing, state.isTransitioning]);

  // Add an artificial universal 2s boot delay
  useEffect(() => {
    // Only start delay if not already done and not transitioning
    if (!extraDelayDone && !state.isTransitioning) {
      const t = setTimeout(() => setExtraDelayDone(true), 2500);
      return () => clearTimeout(t);
    }
  }, [extraDelayDone, state.isTransitioning]);

  // Set sticky data gate once per app session - wait for RevenueCat to initialize
  useEffect(() => {
    if (!passedInitialDataGate && !isInitializing && isUserDetailsLoaded && isLiftDataLoaded) {
      setPassedInitialDataGate(true);
    }
  }, [passedInitialDataGate, isInitializing, isUserDetailsLoaded, isLiftDataLoaded]);

  // Set app ready when all conditions are met (don't wait for assets)
  useEffect(() => {
    if (!isLoading && passedInitialDataGate && extraDelayDone && !state.isTransitioning) {
      setAppReady(true);
    }
  }, [isLoading, passedInitialDataGate, extraDelayDone, state.isTransitioning]);

  // Set content ready when app is ready, routing is decided, and not transitioning
  useEffect(() => {
    if (appReady && routingDecided && !state.isTransitioning) {
      // Add a small delay to ensure everything is settled
      const timer = setTimeout(() => {
        setContentReady(true);
      }, 150);
      
      return () => clearTimeout(timer);
    }
  }, [appReady, routingDecided, state.isTransitioning]);

  const handleOnboardingComplete = () => {
    dispatch({ type: 'SET_ROUTE', route: 'MAIN' });
  };

  const handleSignIn = () => {
    dispatch({ type: 'SET_ROUTE', route: 'ACCOUNT_LOADING' });
  };

  const handlePaymentComplete = () => {
    handleOnboardingComplete();
  };

  const handleAccountLoadingComplete = async () => {
    await refetchUserDetails();
    dispatch({ type: 'SET_ROUTE', route: 'MAIN' });
  };

  const handleUserNeedsOnboarding = () => {
    dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_WELCOME' });
  };

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
      
      dispatch({ type: 'SET_ROUTE', route: 'ONBOARDING_WELCOME' });

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
    switch (state.route) {
      case 'SPLASH':
        return null; // Let splash screen handle this

      case 'ONBOARDING_WELCOME':
        return (
          <OnboardingNavigator
            onComplete={handlePaymentComplete}
            onSignIn={handleSignIn}
            onUserNeedsOnboarding={handleUserNeedsOnboarding}
            initialRouteName="Welcome"
          />
        );

      case 'ONBOARDING_PAYMENT':
        return (
          <OnboardingNavigator
            onComplete={handlePaymentComplete}
            onSignIn={handleSignIn}
            onUserNeedsOnboarding={handleUserNeedsOnboarding}
            initialRouteName="Payment"
          />
        );

      case 'ACCOUNT_LOADING':
        return (
          <SafeAreaProvider>
            <AccountLoadingScreen onComplete={handleAccountLoadingComplete} />
          </SafeAreaProvider>
        );

      case 'MAIN':
        return <MainAppLayout onLogout={handleLogout} />;

      default:
        return null;
    }
  };


  return (
    <View
      onLayout={onLayout}
      style={{
        flex: 1,
        backgroundColor: '#ffffff', // Match splash screen background
      }}
    >
      <View style={{
        flex: 1,
        backgroundColor: state.isTransitioning ? '#1d293d' : 'transparent'
      }}>
        {renderContent()}
      </View>
    </View>
  );
}

// Keep splash screen visible until we explicitly hide it
SplashScreen.preventAutoHideAsync().catch(() => {});

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
