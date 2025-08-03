import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
}

export type OnboardingStackParamList = {
  Loading: undefined;
  Welcome: undefined;
  Language: undefined;
  Gender: undefined;
  Workouts: undefined;
  Discovery: undefined;
  PersonalTrainer: undefined;
  Progress: undefined;
  Measurements: undefined;
  BirthDate: undefined;
  LiftingGoal: undefined;
  FormBarrier: undefined;
  Rating: undefined;
  ReferralCode: undefined;
  AllDone: undefined;
  NotificationPermission: undefined;
  SetupLoading: undefined;
  FreeTrial: undefined;
  NotificationReminder: undefined;
  SubscriptionSelection: undefined;
  CreateAccount: undefined;
  CameraPermission: undefined;
};

type OnboardingNavigationProp = StackNavigationProp<OnboardingStackParamList>;

const Stack = createStackNavigator<OnboardingStackParamList>();

// Wrapper components that handle navigation
function LoadingScreenWrapper({ onComplete }: { onComplete: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleLoadComplete = () => {
    navigation.navigate('Welcome');
  };

  return <LoadingScreen onLoadComplete={handleLoadComplete} />;
}

function WelcomeScreenWrapper({ onSignIn }: { onSignIn: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleGetStarted = () => {
    navigation.navigate('Language');
  };

  return <WelcomeScreen onGetStarted={handleGetStarted} onSignIn={onSignIn} />;
}

function LanguageScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Gender');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <LanguageScreen onNext={handleNext} onBack={handleBack} />;
}

function GenderScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Workouts');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <GenderScreen onNext={handleNext} onBack={handleBack} />;
}

function WorkoutsScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Discovery');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <WorkoutsScreen onNext={handleNext} onBack={handleBack} />;
}

function DiscoveryScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('PersonalTrainer');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <DiscoveryScreen onNext={handleNext} onBack={handleBack} />;
}

function PersonalTrainerScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Progress');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <PersonalTrainerScreen onNext={handleNext} onBack={handleBack} />;
}

function ProgressScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Measurements');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <ProgressScreen onNext={handleNext} onBack={handleBack} />;
}

function MeasurementsScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('BirthDate');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <MeasurementsScreen onNext={handleNext} onBack={handleBack} />;
}

function BirthDateScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('LiftingGoal');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <BirthDateScreen onNext={handleNext} onBack={handleBack} />;
}

function LiftingGoalScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('FormBarrier');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <LiftingGoalScreen onNext={handleNext} onBack={handleBack} />;
}

function FormBarrierScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Rating');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <FormBarrierScreen onNext={handleNext} onBack={handleBack} />;
}

function RatingScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('ReferralCode');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <RatingScreen onNext={handleNext} onBack={handleBack} />;
}

function ReferralCodeScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('AllDone');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <ReferralCodeScreen onNext={handleNext} onBack={handleBack} />;
}

function AllDoneScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('NotificationPermission');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <AllDoneScreen onNext={handleNext} onBack={handleBack} />;
}

function NotificationPermissionScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('SetupLoading');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <NotificationPermissionScreen onNext={handleNext} onBack={handleBack} />;
}

function SetupLoadingScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('FreeTrial');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <SetupLoadingScreen onNext={handleNext} onBack={handleBack} />;
}

function FreeTrialScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('NotificationReminder');
  };

  return <FreeTrialScreen onNext={handleNext} />;
}

function NotificationReminderScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('SubscriptionSelection');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <NotificationReminderScreen onNext={handleNext} onBack={handleBack} />;
}

function SubscriptionSelectionScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('CreateAccount');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return <SubscriptionSelectionScreen onNext={handleNext} onBack={handleBack} />;
}

function CreateAccountScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('CameraPermission');
  };

  return <CreateAccountScreen onNext={handleNext} />;
}

function CameraPermissionScreenWrapper({ onComplete }: { onComplete: () => void }) {
  return <CameraPermissionScreen onNext={onComplete} />;
}

export function OnboardingNavigator({ onComplete, onSignIn }: OnboardingNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Loading">
          {() => <LoadingScreenWrapper onComplete={onComplete} />}
        </Stack.Screen>

        <Stack.Screen name="Welcome">
          {() => <WelcomeScreenWrapper onSignIn={onSignIn} />}
        </Stack.Screen>

        <Stack.Screen name="Language">
          {() => <LanguageScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="Gender">
          {() => <GenderScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="Workouts">
          {() => <WorkoutsScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="Discovery">
          {() => <DiscoveryScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="PersonalTrainer">
          {() => <PersonalTrainerScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="Progress">
          {() => <ProgressScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="Measurements">
          {() => <MeasurementsScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="BirthDate">
          {() => <BirthDateScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="LiftingGoal">
          {() => <LiftingGoalScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="FormBarrier">
          {() => <FormBarrierScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="Rating">
          {() => <RatingScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="ReferralCode">
          {() => <ReferralCodeScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="AllDone">
          {() => <AllDoneScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="NotificationPermission">
          {() => <NotificationPermissionScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="SetupLoading">
          {() => <SetupLoadingScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="FreeTrial">
          {() => <FreeTrialScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="NotificationReminder">
          {() => <NotificationReminderScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="SubscriptionSelection">
          {() => <SubscriptionSelectionScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="CreateAccount">
          {() => <CreateAccountScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="CameraPermission">
          {() => <CameraPermissionScreenWrapper onComplete={onComplete} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
} 