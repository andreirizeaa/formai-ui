import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { useColorScheme } from 'react-native';
import { Asset } from 'expo-asset';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { LoadingLiftsProvider } from './src/context/LoadingLiftsContext';
import { LiftDataProvider } from './src/context/LiftDataContext';
import { UserDetailsProvider } from './src/context/UserDetailsContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainAppLayout } from './src/components/layout/MainAppLayout';
import { PurchasesProvider } from './src/context/PurchasesContext';
import { StreakProvider } from './src/context/StreakContext';
import { WalletCreditProvider } from './src/context/WalletCreditContext';
import { getUserId, removeUserId } from './src/services/storageService';
import { fetchUserById, requiresOnboarding, requiresPayment } from './src/services/userService';
import { supabase } from './src/lib/supabase';
import { LoadingScreen } from './src/screens/onboarding/LoadingScreen';

export default function App() {
  const queryClientRef = React.useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<'Welcome' | 'Payment'>('Welcome');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function preloadAndBootstrap() {
      try {
        await Asset.loadAsync([
          require('./assets/recording-tip.jpg'),
          require('./assets/refer-friends.jpg'),
          require('./assets/refer-friends-group.png'),
          require('./assets/formai-light-icon.png'),
          require('./assets/formai-dark-icon.png'),
          require('./assets/formai-ios-icon.png'),
          // Discovery page icons
          require('./assets/icons/instagram.png'),
          require('./assets/icons/tiktok.png'),
          require('./assets/icons/fasebook.png'),
          require('./assets/icons/google.png'),
          require('./assets/icons/apple.png'),
          require('./assets/icons/fire.png'),
          require('./assets/animations/confetti.json'),
          require('./assets/animations/star-rating.json'),
        ]);
      } catch (error) {
        console.warn('Error preloading assets:', error);
      } finally {
        // continue to bootstrap auth state
      }

      try {
        const storedUserId = await getUserId();
        if (!storedUserId) {
          setShowOnboarding(true);
          setOnboardingInitialRoute('Welcome');
          return;
        }
        const { user } = await fetchUserById(storedUserId);
        if (!user) {
          // user not found, send to welcome to re-onboard/sign-in
          setShowOnboarding(true);
          setOnboardingInitialRoute('Welcome');
          return;
        }
        if (requiresOnboarding(user)) {
          setShowOnboarding(true);
          return;
        }
        if (requiresPayment(user)) {
          setShowOnboarding(true);
          setOnboardingInitialRoute('Payment');
          return;
        }
        // user has active subscription
        setShowOnboarding(false);
      } catch (e) {
        console.warn('Bootstrap error:', e);
      setShowOnboarding(true);
        setOnboardingInitialRoute('Welcome');
      } finally {
        // Add extra 1 second delay before hiding loading screen
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    }

    preloadAndBootstrap();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setUserNeedsOnboarding(false);
  };

  const handleSignIn = () => {
    setShowOnboarding(false);
    setUserNeedsOnboarding(false);
  };

  const handlePaymentComplete = () => {
    handleOnboardingComplete();
  };

  const handleUserNeedsOnboarding = () => {
    setUserNeedsOnboarding(true);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Sign out from Google if available
      try {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      } catch (googleError) {
        console.warn('Google Sign-In not available or error signing out:', googleError);
      }
      
      // Remove user ID from local storage
      await removeUserId();
      // Navigate back to welcome screen
      setShowOnboarding(true);
      setOnboardingInitialRoute('Welcome');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen onLoadComplete={() => {}} />
      </SafeAreaProvider>
    );
  }

  const mainAppContent = (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClientRef.current}>
        <LanguageProvider>
          <WalletCreditProvider>
            <UserDetailsProvider>
              <LiftDataProvider>
                <LoadingLiftsProvider>
                  <StreakProvider>
                    <MainAppLayout onLogout={handleLogout} />
                  </StreakProvider>
                </LoadingLiftsProvider>
              </LiftDataProvider>
            </UserDetailsProvider>
          </WalletCreditProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );

  const onboardingContent = (
    <SafeAreaProvider>
      <LanguageProvider>
        <OnboardingProvider>
          <PurchasesProvider>
            <OnboardingNavigator 
              onComplete={handlePaymentComplete}
              onSignIn={handleSignIn}
              onUserNeedsOnboarding={handleUserNeedsOnboarding}
              initialRouteName={onboardingInitialRoute}
            />
          </PurchasesProvider>
        </OnboardingProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );

  if (showOnboarding || userNeedsOnboarding) {
    return onboardingContent;
  }

  return mainAppContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
  },
});
