import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { supabase } from '../../lib/supabase';

interface CreateAccountScreenProps {
  onNext: () => void;
}

export function CreateAccountScreen({ onNext }: CreateAccountScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Configure Google Sign-In
  React.useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: '338047674329-5dfpj06alfpfn0phi57c4bgdg6nihv87.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      hapticFeedback.selection();
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
          onNext();
        }
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('Sign-in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log('Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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
          onNext();
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
          {i18n.t('createAccount.title')}
        </Text>

        {/* Button container with flex to center buttons */}
        <View style={styles.buttonWrapper}>
          {/* Sign in buttons */}
          <View style={styles.buttonContainer}>
            {/* Sign in with Apple - iOS only */}
            {Platform.OS === 'ios' ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={28}
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              />
            ) : (
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
                    {i18n.t('createAccount.signInWithApple')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Sign in with Google */}
            <GoogleSigninButton
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
            />
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
    fontSize: 32,
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
  appleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 