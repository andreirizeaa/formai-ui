import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Asset } from 'expo-asset';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { LoadingLiftsProvider } from './src/context/LoadingLiftsContext';
import { LiftDataProvider } from './src/context/LiftDataContext';
import { UserDetailsProvider } from './src/context/UserDetailsContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainAppLayout } from './src/components/layout/MainAppLayout';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    async function preloadAssets() {
      try {
        await Asset.loadAsync([
          require('./assets/recording-tip.jpg'),
          require('./assets/refer-friends.jpg'),
          require('./assets/refer-friends-group.png'),
          require('./assets/formai-light-icon.png'),
          require('./assets/formai-dark-icon.png'),
          require('./assets/formai-ios-logo.png'),
        ]);
      } catch (error) {
        console.warn('Error preloading assets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    preloadAssets();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    console.log('Onboarding completed - navigate to main app');
  };

  const handleSignIn = () => {
    console.log('Navigate to sign in screen');
    // TODO: Implement sign in navigation
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <LanguageProvider>
          <OnboardingProvider>
            <OnboardingNavigator 
              onComplete={handleOnboardingComplete}
              onSignIn={handleSignIn}
            />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </OnboardingProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    );
  }

  // Main app with bottom navigation
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <UserDetailsProvider>
          <LoadingLiftsProvider>
            <LiftDataProvider>
              <MainAppLayout />
            </LiftDataProvider>
          </LoadingLiftsProvider>
        </UserDetailsProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </LanguageProvider>
    </SafeAreaProvider>
  );
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
