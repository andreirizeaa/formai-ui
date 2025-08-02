import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { MainAppLayout } from './src/components/layout/MainAppLayout';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false); // Show onboarding first
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    console.log('Onboarding completed - navigate to main app');
  };

  const handleSignIn = () => {
    console.log('Navigate to sign in screen');
    // TODO: Implement sign in navigation
  };

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
        <MainAppLayout />
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
