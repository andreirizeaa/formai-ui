import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { supabase } from '../../../lib/supabase';
import { LoadingOverlay } from '../overlays/LoadingOverlay';
import { removeUserId, setUserId } from '../../../services/storageService';
import { fetchUserById, requiresOnboarding } from '../../../services/userService';
import { usePurchases } from '../../../context/PurchasesContext';
import { identify, track } from '../../../services/analytics';
import { registerAndSaveExpoPushToken } from '../../../services/push';
import { showAlert } from '../../../services/alertService';
import * as Linking from 'expo-linking';
import { X } from 'lucide-react-native';

const { height: screenHeight } = Dimensions.get('window');

interface WelcomeScreenSignInProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onNavigateToOnboarding?: () => void;
  onRequirePayment?: () => void;
}

export function WelcomeScreenSignIn({ 
  visible, 
  onClose, 
  onSignIn, 
  onNavigateToOnboarding, 
  onRequirePayment 
}: WelcomeScreenSignInProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const { hasSubscription, logIn } = usePurchases();
  
  // Animation values - similar to feedback slideshow
  const slideAnim = React.useRef(new Animated.Value(screenHeight)).current; // Start off-screen
  
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

  // Handle slide-in animation when visible prop changes
  React.useEffect(() => {
    if (visible && !isVisible) {
      setIsVisible(true);
      setIsAnimatingOut(false);
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to visible position
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, isVisible, slideAnim]);

  const handlePostAuthentication = async (userId: string) => {
    try {
      await setUserId(userId);
      const { user } = await fetchUserById(userId);
      if (!user) {
        hapticFeedback.error();
        if (onNavigateToOnboarding) onNavigateToOnboarding();
        else onSignIn();
        return;
      }
      await logIn(userId);

      // Link anonymous analytics events to the user
      identify(userId);

      // Track sign-in completion
      track('Sign In Completed', {
        user_id: userId,
      });

      // Ensure push token is registered for signed-in users
      await registerAndSaveExpoPushToken(userId);
      if (requiresOnboarding(user)) {
        hapticFeedback.error();
        await removeUserId();
        if (onNavigateToOnboarding) onNavigateToOnboarding();
        else onSignIn();
        return;
      }
      if (!hasSubscription) {
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

  const handleClose = (withHaptic = true) => {
    if (withHaptic) {
      hapticFeedback.selection();
    }
    setIsAnimatingOut(true);
    // Animate slide down before closing
    Animated.timing(slideAnim, {
      toValue: screenHeight, // Slide off-screen
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  const handleTermsOfServicePress = async () => {
    hapticFeedback.selection();
    // Track sign in screen clicks
    track('Sign In Screen clicks', { event: 'Terms' });
    // Small delay to ensure haptic feedback is felt before opening browser
    setTimeout(async () => {
      try {
        await Linking.openURL('https://useformai.com/legal/tos');
      } catch (error) {
        showAlert('Error', 'Unable to open terms of use. Please try again later.');
      }
    }, 100);
  };

  const handlePrivacyPolicyPress = async () => {
    hapticFeedback.selection();
    // Track sign in screen clicks
    track('Sign In Screen clicks', { event: 'Privacy' });
    // Small delay to ensure haptic feedback is felt before opening browser
    setTimeout(async () => {
      try {
        await Linking.openURL('https://useformai.com/legal/privacy');
      } catch (error) {
        showAlert('Error', 'Unable to open privacy policy. Please try again later.');
      }
    }, 100);
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={styles.overlayBackground} 
        activeOpacity={1} 
        onPress={() => handleClose(false)}
      />
      
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header with title and close button */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.mainTitle}>
            {i18n.t('signIn')}
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => handleClose(true)}
            activeOpacity={0.7}
          >
            <X width={20} height={20} color="#000000" />
          </TouchableOpacity>
        </View>
        
        {/* Divider under title */}
        <View style={styles.divider} />

        {/* Main content */}
        <View style={styles.contentWrapper}>
          {/* Button container with flex to center buttons */}
          <View style={styles.buttonWrapper}>
            {/* Sign in buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.appleButton}
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Image 
                    source={require('../../../../assets/icons/apple.png')}
                    style={styles.appleIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.appleButtonText}>
                    {i18n.t('onboarding.createAccount.signInWithApple')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign in with Google */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <Image 
                    source={require('../../../../assets/icons/google.png')}
                    style={styles.googleIcon}
                    contentFit="contain"
                  />

                  <Text style={styles.googleButtonText}>
                    {i18n.t('onboarding.createAccount.signInWithGoogle')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Terms and Privacy Policy */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  {i18n.t('termsAgreement')}{' '}
                </Text>
                <TouchableOpacity onPress={handleTermsOfServicePress}>
                  <Text style={styles.termsLink}>
                    {i18n.t('termsOfUse')}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  {i18n.t('and')}{' '}
                </Text>
                <TouchableOpacity onPress={handlePrivacyPolicyPress}>
                  <Text style={styles.termsLink}>
                    {i18n.t('privacyPolicy')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        {/* Custom loading overlay for modal only */}
        {isSigningIn && (
          <View style={styles.modalLoadingOverlay}>
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent', // Invisible overlay for tap detection
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: screenHeight * 0.4, // 40% of screen height
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 10,
    height: 70,
  },
  headerSpacer: {
    width: 32,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: 'none',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 0.3,
    backgroundColor: '#000000',
    width: '100%',
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
    paddingHorizontal: 20,
  },
  appleButton: {
    width: '90%',
    height: 65,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  googleButton: {
    width: '90%',
    height: 65,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
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
    tintColor: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    color: '#000000',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    color: '#8E8E93',
    textAlign: 'center',
  },
  termsLink: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    color: '#000000',
    textDecorationLine: 'underline',
  },
  modalLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  modalLoadingContainer: {
    width: 85,
    height: 85,
    borderRadius: 18,
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
