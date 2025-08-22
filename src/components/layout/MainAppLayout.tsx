import React from 'react';
import { MainAppNavigator } from '../../navigation/MainAppNavigator';
import { useUserDetails } from '../../context/UserDetailsContext';
import { WelcomeModal } from '../../screens/application/settings/WelcomeModal';
import { markWalkthroughCompleted } from '../../services/userService';
import { useLiftData } from '../../context/LiftDataContext';
import { LoadingScreen } from '../../screens/onboarding/LoadingScreen';

interface MainAppLayoutProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

export function MainAppLayout({ children, onLogout }: MainAppLayoutProps) {
  const { userDetails, updateUserDetails, isUserDetailsLoaded } = useUserDetails();
  const { isLiftDataLoaded } = useLiftData();
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    if (!isUserDetailsLoaded) return;
    if (userDetails && userDetails.walkthroughCompleted === false) setShowWelcome(true);
  }, [isUserDetailsLoaded, userDetails]);

  const handleGetStarted = async () => {
    await markWalkthroughCompleted();
    updateUserDetails('walkthroughCompleted', true);
    setShowWelcome(false);
  };

  if (!isUserDetailsLoaded || !isLiftDataLoaded) {
    return <LoadingScreen onLoadComplete={() => {}} />;
  }

  return (
    <>
      <MainAppNavigator onLogout={onLogout} />
      <WelcomeModal isVisible={showWelcome} onGetStarted={handleGetStarted} />
    </>
  );
} 