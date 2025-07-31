import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
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
        <OnboardingProvider>
          <OnboardingNavigator 
            onComplete={handleOnboardingComplete}
            onSignIn={handleSignIn}
          />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </OnboardingProvider>
      </SafeAreaProvider>
    );
  }

  // Main app placeholder
  return (
    <SafeAreaProvider>
      <View style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}>
        <Text style={[
          styles.text,
          { 
            color: isDark ? '#FFFFFF' : '#000000',
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
          }
        ]}>
          Welcome to FormAI!
        </Text>
        <Text style={[
          styles.subtitle,
          { 
            color: isDark ? '#AEAEB2' : '#8E8E93',
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
          }
        ]}>
          Onboarding completed successfully
        </Text>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
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
