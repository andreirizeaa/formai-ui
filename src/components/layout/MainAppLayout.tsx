import React from 'react';
import { Animated } from 'react-native';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';
import { useUserDetails } from '../../context/UserDetailsContext';
import { WelcomeModal } from '../../screens/application/settings/WelcomeModal';
import { TutorialProvider, useTutorial } from '../../context/TutorialContext';
import { TutorialLiftSeeder } from '../../context/LiftDataContext';
import { TutorialOverlay } from '../TutorialOverlay';
import { hapticFeedback } from '../../utils/haptic';
import { LoadingScreen } from '../../screens/onboarding/LoadingScreen';

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
    // Only show welcome modal if walkthrough is explicitly not completed
    // Add a delay to prevent showing during initial app load
    if (userDetails && userDetails.walkthroughCompleted === false) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        hapticFeedback.success();
      }, 500); // Short delay after main loading is complete
      
      return () => clearTimeout(timer);
    }
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