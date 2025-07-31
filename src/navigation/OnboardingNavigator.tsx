import React, { useState } from 'react';
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { LanguageScreen } from '../screens/onboarding/LanguageScreen';
import { GenderScreen } from '../screens/onboarding/GenderScreen';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
}

export function OnboardingNavigator({ onComplete, onSignIn }: OnboardingNavigatorProps) {
  const [currentScreen, setCurrentScreen] = useState<'loading' | 'welcome' | 'language' | 'gender'>('loading');

  const handleLoadComplete = () => {
    setCurrentScreen('welcome');
  };

  const handleGetStarted = () => {
    setCurrentScreen('language');
  };

  const handleLanguageNext = () => {
    setCurrentScreen('gender');
  };

  const handleLanguageBack = () => {
    setCurrentScreen('welcome');
  };

  const handleGenderNext = () => {
    // Future: Add more screens here (goal, discovery, etc.)
    onComplete();
  };

  const handleGenderBack = () => {
    setCurrentScreen('language');
  };

  switch (currentScreen) {
    case 'loading':
      return <LoadingScreen onLoadComplete={handleLoadComplete} />;
    
    case 'welcome':
      return (
        <WelcomeScreen 
          onGetStarted={handleGetStarted}
          onSignIn={onSignIn}
        />
      );
    
    case 'language':
      return (
        <LanguageScreen
          onNext={handleLanguageNext}
          onBack={handleLanguageBack}
        />
      );
    
    case 'gender':
      return (
        <GenderScreen
          onNext={handleGenderNext}
          onBack={handleGenderBack}
        />
      );

    default:
      return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }
} 