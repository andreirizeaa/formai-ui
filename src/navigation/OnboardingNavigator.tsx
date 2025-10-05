import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// Import screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OnboardingUnifiedScreen } from '../screens/onboarding/OnboardingUnifiedScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { AccountLoadingScreen } from '../screens/onboarding/AccountLoadingScreen';
import { PaymentScreen } from '../screens/payment/PaymentScreen';
import Purchases from 'react-native-purchases';
import { usePurchases } from '../context/PurchasesContext';
import { useUserDetails } from '../context/UserDetailsContext';
import { track } from '../services/analytics';

interface OnboardingNavigatorProps {
  onComplete: () => void;
  onSignIn: () => void;
  onUserNeedsOnboarding: () => void;
  initialRouteName?: 'Welcome' | 'Payment';
  isAppVisible?: boolean;
}

export type OnboardingStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  NotificationPermission: undefined;
  AccountLoading: undefined;
  Payment: undefined;
  AllDone: undefined;
};

export type OnboardingNavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

// Wrapper components that handle navigation

function WelcomeScreenWrapper({ onSignIn, isAppVisible }: { onSignIn: () => void; isAppVisible?: boolean }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleNavigateToOnboarding = () => {
    navigation.navigate('Onboarding');
  };

  const handleRequirePayment = () => {
    navigation.navigate('Payment');
  };

  return (
    <WelcomeScreen 
      onGetStarted={handleGetStarted} 
      onSignIn={onSignIn} 
      onNavigateToOnboarding={handleNavigateToOnboarding}
      onRequirePayment={handleRequirePayment}
      isAppVisible={isAppVisible} 
    />
  );
}

function UnifiedOnboardingScreenWrapper() {
  return <OnboardingUnifiedScreen />;
}

function PaymentScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  return (
    <PaymentScreen
      onComplete={() => {
        // After payment completion, go to account loading
        navigation.navigate('AccountLoading');
      }}
    />
  );
}



function NotificationPermissionScreenWrapper() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  
  const handleNext = () => {
    navigation.navigate('AccountLoading');
  };

  const handleBack = () => {
    navigation.navigate('Onboarding');
  };

  return <NotificationPermissionScreen onNext={handleNext} onBack={handleBack} />;
}

function AccountLoadingScreenWrapper({ onComplete }: { onComplete: () => void }) {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { customerInfo } = usePurchases();
  const { refetchUserDetails } = useUserDetails();
  const isRunningRef = React.useRef(false);
  
  const handleNext = async () => {
    if (isRunningRef.current) return; // guard against double-taps
    isRunningRef.current = true;

    const entitlementIds = Object.keys(customerInfo?.entitlements.active ?? []);
    if (entitlementIds.length === 0) {
      navigation.navigate('Payment');
    } else {
      await refetchUserDetails(); // ensure context is populated, silently
      onComplete();               // this triggers your fade to MainAppLayout
    }

    isRunningRef.current = false;
  };

  return <AccountLoadingScreen onComplete={handleNext} />;
}

export function OnboardingNavigator({ onComplete, onSignIn, onUserNeedsOnboarding, initialRouteName = 'Welcome', isAppVisible = false }: OnboardingNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome">
          {() => <WelcomeScreenWrapper onSignIn={onSignIn} isAppVisible={isAppVisible} />}
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


      </Stack.Navigator>
    </NavigationContainer>
  );
}
