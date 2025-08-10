import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useOnboarding } from '../context/OnboardingContext';

// Import all onboarding screens
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { LanguageScreen } from '../screens/onboarding/LanguageScreen';
import { UnitsScreen } from '../screens/onboarding/UnitsScreen';
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

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
}

export type OnboardingStackParamList = {
  Loading: undefined;
  Welcome: undefined;
  Language: undefined;
  Units: undefined;
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

  const handleSignIn = () => {
    navigation.navigate('CreateAccount');
  };

  return <WelcomeScreen onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
}

function LanguageScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Units');
  };

  const handleBack = () => {
    navigation.navigate('Welcome');
  };

  return <LanguageScreen onNext={handleNext} onBack={handleBack} />;
}

function UnitsScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Gender');
  };

  const handleBack = () => {
    navigation.navigate('Language');
  };

  return <UnitsScreen onNext={handleNext} onBack={handleBack} />;
}

function GenderScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Workouts');
  };

  const handleBack = () => {
    navigation.navigate('Units');
  };

  return <GenderScreen onNext={handleNext} onBack={handleBack} />;
}

function WorkoutsScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Discovery');
  };

  const handleBack = () => {
    navigation.navigate('Gender');
  };

  return <WorkoutsScreen onNext={handleNext} onBack={handleBack} />;
}

function DiscoveryScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('PersonalTrainer');
  };

  const handleBack = () => {
    navigation.navigate('Workouts');
  };

  return <DiscoveryScreen onNext={handleNext} onBack={handleBack} />;
}

function PersonalTrainerScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Progress');
  };

  const handleBack = () => {
    navigation.navigate('Discovery');
  };

  return <PersonalTrainerScreen onNext={handleNext} onBack={handleBack} />;
}

function ProgressScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Measurements');
  };

  const handleBack = () => {
    navigation.navigate('PersonalTrainer');
  };

  return <ProgressScreen onNext={handleNext} onBack={handleBack} />;
}

function MeasurementsScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('BirthDate');
  };

  const handleBack = () => {
    navigation.navigate('Progress');
  };

  return <MeasurementsScreen onNext={handleNext} onBack={handleBack} />;
}

function BirthDateScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('LiftingGoal');
  };

  const handleBack = () => {
    navigation.navigate('Measurements');
  };

  return <BirthDateScreen onNext={handleNext} onBack={handleBack} />;
}

function LiftingGoalScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('FormBarrier');
  };

  const handleBack = () => {
    navigation.navigate('BirthDate');
  };

  return <LiftingGoalScreen onNext={handleNext} onBack={handleBack} />;
}

function FormBarrierScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Rating');
  };

  const handleBack = () => {
    navigation.navigate('LiftingGoal');
  };

  return <FormBarrierScreen onNext={handleNext} onBack={handleBack} />;
}

function RatingScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('ReferralCode');
  };

  const handleBack = () => {
    navigation.navigate('FormBarrier');
  };

  return <RatingScreen onNext={handleNext} onBack={handleBack} />;
}

function ReferralCodeScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('AllDone');
  };

  const handleBack = () => {
    navigation.navigate('Rating');
  };

  return <ReferralCodeScreen onNext={handleNext} onBack={handleBack} />;
}

function AllDoneScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('NotificationPermission');
  };

  const handleBack = () => {
    navigation.navigate('ReferralCode');
  };

  return <AllDoneScreen onNext={handleNext} onBack={handleBack} />;
}

function NotificationPermissionScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('SetupLoading');
  };

  const handleBack = () => {
    navigation.navigate('AllDone');
  };

  return <NotificationPermissionScreen onNext={handleNext} onBack={handleBack} />;
}

function SetupLoadingScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('FreeTrial');
  };

  const handleBack = () => {
    navigation.navigate('NotificationPermission');
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
    navigation.navigate('FreeTrial');
  };

  return <NotificationReminderScreen onNext={handleNext} onBack={handleBack} />;
}

function SubscriptionSelectionScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('CreateAccount');
  };

  const handleBack = () => {
    navigation.navigate('NotificationReminder');
  };

  return <SubscriptionSelectionScreen onNext={handleNext} onBack={handleBack} />;
}

function CreateAccountScreenWrapper({ onComplete, onSignIn }: { onComplete: () => void; onSignIn: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    // If we came from sign-in flow, go to main app
    // If we came from onboarding flow, continue to camera permission
    if (navigation.getState().routes.some(route => route.name === 'Welcome')) {
      onSignIn(); // This will navigate to main app
    } else {
      navigation.navigate('CameraPermission');
    }
  };

  // Check if we came from sign-in flow (Welcome screen)
  const isSignIn = navigation.getState().routes.some(route => route.name === 'Welcome');

  return <CreateAccountScreen onNext={handleNext} isSignIn={isSignIn} />;
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
          cardStyleInterpolator: () => ({
            cardStyle: {
              transform: [{ translateX: 0 }],
            },
          }),
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

        <Stack.Screen name="Units">
          {() => <UnitsScreenWrapper />}
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
          {() => <CreateAccountScreenWrapper onComplete={onComplete} onSignIn={onSignIn} />}
        </Stack.Screen>

        <Stack.Screen name="CameraPermission">
          {() => <CameraPermissionScreenWrapper onComplete={onComplete} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
} 