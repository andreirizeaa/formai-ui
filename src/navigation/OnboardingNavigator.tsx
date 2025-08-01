import React, { useState } from 'react';
import { View } from 'react-native';
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { LanguageScreen } from '../screens/onboarding/LanguageScreen';
import { GenderScreen } from '../screens/onboarding/GenderScreen';
import { WorkoutsScreen } from '../screens/onboarding/WorkoutsScreen';
import { DiscoveryScreen } from '../screens/onboarding/DiscoveryScreen';
import { PersonalTrainerScreen } from '../screens/onboarding/PersonalTrainerScreen';
import { ProgressScreen } from '../screens/onboarding/ProgressScreen';
import { MeasurementsScreen } from '../screens/onboarding/MeasurementsScreen';
import { BirthDateScreen } from '../screens/onboarding/BirthDateScreen';
import { LiftingGoalScreen } from '../screens/onboarding/LiftingGoalScreen';
import { FormBarrierScreen } from '../screens/onboarding/FormBarrierScreen';
import { RatingScreen } from '../screens/onboarding/RatingScreen';
import { ReferralCodeScreen } from '../screens/onboarding/ReferralCodeScreen';
import { AllDoneScreen } from '../screens/onboarding/AllDoneScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { SetupLoadingScreen } from '../screens/onboarding/SetupLoadingScreen';
import { FreeTrialScreen } from '../screens/payment/FreeTrialScreen';
import { NotificationReminderScreen } from '../screens/payment/NotificationReminderScreen';
import { SubscriptionSelectionScreen } from '../screens/payment/SubscriptionSelectionScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { CameraPermissionScreen } from '../screens/onboarding/CameraPermissionScreen';
import { HomeScreen } from '../screens/application/HomeScreen';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
}

type OnboardingScreen = 
  | 'loading' 
  | 'welcome' 
  | 'language' 
  | 'gender' 
  | 'workouts' 
  | 'discovery' 
  | 'personalTrainer' 
  | 'progress' 
  | 'measurements' 
  | 'birthDate'
  | 'liftingGoal'
  | 'formBarrier'
  | 'rating'
  | 'referralCode'
  | 'allDone'
  | 'notificationPermission'
  | 'setupLoading'
  | 'freeTrial'
  | 'notificationReminder'
  | 'subscriptionSelection'
  | 'createAccount'
  | 'cameraPermission'
  | 'homePage';

export function OnboardingNavigator({ onComplete, onSignIn }: OnboardingNavigatorProps) {
  const [currentScreen, setCurrentScreen] = useState<OnboardingScreen>('loading');

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
    setCurrentScreen('workouts');
  };

  const handleGenderBack = () => {
    setCurrentScreen('language');
  };

  const handleWorkoutsNext = () => {
    setCurrentScreen('discovery');
  };

  const handleWorkoutsBack = () => {
    setCurrentScreen('gender');
  };

  const handleDiscoveryNext = () => {
    setCurrentScreen('personalTrainer');
  };

  const handleDiscoveryBack = () => {
    setCurrentScreen('workouts');
  };

  const handlePersonalTrainerNext = () => {
    setCurrentScreen('progress');
  };

  const handlePersonalTrainerBack = () => {
    setCurrentScreen('discovery');
  };

  const handleProgressNext = () => {
    setCurrentScreen('measurements');
  };

  const handleProgressBack = () => {
    setCurrentScreen('personalTrainer');
  };

  const handleMeasurementsNext = () => {
    setCurrentScreen('birthDate');
  };

  const handleMeasurementsBack = () => {
    setCurrentScreen('progress');
  };

  const handleBirthDateNext = () => {
    setCurrentScreen('liftingGoal');
  };

  const handleBirthDateBack = () => {
    setCurrentScreen('measurements');
  };

  const handleLiftingGoalNext = () => {
    setCurrentScreen('formBarrier');
  };

  const handleLiftingGoalBack = () => {
    setCurrentScreen('birthDate');
  };

  const handleFormBarrierNext = () => {
    setCurrentScreen('rating');
  };

  const handleFormBarrierBack = () => {
    setCurrentScreen('liftingGoal');
  };

  const handleRatingNext = () => {
    setCurrentScreen('referralCode');
  };

  const handleRatingBack = () => {
    setCurrentScreen('formBarrier');
  };

  const handleReferralCodeNext = () => {
    setCurrentScreen('allDone');
  };

  const handleReferralCodeBack = () => {
    setCurrentScreen('rating');
  };

  const handleAllDoneNext = () => {
    setCurrentScreen('notificationPermission');
  };

  const handleAllDoneBack = () => {
    setCurrentScreen('referralCode');
  };

  const handleNotificationPermissionNext = () => {
    setCurrentScreen('setupLoading');
  };

  const handleNotificationPermissionBack = () => {
    setCurrentScreen('allDone');
  };

  const handleSetupLoadingNext = () => {
    setCurrentScreen('freeTrial');
  };

  const handleSetupLoadingBack = () => {
    setCurrentScreen('notificationPermission');
  };

  const handleFreeTrialNext = () => {
    setCurrentScreen('notificationReminder');
  };

  const handleNotificationReminderNext = () => {
    setCurrentScreen('subscriptionSelection');
  };

  const handleNotificationReminderBack = () => {
    setCurrentScreen('freeTrial');
  };

  const handleSubscriptionSelectionNext = () => {
    setCurrentScreen('createAccount');
  };

  const handleSubscriptionSelectionBack = () => {
    setCurrentScreen('notificationReminder');
  };

  const handleCreateAccountNext = () => {
    setCurrentScreen('cameraPermission');
  };

  const handleCreateAccountBack = () => {
    setCurrentScreen('welcome');
  };

  const handleCameraPermissionNext = () => {
    setCurrentScreen('homePage');
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

    case 'workouts':
      return (
        <WorkoutsScreen
          onNext={handleWorkoutsNext}
          onBack={handleWorkoutsBack}
        />
      );

    case 'discovery':
      return (
        <DiscoveryScreen
          onNext={handleDiscoveryNext}
          onBack={handleDiscoveryBack}
        />
      );

    case 'personalTrainer':
      return (
        <PersonalTrainerScreen
          onNext={handlePersonalTrainerNext}
          onBack={handlePersonalTrainerBack}
        />
      );

    case 'progress':
      return (
        <ProgressScreen
          onNext={handleProgressNext}
          onBack={handleProgressBack}
        />
      );

    case 'measurements':
      return (
        <MeasurementsScreen
          onNext={handleMeasurementsNext}
          onBack={handleMeasurementsBack}
        />
      );

    case 'birthDate':
      return (
        <BirthDateScreen
          onNext={handleBirthDateNext}
          onBack={handleBirthDateBack}
        />
      );

    case 'liftingGoal':
      return (
        <LiftingGoalScreen
          onNext={handleLiftingGoalNext}
          onBack={handleLiftingGoalBack}
        />
      );

    case 'formBarrier':
      return (
        <FormBarrierScreen
          onNext={handleFormBarrierNext}
          onBack={handleFormBarrierBack}
        />
      );

    case 'rating':
      return (
        <RatingScreen
          onNext={handleRatingNext}
          onBack={handleRatingBack}
        />
      );

    case 'referralCode':
      return (
        <ReferralCodeScreen
          onNext={handleReferralCodeNext}
          onBack={handleReferralCodeBack}
        />
      );

    case 'allDone':
      return (
        <AllDoneScreen
          onNext={handleAllDoneNext}
          onBack={handleAllDoneBack}
        />
      );

    case 'notificationPermission':
      return (
        <NotificationPermissionScreen
          onNext={handleNotificationPermissionNext}
          onBack={handleNotificationPermissionBack}
        />
      );

    case 'setupLoading':
      return (
        <SetupLoadingScreen
          onNext={handleSetupLoadingNext}
          onBack={handleSetupLoadingBack}
        />
      );

    case 'freeTrial':
      return (
        <FreeTrialScreen
          onNext={handleFreeTrialNext}
        />
      );

    case 'notificationReminder':
      return (
        <NotificationReminderScreen
          onNext={handleNotificationReminderNext}
          onBack={handleNotificationReminderBack}
        />
      );

    case 'subscriptionSelection':
      return (
        <SubscriptionSelectionScreen
          onNext={handleSubscriptionSelectionNext}
          onBack={handleSubscriptionSelectionBack}
        />
      );

    case 'createAccount':
      return (
        <CreateAccountScreen
          onNext={handleCreateAccountNext}
        />
      );

    case 'cameraPermission':
      return (
        <CameraPermissionScreen
          onNext={handleCameraPermissionNext}
        />
      );

    case 'homePage':
      return <HomeScreen />;

    default:
      return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }
} 