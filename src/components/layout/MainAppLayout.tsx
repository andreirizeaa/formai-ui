import React from 'react';
import { Animated } from 'react-native';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';
import { useUserDetails } from '../../context/UserDetailsContext';
import { WelcomeModal } from '../../screens/application/settings/WelcomeModal';
import { TutorialProvider, useTutorial } from '../../context/TutorialContext';
import { TutorialLiftSeeder } from '../../context/LiftDataContext';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { hapticFeedback } from '../../utils/haptic';
import { getUserJustPaid, clearUserJustPaid } from '../../services/storageService';

interface MainAppLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

export function MainAppLayout({ children, onLogout }: MainAppLayoutProps) {
  const { userDetails } = useUserDetails();
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [shouldStartTutorial, setShouldStartTutorial] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current; // Start hidden
  
  React.useEffect(() => {
    // Trigger fade in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    const checkWelcomeConditions = async () => {
      if (!userDetails) return;

      // Check if user just completed payment as a failsafe
      const userJustPaid = await getUserJustPaid();

      // Show welcome modal if:
      // 1. Walkthrough is explicitly not completed, OR
      // 2. User just completed payment (failsafe)
      if (userDetails.walkthroughCompleted === false || userJustPaid) {
        // Clear the payment flag since we're handling it
        if (userJustPaid) {
          await clearUserJustPaid();
        }

        // Reduced delay since AccountLoadingScreen already handled the loading time
        const timer = setTimeout(() => {
          setShowWelcome(true);
          hapticFeedback.success();
        }, 200);

        return () => clearTimeout(timer);
      }
    };

    checkWelcomeConditions();
  }, [userDetails]);

  const handleGetStarted = async () => {
    setShowWelcome(false);
    setShouldStartTutorial(true);
  };

  // TutorialStarter component defined inside to access TutorialProvider context
  function TutorialStarter({ trigger }: { trigger: boolean }) {
    const tutorial = useTutorial();
    if (tutorial.isActive || userDetails?.walkthroughCompleted !== false) {
      return;
    }
    React.useEffect(() => {
      if (!trigger) return;
      try {
        const t = setTimeout(async () => {
          try {
            await tutorial.start();
          } catch (error) {
          }
        }, 300);
        return () => clearTimeout(t);
      } catch (error) {
      }
    }, [trigger]);
    return null;
  }

  return (
    <>
      <WelcomeModal isVisible={showWelcome} onGetStarted={handleGetStarted} />
      <TutorialProvider>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <MainAppNavigator onLogout={onLogout} />
        </Animated.View>
        <TutorialOverlay />
        <TutorialLiftSeeder />
        <TutorialStarter trigger={shouldStartTutorial} />
      </TutorialProvider>
    </>
  );
} 