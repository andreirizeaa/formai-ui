import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { hapticFeedback } from '../../utils/haptic';
import { supabase } from '../../lib/supabase';
import { useOnboarding } from '../../context/OnboardingContext';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { setUserId } from '../../services/storageService';
import i18n from '../../utils/i18n';
import { usePlacement } from 'expo-superwall';
import Purchases from 'react-native-purchases';
import { registerAndSaveExpoPushToken } from '../../services/push';

interface CreateAccountScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSignIn: () => void;
}

export function CreateAccountScreen({ onNext, onBack, onSignIn }: CreateAccountScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  
  const isExpoGo = Constants.appOwnership === 'expo';

  React.useEffect(() => {
    if (!isExpoGo) {
      import('@react-native-google-signin/google-signin').then(({ GoogleSignin }) => {
        GoogleSignin.configure({
          scopes: ['email', 'profile'],
          iosClientId: '338047674329-5dfpj06alfpfn0phi57c4bgdg6nihv87.apps.googleusercontent.com',
        });
      }).catch(error => {
        console.warn('Google Sign-In not available in this environment:', error);
      });
    }
  }, [isExpoGo]);

  const handleGoogleSignIn = async () => {
    try {
      hapticFeedback.selection();
      if (isExpoGo) {
        return;
      }
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices();
      setIsSigningIn(true);
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });
        if (error) {
          Alert.alert('Sign In Error', 'Unable to sign in with Google. Please try again.');
          setIsSigningIn(false);
        } else {
          updateOnboardingData('signInMethod', 'google');
          updateOnboardingData('onboardingCompleted', true);
          updateOnboardingData('walkthroughCompleted', false);
    
          if (data.user?.id) {
            try {
              updateOnboardingData('userId', data.user.id);
              await setUserId(data.user.id);
              handleNewAccount(data);
            } catch (persistError) {
              Alert.alert('Error', 'An error occurred while setting up your account. Please try again.');
              setIsSigningIn(false);
            }
          }
        }
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      setIsSigningIn(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsSigningIn(true);
    try {
      hapticFeedback.selection();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      if (credential.identityToken) {
        const { error, data } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        
        if (error) {
          Alert.alert('Sign In Error', 'Unable to sign in with Apple. Please try again.');
          setIsSigningIn(false);
        } else {
          updateOnboardingData('signInMethod', 'apple');
          updateOnboardingData('onboardingCompleted', true);
          updateOnboardingData('walkthroughCompleted', false);
          if (data.user?.id) {
            try {
              updateOnboardingData('userId', data.user.id);
              await setUserId(data.user.id);
              handleNewAccount(data);
            } catch (persistError) {
              Alert.alert('Error', 'An error occurred while setting up your account. Please try again.');
              setIsSigningIn(false);
            }
          }
        }
      } else {
        throw new Error('No identityToken.');
      }
    } catch (e: any) {
      setIsSigningIn(false);
    }
  };

  const handleNewAccount = async (data: any) => {
    const signInMethod = data.user?.app_metadata?.provider || 'apple';
    
    const updatedData = {
      ...onboardingData,
      signInMethod: signInMethod,
      onboardingCompleted: true,
      walkthroughCompleted: false,
      userId: data.user?.id
    };

    updateOnboardingData('signInMethod', signInMethod);
    updateOnboardingData('onboardingCompleted', true);
    updateOnboardingData('walkthroughCompleted', false);
    updateOnboardingData('userId', data.user.id);
    
    if (data.user?.id) {
      await Purchases.logIn(data.user.id);
      try {
        // Register Expo push token and persist it before onboarding persistence
        await registerAndSaveExpoPushToken(data.user.id);
        const { saveOnboardingProgress } = await import('../../services/onboardingService');
        await saveOnboardingProgress(updatedData);
        setIsSigningIn(false);
        onNext();
      } catch (persistError) {
        Alert.alert('Error', 'An error occurred while setting up your account. Please try again.');
        setIsSigningIn(false);
      }
    } else {
      setIsSigningIn(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Button container */}
        <View style={styles.buttonContainer}>
          {/* Sign in with Apple */}
          <TouchableOpacity
            style={[
              styles.appleButton,
              { backgroundColor: '#000000' }
            ]}
            onPress={handleAppleSignIn}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Image 
                source={require('../../../assets/icons/apple.png')}
                style={[
                  styles.appleIcon,
                  { tintColor: isDark ? '#000000' : '#FFFFFF' }
                ]}
              />
              <Text style={[
                styles.appleButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Sign up with Apple
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign in with Google */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              { 
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
              }
            ]}
            onPress={isExpoGo ? () => {
              hapticFeedback.selection();
            } : handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Image 
                source={require('../../../assets/icons/google.png')}
                style={styles.googleIcon}
              />
              <Text style={[
                styles.googleButtonText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                {i18n.t('onboarding.createAccount.signInWithGoogle')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Already have an account text */}
          <View style={styles.haveAccountContainer}>
            <Text style={[
              styles.haveAccountText,
              { color: '#ffffff' }
            ]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => {
              hapticFeedback.selection();
              onSignIn();
            }}>
              <Text style={[
                styles.signInLink,
                { color: isDark ? '#007AFF' : '#007AFF' }
              ]}>
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign in text placeholder */}
        <View />
      </View>
      
      <LoadingOverlay visible={isSigningIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  appleButton: {
    width: '90%',
    height: 60,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    width: '90%',
    height: 60,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  googleIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  appleButtonText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  haveAccountContainer: {
    flexDirection: 'row',
  },
  haveAccountText: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  signInLink: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textDecorationLine: 'underline',
  },
}); 