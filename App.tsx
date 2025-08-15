import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, Animated, Dimensions } from 'react-native';
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
import { PurchasesProvider } from './src/context/PurchasesContext';

const { width } = Dimensions.get('window');

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function preloadAssets() {
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
          // Auth and other icons
          require('./assets/icons/apple.png'),
          require('./assets/icons/fire.png'),
          require('./assets/animations/confetti.json'),
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
    setIsTransitioning(true);
    
    // Animate the transition from right to left
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowOnboarding(false);
      setUserNeedsOnboarding(false);
      setIsTransitioning(false);
      slideAnim.setValue(0);
    });
  };

  const handleSignIn = () => {
    setIsTransitioning(true);
    
    // Animate the transition from right to left
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowOnboarding(false);
      setUserNeedsOnboarding(false);
      setIsTransitioning(false);
      slideAnim.setValue(0);
    });
  };

  const handleUserNeedsOnboarding = () => {
    setUserNeedsOnboarding(true);
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

  // Main app content
  const mainAppContent = (
    <SafeAreaProvider>
      <LanguageProvider>
        <OnboardingProvider>
          <PurchasesProvider>
            <UserDetailsProvider>
              <LoadingLiftsProvider>
                <LiftDataProvider>
                  <MainAppLayout />
                </LiftDataProvider>
              </LoadingLiftsProvider>
            </UserDetailsProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </PurchasesProvider>
        </OnboardingProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );

  const onboardingContent = (
    <SafeAreaProvider>
      <LanguageProvider>
        <OnboardingProvider>
          <PurchasesProvider>
            <OnboardingNavigator 
              onComplete={handleOnboardingComplete}
              onSignIn={handleSignIn}
              onUserNeedsOnboarding={handleUserNeedsOnboarding}
            />
            <StatusBar style={isDark ? 'light' : 'dark'} />
          </PurchasesProvider>
        </OnboardingProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );

  if (showOnboarding || userNeedsOnboarding) {
    return (
      <View style={styles.transitionContainer}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {onboardingContent}
        </Animated.View>
        {isTransitioning && (
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                transform: [{ translateX: Animated.add(slideAnim, width) }],
              },
            ]}
          >
            {mainAppContent}
          </Animated.View>
        )}
      </View>
    );
  }

  // Main app with bottom navigation
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
  transitionContainer: {
    flex: 1,
  },
  animatedContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
