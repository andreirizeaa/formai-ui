import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { supabase } from '../../lib/supabase';
import { useOnboarding } from '../../context/OnboardingContext';

interface CreateAccountScreenProps {
  onNext: () => void;
}

export function CreateAccountScreen({ onNext }: CreateAccountScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { updatePreference, persistOnboardingData } = useOnboarding();
  
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

  // Function to persist onboarding data after successful sign-in
  const handlePersistOnboardingData = async (signInMethod: 'google' | 'apple') => {
    try {
      // Set the sign-in method preference
      updatePreference('signInMethod', signInMethod);
      
      // Persist onboarding data to API/database
      const result = await persistOnboardingData();
      
      if (!result.success) {
        console.warn('Failed to persist onboarding data:', result.error);
        // Continue with onboarding flow even if persistence fails
      }
    } catch (error) {
      console.error('Error persisting onboarding data:', error);
      // Continue with onboarding flow even if persistence fails
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      hapticFeedback.selection();
      if (isExpoGo) {
        console.log('Google Sign-In not available in Expo Go');
        return;
      }
      
      // Dynamically import Google Sign-In modules
      const { GoogleSignin, statusCodes } = await import('@react-native-google-signin/google-signin');
      
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
          console.log('Google sign-in successful:', data);
          
          // Persist onboarding data with Google as sign-in method
          await handlePersistOnboardingData('google');
          
          onNext(); // This will navigate to main app if coming from sign-in flow
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
          console.log('Apple sign-in successful:', data);
          
          // Persist onboarding data with Apple as sign-in method
          await handlePersistOnboardingData('apple');
          
          onNext(); // This will navigate to main app if coming from sign-in flow
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

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Main content */}
      <View style={styles.contentWrapper}>
        {/* Main Title */}
        <Text style={[
          styles.mainTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {i18n.t('onboarding.createAccount.title')}
        </Text>

        {/* Button container with flex to center buttons */}
        <View style={styles.buttonWrapper}>
          {/* Sign in buttons */}
          <View style={styles.buttonContainer}>
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
                    {i18n.t('onboarding.createAccount.signInWithApple')}
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
                  {isExpoGo ? 'Sign in with Google' : i18n.t('onboarding.createAccount.signInWithGoogle')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 36,
    marginTop: 60,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  appleButton: {
    width: '80%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    width: '80%',
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 