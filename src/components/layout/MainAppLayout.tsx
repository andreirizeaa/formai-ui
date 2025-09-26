import React from 'react';
import { Animated, View, InteractionManager } from 'react-native';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';
import { useUserDetails } from '../../context/UserDetailsContext';
import { WelcomeModal } from '../../screens/application/settings/WelcomeModal';
import { TutorialProvider, useTutorial } from '../../context/TutorialContext';
import { TutorialLiftSeeder } from '../../context/LiftDataContext';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { hapticFeedback } from '../../utils/haptic';
import { getUserJustPaid, clearUserJustPaid, getItem, setItem } from '../../services/storageService';
import { PaymentScreen } from '../../screens/payment/PaymentScreen';
import { usePurchases } from '../../context/PurchasesContext';

interface MainAppLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
  isNewUser?: boolean;
  isAppVisible?: boolean;
}

function InnerApp({
  onLogout,
  isNewUser,
  isAppVisible,
  showPaymentScreen,
  setShowPaymentScreen,
  setShowWelcome,
  setShouldStartTutorial,
  setShouldStartTutorialManual,
  pendingStartTutorialRef,
  setForceShowTutorial,
  fadeAnim,
  onRootLayout,
  handleAddPress,
  shouldStartTutorial,
  shouldStartTutorialManual,
}: {
  onLogout?: () => void;
  isNewUser?: boolean;
  isAppVisible?: boolean;
  showPaymentScreen: boolean;
  setShowPaymentScreen: (v: boolean) => void;
  setShowWelcome: (v: boolean) => void;
  setShouldStartTutorial: (v: boolean) => void;
  setShouldStartTutorialManual: (v: boolean) => void;
  pendingStartTutorialRef: React.MutableRefObject<boolean>;
  setForceShowTutorial: (v: boolean) => void;
  fadeAnim: Animated.Value;
  onRootLayout: () => void;
  handleAddPress: () => void;
  shouldStartTutorial: boolean;
  shouldStartTutorialManual: boolean;
}) {
  const tutorial = useTutorial();

  // 🔒 HARD STOP: when tutorial becomes inactive, nuke all start triggers immediately
  const prevActive = React.useRef(tutorial.isActive);
  React.useEffect(() => {
    if (prevActive.current && !tutorial.isActive) {
      // just transitioned: active -> inactive
      setShouldStartTutorial(false);
      setShouldStartTutorialManual(false);
      pendingStartTutorialRef.current = false; // kill queued auto start
      setForceShowTutorial(false);
      // also clear the storage lever so future sessions won't re-arm
      try { setItem('SHOULD_SHOW_TUTORIAL', 'false'); } catch {}
    }
    prevActive.current = tutorial.isActive;
  }, [tutorial.isActive, setShouldStartTutorial, setShouldStartTutorialManual, setForceShowTutorial]);

  return (
    <>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }} onLayout={onRootLayout}>
        <MainAppNavigator onLogout={onLogout} onAddPress={handleAddPress} />
      </Animated.View>
      <TutorialOverlay />
      <TutorialLiftSeeder />
      <TutorialStarter trigger={shouldStartTutorial} pendingStartTutorialRef={pendingStartTutorialRef} />
      <TutorialStarter trigger={shouldStartTutorialManual} isManual={true} pendingStartTutorialRef={pendingStartTutorialRef} />
    </>
  );
}

function TutorialStarter({ trigger, isManual, pendingStartTutorialRef }: { trigger: boolean; isManual?: boolean; pendingStartTutorialRef?: React.MutableRefObject<boolean> }) {
  const tutorial = useTutorial();
  const { userDetails } = useUserDetails();
  const [forceShowTutorial, setForceShowTutorial] = React.useState(false);
  
  const canShowOverlays = React.useMemo(() => {
    return userDetails?.walkthroughCompleted !== false;
  }, [userDetails?.walkthroughCompleted]);

  React.useEffect(() => {
    if (!trigger) return;

    const startTutorial = async () => {
      try {
        if (isManual) {
          if (tutorial.isActive) return;
          if (pendingStartTutorialRef?.current) return;
          if (pendingStartTutorialRef) pendingStartTutorialRef.current = true;
          requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
              try {
                await tutorial.start();
              } catch (e) {
              }
            });
          });
          return;
        }

        // For automatic starts, check completion status
        const tutorialCompleted = await getItem('TUTORIAL_COMPLETED');
        if (tutorialCompleted === 'true') return;
        if (tutorial.isActive) return;

        if (forceShowTutorial || userDetails?.walkthroughCompleted === false) {
          const t = setTimeout(async () => {
            try {
              await tutorial.start();
              await setItem('TUTORIAL_COMPLETED', 'true');
            } catch (error) {
              console.warn('Error starting tutorial:', error);
            }
          }, 300);
          return () => clearTimeout(t);
        }
      } catch (error) {
        console.warn('Error in tutorial starter:', error);
      }
    };

    startTutorial();
  }, [trigger, canShowOverlays, tutorial, forceShowTutorial, userDetails?.walkthroughCompleted, isManual]);

  return null;
}

export function MainAppLayout({ children, onLogout, isNewUser, isAppVisible = false }: MainAppLayoutProps) {
  const { userDetails } = useUserDetails();
  const { hasSubscription } = usePurchases();
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [shouldStartTutorial, setShouldStartTutorial] = React.useState(false);
  const [shouldStartTutorialManual, setShouldStartTutorialManual] = React.useState(false);
  const [forceShowTutorial, setForceShowTutorial] = React.useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = React.useState(false);
  const [fadeInDone, setFadeInDone] = React.useState(false);
  const [layoutFirstFrame, setLayoutFirstFrame] = React.useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // Start hidden
  
  const pendingShowWelcomeRef = React.useRef(false);
  const pendingStartTutorialRef = React.useRef(false);
  
  // Fade in animation
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setFadeInDone(true));
  }, []);

  // Mark first actual frame rendered (after layout + next tick)
  const onRootLayout = React.useCallback(() => {
    // ensure the first painted frame is committed
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLayoutFirstFrame(true);
      });
    });
  }, []);

  const canShowOverlays = isAppVisible && layoutFirstFrame && fadeInDone;

  // Compute "should we show tutorial this session?" ASAP, but defer showing if overlays aren't allowed yet.
  React.useEffect(() => {
    const checkTutorialConditions = async () => {
      try {
        const userJustPaid = await getUserJustPaid();
        const shouldSkipTutorial = await getItem('TUTORIAL_COMPLETED');

        if ((userJustPaid || isNewUser) && !shouldSkipTutorial) {
          setForceShowTutorial(true);
          await setItem('SHOULD_SHOW_TUTORIAL', 'true');
          pendingStartTutorialRef.current = true; // queue it
        }
      } catch (error) {
        console.warn('Error checking tutorial conditions:', error);
      }
    };
    checkTutorialConditions();
  }, [isNewUser]);

  // Decide whether to show welcome modal; queue if not yet allowed
  React.useEffect(() => {
    const checkWelcomeConditions = async () => {
      if (!userDetails) return;
      const userJustPaid = await getUserJustPaid();

      if (userDetails.walkthroughCompleted === false || userJustPaid) {
        if (userJustPaid) await clearUserJustPaid();
        pendingShowWelcomeRef.current = true; // queue it
        // don't show yet; let the canShowOverlays effect handle display timing
      }
    };
    checkWelcomeConditions();
  }, [userDetails]);

  // When overlays are allowed, flush any pending intents (welcome/tutorial)
  React.useEffect(() => {
    if (!canShowOverlays) return;

    // Let heavy JS work settle to avoid jank
    InteractionManager.runAfterInteractions(async () => {
      if (pendingShowWelcomeRef.current) {
        pendingShowWelcomeRef.current = false;
        setShowWelcome(true);
        hapticFeedback.success();
      }
      if (pendingStartTutorialRef.current) {
        pendingStartTutorialRef.current = false;
        setShouldStartTutorial(true);
      }
    });
  }, [canShowOverlays]);

  const handleGetStarted = async () => {
    setShowWelcome(false);
    setShouldStartTutorialManual(true);
    
    try {
      await setItem('SHOULD_SHOW_TUTORIAL', 'false');
    } catch {}
  };

  const handleAddPress = () => {
    // Check if user has subscription before allowing add functionality
    if (!hasSubscription) {
      setShowPaymentScreen(true);
      return true; // Indicates that we handled the press
    }

    // If user has subscription, return false to let the default behavior proceed
    return false;
  };

  const handlePaymentComplete = () => {
    setShowPaymentScreen(false);
    // After payment completion, user can continue with add functionality
  };


  // Show payment screen if user doesn't have subscription and tried to add
  if (showPaymentScreen) {
    return <PaymentScreen onComplete={handlePaymentComplete} />;
  }

  return (
    <>
      <WelcomeModal isVisible={showWelcome} onGetStarted={handleGetStarted} />
      <TutorialProvider>
        <InnerApp
          onLogout={onLogout}
          isNewUser={isNewUser}
          isAppVisible={isAppVisible}
          showPaymentScreen={showPaymentScreen}
          setShowPaymentScreen={setShowPaymentScreen}
          setShowWelcome={setShowWelcome}
          setShouldStartTutorial={setShouldStartTutorial}
          setShouldStartTutorialManual={setShouldStartTutorialManual}
          pendingStartTutorialRef={pendingStartTutorialRef}
          setForceShowTutorial={setForceShowTutorial}
          fadeAnim={fadeAnim}
          onRootLayout={onRootLayout}
          handleAddPress={handleAddPress}
          shouldStartTutorial={shouldStartTutorial}
          shouldStartTutorialManual={shouldStartTutorialManual}
        />
      </TutorialProvider>
    </>
  );
} 