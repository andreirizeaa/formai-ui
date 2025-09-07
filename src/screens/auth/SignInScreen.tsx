import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { supabase } from '../../lib/supabase';
import { BackButton } from '../../components/ui/BackButton';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { removeUserId, setUserId } from '../../services/storageService';
import { fetchUserById, requiresOnboarding } from '../../services/userService';
import Purchases from 'react-native-purchases';
import { usePurchases } from '../../context/PurchasesContext';

interface SignInScreenProps {
  onSignIn: () => void;
  onBack: () => void;
  onNavigateToOnboarding?: () => void;
  onRequirePayment?: () => void;
}

export function SignInScreen({ onSignIn, onBack, onNavigateToOnboarding, onRequirePayment }: SignInScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const { customerInfo } = usePurchases();
  
  // Check if we're running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  // Configure Google Sign-In only if not in Expo Go
  React.useEffect(() => {
    if (!isExpoGo) {
      import('@react-native-google-signin/google-signin').then(({ GoogleSignin }) => {
        GoogleSignin.configure({
          scopes: ['email', 'profile'],
          iosClientId: '338047674329-5dfpj06alfpfn0phi57c4bgdg6nihv87.apps.googleusercontent.com',
        });
      }).catch(() => {
        // Intentionally no logs
      });
    }
  }, [isExpoGo]);

  const handlePostAuthentication = async (userId: string) => {
    try {
      await setUserId(userId);
      const { user } = await fetchUserById(userId);
      console.log('user', user);

      if (!user) {
        hapticFeedback.error();
        if (onNavigateToOnboarding) onNavigateToOnboarding();
        else onSignIn();
        return;
      }
      await Purchases.logIn(userId);
      console.log('|||||||||||||||| customerInfo', customerInfo);
      if (requiresOnboarding(user)) {
        hapticFeedback.error();
        await removeUserId();
        if (onNavigateToOnboarding) onNavigateToOnboarding();
        else onSignIn();
        return;
      }
      if (customerInfo?.activeSubscriptions.length === 0) {
        hapticFeedback.success();
        if (onRequirePayment) onRequirePayment();
        else onSignIn();
        return;
      }

      onSignIn();
    } catch {
      onSignIn();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      hapticFeedback.selection();
      if (isExpoGo) return;
      
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
          setIsSigningIn(false);
        } else if (data.user?.id) {
          await handlePostAuthentication(data.user.id);
          setIsSigningIn(false);
        } else {
          setIsSigningIn(false);
          onSignIn();
        }
      } else {
        setIsSigningIn(false);
      }
    } catch (error: any) {
      setIsSigningIn(false);
      // Swallow non-critical codes like user cancellation
    }
  };

  const handleAppleSignIn = async () => {
    try {
      hapticFeedback.selection();
      setIsSigningIn(true);
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
          setIsSigningIn(false);
        } else if (data.user?.id) {
          await handlePostAuthentication(data.user.id);
          setIsSigningIn(false);
        } else {
          setIsSigningIn(false);
          onSignIn();
        }
      } else {
        setIsSigningIn(false);
      }
    } catch {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Header with back button and title */}
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <Text style={[
          styles.mainTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {i18n.t('signIn')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main content */}
      <View style={styles.contentWrapper}>
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
              onPress={handleGoogleSignIn}
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
                  {i18n.t('onboarding.createAccount.signInWithGoogle')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Don't have an account text */}
            <View style={styles.noAccountContainer}>
              <Text style={[
                styles.noAccountText,
                { color: isDark ? '#8E8E93' : '#8E8E93' }
              ]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => {
                hapticFeedback.selection();
                onNavigateToOnboarding?.()
              }}>
                <Text style={[
                  styles.startTodayLink,
                  { color: isDark ? '#007AFF' : '#007AFF' }
                ]}>
                  Start today
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <LoadingOverlay visible={isSigningIn} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 20,
    height: 80,
  },
  headerSpacer: {
    width: 40,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
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
  noAccountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  startTodayLink: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textDecorationLine: 'underline',
  },
}); 