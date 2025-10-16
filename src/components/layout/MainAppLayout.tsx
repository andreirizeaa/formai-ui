import React from 'react';
import { Animated, AppState, AppStateStatus } from 'react-native';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';
import { useUserDetails } from '../../context/UserDetailsContext';
import { WelcomeModal } from '../../screens/application/settings/WelcomeModal';
import { TutorialProvider, useTutorial } from '../../context/TutorialContext';
import { TutorialLiftSeeder } from '../../context/LiftDataContext';
import { TutorialOverlay } from '../ui/overlays/TutorialOverlay';
import { PaymentScreen } from '../../screens/payment/PaymentScreen';
import { useSubscription } from '../../context/SuperwallContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SuperwallExpoModule } from 'expo-superwall';

interface MainAppLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
  isNewUser?: boolean;
  isAppVisible?: boolean; // controls showing UI after splash
}

/** Wrapper so we can use the tutorial hook for the WelcomeModal button */
export function MainAppLayout(props: MainAppLayoutProps) {
  return (
    <TutorialProvider>
      <MainAppLayoutInner {...props} />
    </TutorialProvider>
  );
}

function MainAppLayoutInner({ onLogout, isAppVisible = false }: MainAppLayoutProps) {
  const { userDetails } = useUserDetails();
  const { hasSubscription, refresh, subscriptionStatus } = useSubscription();
  const tutorial = useTutorial();

  const [showWelcome, setShowWelcome] = React.useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = React.useState(false);
  const [isVersionCheckCleared, setIsVersionCheckCleared] = React.useState(false);
  const [previousSubscriptionStatus, setPreviousSubscriptionStatus] = React.useState<boolean | null>(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Clear version check time on fresh app start - must complete before MainAppNavigator renders
  React.useEffect(() => {
    const clearVersionCheckTime = async () => {
      try {
        await AsyncStorage.removeItem('last_version_check_time');
        setIsVersionCheckCleared(true);
      } catch (error) {
        // Silent fail - not critical if this fails
        setIsVersionCheckCleared(true);
      }
    };
    
    clearVersionCheckTime();
  }, []);

  // Fade in animation (kept, unrelated to welcome gating)
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // ✅ Render WelcomeModal only if walkthrough is not completed AND app is visible (splash hidden)
  React.useEffect(() => {
    if (!userDetails) return;
    const shouldShow = userDetails.walkthroughCompleted === false && isAppVisible === true;
    setShowWelcome(shouldShow);
  }, [userDetails, isAppVisible]);

  // 🔄 Monitor subscription changes and show paywall when subscription is lost
  React.useEffect(() => {
    // Skip until we have a non-unknown status
    if (!subscriptionStatus || subscriptionStatus.status === 'UNKNOWN') return;
    
    // Initialize previous subscription status on first load
    if (previousSubscriptionStatus === null) {
      setPreviousSubscriptionStatus(hasSubscription);
      return;
    }
    
    // Check if subscription status changed from active to inactive
    if (previousSubscriptionStatus === true && hasSubscription === false) {
      // User lost their subscription, show paywall
      setShowPaymentScreen(true);
    }
    
    // Update previous subscription status
    setPreviousSubscriptionStatus(hasSubscription);
  }, [hasSubscription, subscriptionStatus, previousSubscriptionStatus]);


  // 🔄 Refresh subscription status when app becomes active
  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && previousSubscriptionStatus !== null) {
        try {
          // Refresh Superwall subscription status when app becomes active
          await refresh();
        } catch (error) {
          // Silent fail - not critical if this fails
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [previousSubscriptionStatus, refresh]);

  // 🚀 Start tutorial ONLY when user taps "Get Started"
  const handleGetStarted = () => {
    setShowWelcome(false);
    try {
      tutorial.start();
    } catch (e) {
      console.warn('Error starting tutorial:', e);
    }
  };

  const handleAddPress = () => {
    // Check current subscription status immediately (non-blocking)
    if (!hasSubscription) {
      setShowPaymentScreen(true);
      return true;
    }
    
    // If we have subscription, do background refresh to ensure it's still valid
    refresh().catch(() => {});
    
    return false;
  };

  const handlePaymentComplete = () => {
    setShowPaymentScreen(false);
    // Reset subscription tracking after payment completion
    setPreviousSubscriptionStatus(hasSubscription);
  };

  const handlePaymentDismiss = () => {
    setShowPaymentScreen(false);
    // Don't reset subscription tracking on dismiss - user still needs to pay
  };

  if (showPaymentScreen) {
    return <PaymentScreen onComplete={handlePaymentComplete} />;
  }

  // Don't render MainAppNavigator until version check time is cleared
  if (!isVersionCheckCleared) {
    return null;
  }

  return (
    <>
      {/* Modal only shows after splash via isAppVisible gating */}
      <WelcomeModal isVisible={showWelcome} onGetStarted={handleGetStarted} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <MainAppNavigator onLogout={onLogout} onAddPress={handleAddPress} />
      </Animated.View>

      {/* Tutorial always available; it only starts when user taps Get Started */}
      <TutorialOverlay />
      <TutorialLiftSeeder />
    </>
  );
} 