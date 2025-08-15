import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { hapticFeedback } from '../../utils/haptic';
import { supabase } from '../../lib/supabase';
import { useOnboarding } from '../../context/OnboardingContext';

interface CreateAccountScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSignIn: () => void;
}

export function CreateAccountScreen({ onNext, onBack, onSignIn }: CreateAccountScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { onboardingData, updateOnboardingData, persistOnboardingData } = useOnboarding();
  
  // Check if we're running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  // Configure Google Sign-In only if not in Expo Go
  React.useEffect(() => {
    if (!isExpoGo) {
      // Only import GoogleSignin and GoogleSigninButton if not in Expo Go
      // This prevents a startup error if Google Sign-In is not available
      // in the current environment.
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
        console.log('Google Sign-In not available in Expo Go');
        return;
      }
      
      // Dynamically import Google Sign-In modules
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        });
        if (error) {
          console.error('Supabase auth error:', error);
        } else {
          updateOnboardingData('signInMethod', 'google');
          updateOnboardingData('onboardingCompleted', true);
    
          // Persist onboarding data to API
          if (data.user?.id) {
            try {
              updateOnboardingData('userId', data.user.id);
              handleNewAccount(data);
            } catch (persistError) {
              console.error('Error persisting onboarding data:', persistError);
            }
          }
        }
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      // Check if we have statusCodes available (from dynamic import)
      if (error.code === 'SIGN_IN_CANCELLED') {
        // user cancelled the login flow
        console.log('Sign-in cancelled');
      } else if (error.code === 'IN_PROGRESS') {
        // operation (e.g. sign in) is in progress already
        console.log('Sign-in already in progress');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        // play services not available or outdated
        console.log('Play services not available');
      } else {
        // some other error happened
        console.error('Google sign-in error:', error);
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      hapticFeedback.selection();
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      // Sign in via Supabase Auth
      if (credential.identityToken) {
        const { error, data } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });
        
        if (error) {
          console.error('Supabase auth error:', error);
        } else {
          updateOnboardingData('signInMethod', 'apple');
          updateOnboardingData('onboardingCompleted', true);
          // Persist onboarding data to API
          if (data.user?.id) {
            try {
              updateOnboardingData('userId', data.user.id);
              handleNewAccount(data);
            } catch (persistError) {
              console.error('Error persisting onboarding data:', persistError);
            }
          }
        }
      } else {
        throw new Error('No identityToken.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
        console.log('Apple sign-in cancelled');
      } else {
        // handle other errors
        console.error('Apple sign-in error:', e);
      }
    }
  };

  const handleNewAccount = async (data: any) => {
    // Determine the sign-in method based on the provider in data
    const signInMethod = data.user?.app_metadata?.provider || 'apple';
    
    // Build the updated onboarding data with the new values
    const updatedData = {
      ...onboardingData,
      signInMethod: signInMethod,
      onboardingCompleted: true,
      userId: data.user?.id
    };

    // Update the context state (these will update eventually)
    updateOnboardingData('signInMethod', signInMethod);
    updateOnboardingData('onboardingCompleted', true);
    updateOnboardingData('userId', data.user.id);
    
    // Persist the updated data immediately using the built object
    if (data.user?.id) {
      try {
        console.log("Persisting onboarding data:", updatedData);
        
        // We need to call the service directly with the updated data
        // since persistOnboardingData uses the context state which hasn't updated yet
        const { saveOnboardingProgress } = await import('../../services/onboardingService');
        const response = await saveOnboardingProgress(updatedData);
        
        console.log("API response:", response);
        onNext();
      } catch (persistError) {
        console.error('Error persisting onboarding data:', persistError);
      }
    }
  }

  const handleSignInPress = () => {
    hapticFeedback.selection();
    onSignIn();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Button container */}
        <View style={styles.buttonContainer}>
          {/* Sign in with Apple */}
          <TouchableOpacity
            style={[
              styles.appleButton,
              { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
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
                resizeMode="contain"
              />
              <Text style={[
                styles.appleButtonText,
                { color: isDark ? '#000000' : '#FFFFFF' }
              ]}>
                Sign in with Apple
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign in with Google */}
          <TouchableOpacity
            style={[
              styles.googleButton,
              { 
                backgroundColor: isDark ? '#000000' : '#FFFFFF',
                borderColor: isDark ? '#FFFFFF' : '#000000'
              }
            ]}
            onPress={isExpoGo ? () => {
              hapticFeedback.selection();
              console.log('Google Sign-In not available in Expo Go');
            } : handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Image 
                source={require('../../../assets/icons/google.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={[
                styles.googleButtonText,
                { color: isDark ? '#FFFFFF' : '#000000' }
              ]}>
                Sign in with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign in text */}
        <View style={styles.signInContainer}>
          <Text style={[
            styles.signInText,
            { color: isDark ? '#8E8E93' : '#8E8E93' }
          ]}>
            Already have an account?{' '}
            <Text 
              style={[
                styles.signInLink,
                { color: isDark ? '#007AFF' : '#007AFF' }
              ]}
              onPress={handleSignInPress}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </View>
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
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
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
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  googleButtonText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  signInContainer: {
    alignItems: 'center',
  },
  signInText: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  signInLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 