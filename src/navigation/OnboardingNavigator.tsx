import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Import screens
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OnboardingUnifiedScreen } from '../screens/onboarding/OnboardingUnifiedScreen';
import { AllDoneScreen } from '../screens/onboarding/AllDoneScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { SetupLoadingScreen } from '../screens/onboarding/SetupLoadingScreen';
import { FreeTrialScreen } from '../screens/payment/FreeTrialScreen';
import { NotificationReminderScreen } from '../screens/payment/NotificationReminderScreen';
import { SubscriptionSelectionScreen } from '../screens/payment/SubscriptionSelectionScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { CameraPermissionScreen } from '../screens/onboarding/CameraPermissionScreen';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
  onUserNeedsOnboarding: () => void;
}

export type OnboardingStackParamList = {
  Loading: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  AllDone: undefined;
  NotificationPermission: undefined;
  SetupLoading: undefined;
  FreeTrial: undefined;
  NotificationReminder: undefined;
  SubscriptionSelection: undefined;
  SignIn: undefined;
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
    navigation.navigate('Onboarding');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return <WelcomeScreen onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
}

function UnifiedOnboardingScreenWrapper() {
  return <OnboardingUnifiedScreen />;
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
    // Continue to main app or the next flow
  };

  const handleBack = () => {
    navigation.navigate('NotificationReminder');
  };

  return <SubscriptionSelectionScreen onNext={handleNext} onBack={handleBack} />;
}

function SignInScreenWrapper({ onSignIn, onUserNeedsOnboarding }: { onSignIn: () => void; onUserNeedsOnboarding: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNavigateToOnboarding = () => {
    onUserNeedsOnboarding();
    navigation.navigate('Onboarding');
  };

  return <SignInScreen onSignIn={onSignIn} onBack={() => navigation.navigate("Welcome")} onNavigateToOnboarding={handleNavigateToOnboarding} />;
}

function CreateAccountScreenWrapper({ onComplete, onSignIn }: { onComplete: () => void; onSignIn: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('CameraPermission');
  };

  return <CreateAccountScreen onNext={handleNext} />;
}

function CameraPermissionScreenWrapper({ onComplete }: { onComplete: () => void }) {
  return <CameraPermissionScreen onNext={onComplete} />;
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

export function OnboardingNavigator({ onComplete, onSignIn, onUserNeedsOnboarding }: OnboardingNavigatorProps) {
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

        <Stack.Screen name="Onboarding">
          {() => <UnifiedOnboardingScreenWrapper />}
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

        <Stack.Screen name="SignIn">
          {() => <SignInScreenWrapper onSignIn={onSignIn} onUserNeedsOnboarding={onUserNeedsOnboarding} />}
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