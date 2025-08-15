import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp, CardStyleInterpolators } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Import screens
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OnboardingUnifiedScreen } from '../screens/onboarding/OnboardingUnifiedScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { SetupLoadingScreen } from '../screens/onboarding/SetupLoadingScreen';
import { PaymentUnifiedScreen } from '../screens/payment/PaymentUnifiedScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { CameraPermissionScreen } from '../screens/onboarding/CameraPermissionScreen';
import { useOnboarding } from '../context/OnboardingContext';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
  onUserNeedsOnboarding: () => void;
}

export type OnboardingStackParamList = {
  Loading: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  NotificationPermission: undefined;
  SetupLoading: undefined;
  Payment: undefined;
  SignIn: undefined;
  CameraPermission: undefined;
};

type OnboardingNavigationProp = StackNavigationProp<OnboardingStackParamList>;

const Stack = createStackNavigator<OnboardingStackParamList>();

// Wrapper components that handle navigation
function LoadingScreenWrapper({ onComplete }: { onComplete: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleLoadComplete = () => {
    navigation.navigate('Onboarding');
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

function PaymentUnifiedScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  return (
    <PaymentUnifiedScreen
      onComplete={() => {
        // After payment completion, go directly to camera permission
        navigation.navigate('CameraPermission');
      }}
    />
  );
}

function SignInScreenWrapper({ onSignIn, onUserNeedsOnboarding }: { onSignIn: () => void; onUserNeedsOnboarding: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNavigateToOnboarding = () => {
    onUserNeedsOnboarding();
    navigation.navigate('Onboarding');
  };

  return <SignInScreen onSignIn={onSignIn} onBack={() => navigation.navigate("Welcome")} onNavigateToOnboarding={handleNavigateToOnboarding} />;
}

function CameraPermissionScreenWrapper({ onComplete }: { onComplete: () => void }) {
  return <CameraPermissionScreen onNext={onComplete} />;
}

function NotificationPermissionScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('SetupLoading');
  };

  const handleBack = () => {
    navigation.navigate('Onboarding');
  };

  return <NotificationPermissionScreen onNext={handleNext} onBack={handleBack} />;
}

function SetupLoadingScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('Payment');
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
        initialRouteName="Welcome"
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

        <Stack.Screen name="NotificationPermission">
          {() => <NotificationPermissionScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen name="SetupLoading">
          {() => <SetupLoadingScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen 
          name="Payment"
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        >
          {() => <PaymentUnifiedScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen 
          name="SignIn"
          options={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        >
          {() => <SignInScreenWrapper onSignIn={onSignIn} onUserNeedsOnboarding={onUserNeedsOnboarding} />}
        </Stack.Screen>

        <Stack.Screen 
          name="CameraPermission" 
          options={{ 
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        >
          {() => <CameraPermissionScreenWrapper onComplete={onComplete} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
} 