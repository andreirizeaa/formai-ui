import React from 'react';
import { Animated } from 'react-native';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';
import { useUserDetails } from '../../context/UserDetailsContext';
import { WelcomeModal } from '../../screens/application/settings/WelcomeModal';
import { TutorialProvider, useTutorial } from '../../context/TutorialContext';
import { TutorialLiftSeeder } from '../../context/LiftDataContext';
import { TutorialOverlay } from '../TutorialOverlay';
import { hapticFeedback } from '../../utils/haptic';

interface MainAppLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

export function MainAppLayout({ children, onLogout }: MainAppLayoutProps) {
  const { userDetails, updateUserDetails } = useUserDetails();
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [shouldStartTutorial, setShouldStartTutorial] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Show welcome modal if walkthrough is not completed (false or null)
    if (userDetails && userDetails.walkthroughCompleted !== true) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        hapticFeedback.success();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [userDetails]);

  // Fade in animation when component mounts
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGetStarted = async () => {
    setShowWelcome(false);
    setShouldStartTutorial(true);
  };

  // TutorialStarter component defined inside to access TutorialProvider context
  function TutorialStarter({ trigger }: { trigger: boolean }) {
    const tutorial = useTutorial();
    if (tutorial.isActive || userDetails?.walkthroughCompleted === true) {
      return;
    }
    React.useEffect(() => {
      if (!trigger) return;
      try {
        const t = setTimeout(async () => {
          try {
            await tutorial.start();
          } catch (error) {
            console.warn('Failed to start tutorial:', error);
          }
        }, 300);
        return () => clearTimeout(t);
      } catch (error) {
        console.warn('TutorialStarter error:', error);
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