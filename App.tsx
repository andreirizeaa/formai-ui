import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, Animated, Dimensions, InteractionManager } from 'react-native';
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
import { getUserId, setUserId, removeUserId } from './src/services/storageService';
import { fetchUserById, requiresOnboarding, requiresPayment } from './src/services/userService';
import { supabase } from './src/lib/supabase';

const { width } = Dimensions.get('window');

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userNeedsOnboarding, setUserNeedsOnboarding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [onboardingInitialRoute, setOnboardingInitialRoute] = useState<'Welcome' | 'Payment'>('Welcome');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const slideAnim = useRef(new Animated.Value(0)).current;
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
          // Auth and other icons
          require('./assets/icons/apple.png'),
          require('./assets/icons/fire.png'),
          require('./assets/animations/confetti.json'),
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
        setIsLoading(false);
      }
    }

    preloadAndBootstrap();
  }, []);

  const handleOnboardingComplete = () => {
    setIsTransitioning(true);
    
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      InteractionManager.runAfterInteractions(() => {
        if (!isMountedRef.current) return;
        setShowOnboarding(false);
        setUserNeedsOnboarding(false);
        setIsTransitioning(false);
        slideAnim.setValue(0);
      });
    });
  };

  const handleSignIn = () => {
    setIsTransitioning(true);
    
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      InteractionManager.runAfterInteractions(() => {
        if (!isMountedRef.current) return;
        setShowOnboarding(false);
        setUserNeedsOnboarding(false);
        setIsTransitioning(false);
        slideAnim.setValue(0);
      });
    });
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
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    );
  }

  const mainAppContent = (
    <SafeAreaProvider>
      <LanguageProvider>
        <OnboardingProvider>
          <PurchasesProvider>
            <UserDetailsProvider>
              <LoadingLiftsProvider>
                <LiftDataProvider>
                  <MainAppLayout onLogout={handleLogout} />
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
              onComplete={handlePaymentComplete}
              onSignIn={handleSignIn}
              onUserNeedsOnboarding={handleUserNeedsOnboarding}
              initialRouteName={onboardingInitialRoute}
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
