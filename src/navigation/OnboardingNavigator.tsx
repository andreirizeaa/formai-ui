import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// Import screens
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OnboardingUnifiedScreen } from '../screens/onboarding/OnboardingUnifiedScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { AccountLoadingScreen } from '../screens/onboarding/AccountLoadingScreen';
import { PaymentScreen } from '../screens/payment/PaymentScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { CameraPermissionScreen } from '../screens/onboarding/CameraPermissionScreen';
import { useSuperwallContext } from '../context/SuperwallContext';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
  onUserNeedsOnboarding: () => void;
  initialRouteName?: 'Welcome' | 'Payment';
}

export type OnboardingStackParamList = {
  Loading: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  NotificationPermission: undefined;
  SetupLoading: undefined;
  AccountLoading: undefined;
  Payment: undefined;
  SignIn: undefined;
  CameraPermission: undefined;
  AllDone: undefined;
};

export type OnboardingNavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

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

function PaymentScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  return (
    <PaymentScreen
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

  const handleRequirePayment = () => {
    navigation.navigate('Payment');
  };

  return <SignInScreen onSignIn={onSignIn} onBack={() => navigation.goBack()} onNavigateToOnboarding={handleNavigateToOnboarding} onRequirePayment={handleRequirePayment} />;
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

function AccountLoadingScreenWrapper({ onComplete }: { onComplete: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { superwallCustomerInfo} = useSuperwallContext();
  
  const handleNext = async () => {
    const entitlementsIds = superwallCustomerInfo.subscriptionStatus.status === "ACTIVE" 
      ? superwallCustomerInfo.subscriptionStatus.entitlements
      : [];
    if (entitlementsIds.length === 0) {
      navigation.navigate('Payment');
    } else {
      onComplete();
    }
  };

  return <AccountLoadingScreen onComplete={handleNext} />;
}

export function OnboardingNavigator({ onComplete, onSignIn, onUserNeedsOnboarding, initialRouteName = 'Welcome' }: OnboardingNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
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

        <Stack.Screen 
          name="AccountLoading"
        >
          {() => <AccountLoadingScreenWrapper onComplete={onComplete} />}
        </Stack.Screen>

        <Stack.Screen 
          name="Payment"
        >
          {() => <PaymentScreenWrapper />}
        </Stack.Screen>

        <Stack.Screen 
          name="SignIn"
        >
          {() => <SignInScreenWrapper onSignIn={onSignIn} onUserNeedsOnboarding={onUserNeedsOnboarding} />}
        </Stack.Screen>

        <Stack.Screen 
          name="CameraPermission"
        >
          {() => <CameraPermissionScreenWrapper onComplete={onComplete} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
