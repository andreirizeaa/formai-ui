import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingOverlay } from '../../components/ui/overlays/LoadingOverlay';
import { supabase } from '../../lib/supabase';
import { showAlert } from '../../services/alertService';
import { hapticFeedback } from '../../utils/haptic';
import i18n from '../../utils/i18n';

interface EmailSignInProps {
  mode: 'signIn' | 'signUp';
  onBack: () => void;
  onVerifiedUserId: (userId: string, onComplete?: () => void) => void;
}

type Step = 'email' | 'otp';

function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

function isValidPassword(value: string): boolean {
  if (!value || value.length < 9) return false;
  const hasUppercase = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  return hasUppercase && hasNumber && hasSymbol;
}

export function EmailSignIn({ mode, onBack, onVerifiedUserId }: EmailSignInProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>('email');

  // OTP
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const hiddenOtpInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // Keyboard accessory animation (matches EditNameScreen behavior)
  const accessoryBottom = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const GAP_ADJUSTMENT = 36;

  const titleText = useMemo(
    () =>
      mode === 'signIn'
        ? i18n.t('signIn') || 'Sign In'
        : i18n.t('onboarding.createAccount.title') || 'Create an account',
    [mode]
  );

  const maskedEmail = useMemo(() => maskEmail(email), [email]);

  useEffect(() => {
    const showSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillShow', (e) => {
            const height = e.endCoordinates?.height ?? 0;
            Animated.timing(accessoryBottom, {
              toValue: Math.max(height - insets.bottom + GAP_ADJUSTMENT, 0),
              duration: e.duration ?? 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start();
          })
        : Keyboard.addListener('keyboardDidShow', (e) => {
            const height = e.endCoordinates?.height ?? 0;
            Animated.timing(accessoryBottom, {
              toValue: Math.max(height + GAP_ADJUSTMENT, 0),
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start();
          });

    const hideSub =
      Platform.OS === 'ios'
        ? Keyboard.addListener('keyboardWillHide', (e) => {
            Animated.timing(accessoryBottom, {
              toValue: 0,
              duration: e.duration ?? 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start();
          })
        : Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(accessoryBottom, {
              toValue: 0,
              duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start();
          });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [accessoryBottom, insets.bottom]);

  // Autofocus email input instantly when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (step === 'email') {
        // Focus immediately when screen is focused
        emailInputRef.current?.focus();
      }
    }, [step])
  );

  // Autofocus hidden OTP input on step change
  useEffect(() => {
    if (step === 'otp') {
      // Delay slightly to ensure layout is ready
      const task = InteractionManager.runAfterInteractions(() => {
        setTimeout(() => hiddenOtpInputRef.current?.focus(), 250);
      });
      return () => task?.cancel?.();
    }
  }, [step]);

  // Note: We don't reset step in useFocusEffect because it interferes with normal step transitions.
  // The step is already reset to 'email' after successful OTP verification in handleOtpChange.

  // Resend timer
  useEffect(() => {
    if (step !== 'otp') return;
    setCanResend(false);
    setResendSeconds(60);
    const interval = setInterval(() => {
      setResendSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleContinue = useCallback(async () => {
    if (isSubmitting) return;
    hapticFeedback.selection();
    // Validate email
    if (!isValidEmail(email)) {
      setEmailError(i18n.t('emailAuth.invalidEmail') || 'Please enter a valid email address.');
      return;
    }
    // Validate password
    if (!isValidPassword(password)) {
      setPasswordError(
        i18n.t('passwordInvalid') ||
          'Password must be 9+ chars, include uppercase, number and symbol.'
      );
      // Shift focus to password if not already there
      setFocusedField('password');
      passwordInputRef.current?.focus();
      return;
    }
    setEmailError(null);
    setPasswordError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'signIn') {
        // Existing user sign-in: use password (no OTP)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error || !data.user?.id) {
          setPasswordError(i18n.t('incorrectEmailOrPassword') || 'Incorrect email or password.');
          setIsSubmitting(false);
          setFocusedField('password');
          passwordInputRef.current?.focus();
          return;
        }
        hapticFeedback.success();
        // Keep loading until navigation happens
        onVerifiedUserId(data.user.id, () => {
          setIsSubmitting(false);
        });
        return;
      } else {
        // First-time (sign-up) flow: send OTP and verify, then set password
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: true, // allow sign up
            emailRedirectTo: undefined,
          },
        });
        if (error) {
          showAlert('Error', error.message || 'Unable to send code. Please try again.');
          setIsSubmitting(false);
          return;
        }
        setStep('otp');
        // Keep loading for a brief moment to ensure smooth transition to OTP screen
        setTimeout(() => {
          setIsSubmitting(false);
        }, 300);
      }
    } catch (e: any) {
      showAlert('Error', 'Unable to send code. Please try again.');
      setIsSubmitting(false);
    }
  }, [email, password, isSubmitting, onVerifiedUserId, mode]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    hapticFeedback.selection();
    try {
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      setCanResend(false);
      setResendSeconds(60);
    } catch {
      // Silent fail; user can try again
    }
  }, [canResend, email]);

  const handleOtpChange = useCallback(
    async (value: string) => {
      const sanitized = value.replace(/[^0-9]/g, '').slice(0, 6);
      setOtp(sanitized);
      if (otpError) setOtpError(null);
      if (sanitized.length === 6) {
        try {
          setIsSubmitting(true);
          const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: sanitized,
            type: 'email',
          });
          if (error) {
            setOtpError(
              i18n.t('emailAuth.invalidCode') ||
                'The code you entered is invalid. Please try again.'
            );
            hapticFeedback.error();
            setOtp(''); // Clear OTP on error
            setIsSubmitting(false);
            // Refocus input so user can immediately start typing again
            setTimeout(() => {
              hiddenOtpInputRef.current?.focus();
            }, 100);
            return;
          }
          const userId =
            (data as any)?.user?.id ||
            (data as any)?.session?.user?.id ||
            (await supabase.auth.getUser()).data.user?.id;
          if (!userId) {
            setOtpError(
              i18n.t('emailAuth.invalidCode') ||
                'The code you entered is invalid. Please try again.'
            );
            setOtp(''); // Clear OTP on error
            setIsSubmitting(false);
            // Refocus input so user can immediately start typing again
            setTimeout(() => {
              hiddenOtpInputRef.current?.focus();
            }, 100);
            return;
          }
          // For sign-up: set password now so next login uses password without OTP
          if (mode === 'signUp') {
            try {
              await supabase.auth.updateUser({ password });
            } catch {
              // Non-fatal: continue flow even if password update fails
            }
          }
          hapticFeedback.success();
          // Keep loading until navigation/alert is handled
          // Don't reset to email step yet - keep on OTP screen for alert if needed
          // Pass callback to reset after navigation/alert is handled
          onVerifiedUserId(userId, () => {
            // Reset to email step after navigation/alert is complete
            setStep('email');
            setOtp('');
            setOtpError(null);
            setIsSubmitting(false); // Stop loading after navigation/alert
          });
        } catch {
          setOtpError(
            i18n.t('emailAuth.invalidCode') || 'The code you entered is invalid. Please try again.'
          );
          setOtp(''); // Clear OTP on error
          setIsSubmitting(false);
          // Refocus input so user can immediately start typing again
          setTimeout(() => {
            hiddenOtpInputRef.current?.focus();
          }, 100);
        }
      }
    },
    [email, otpError, onVerifiedUserId]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            hapticFeedback.selection();
            if (step === 'otp') {
              setStep('email');
              setOtp('');
              setOtpError(null);
            } else {
              onBack();
            }
          }}
        >
          <ChevronLeft width={24} height={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titleText}</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {step === 'email' ? (
          <View style={styles.content}>
            {/* Email input box */}
            <View style={styles.inputBackground}>
              <View style={{ width: '100%' }}>
                <Text style={styles.label}>
                  {i18n.t('emailAuth.emailAddress') || 'Email address'}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    emailError ? styles.inputContainerError : undefined,
                  ]}
                >
                  <TextInput
                    ref={emailInputRef}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (emailError) setEmailError(null);
                    }}
                    style={styles.input}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    returnKeyType="next"
                    autoFocus
                    onFocus={() => setFocusedField('email')}
                    onSubmitEditing={() => {
                      setFocusedField('password');
                      passwordInputRef.current?.focus();
                    }}
                  />
                </View>
                {emailError && <Text style={styles.errorText}>{emailError}</Text>}
              </View>
            </View>

            {/* Password input box */}
            <View style={[styles.inputBackground, { marginTop: 24 }]}>
              <View style={{ width: '100%' }}>
                <Text style={styles.label}>{i18n.t('password') || 'Password'}</Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordError ? styles.inputContainerError : undefined,
                  ]}
                >
                  <TextInput
                    ref={passwordInputRef}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (passwordError) setPasswordError(null);
                    }}
                    style={styles.input}
                    autoCorrect={false}
                    autoCapitalize="none"
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    autoComplete="password"
                    returnKeyType="done"
                    onFocus={() => setFocusedField('password')}
                    onSubmitEditing={() => {
                      // Attempt submit when password is focused
                      handleContinue();
                    }}
                  />
                  <TouchableOpacity
                    style={styles.visibilityButton}
                    onPress={() => {
                      hapticFeedback.selection();
                      setShowPassword(!showPassword);
                    }}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff width={20} height={20} color="#6B7280" />
                    ) : (
                      <Eye width={20} height={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.otpTitle}>
              {i18n.t('emailAuth.confirmTitle') || 'Confirm your email'}
            </Text>
            <Text style={styles.otpSubtitle}>
              {(() => {
                const instructionText =
                  i18n.t('emailAuth.codeInstructions', { email: maskedEmail }) ||
                  `Please enter the 6-digit code we've just sent to ${maskedEmail}`;
                const parts = instructionText.split(maskedEmail);
                if (parts.length === 2) {
                  return (
                    <>
                      {parts[0]}
                      <Text style={styles.maskedEmailBold}>{maskedEmail}</Text>
                      {parts[1]}
                    </>
                  );
                }
                return instructionText;
              })()}
            </Text>

            {/* Hidden input captures the digits */}
            <TextInput
              ref={hiddenOtpInputRef}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              style={styles.hiddenOtpInput}
              autoFocus
            />

            <View style={styles.otpBoxesRow}>
              {Array.from({ length: 6 }).map((_, i) => {
                const char = otp[i] ?? '';
                const isActive = i === otp.length; // Current input position
                const hasValue = char !== '';
                const shouldHighlight = isActive || hasValue;
                return (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      shouldHighlight && !otpError && styles.otpBoxActive,
                      otpError && styles.otpBoxError,
                    ]}
                  >
                    <Text style={styles.otpChar}>{char}</Text>
                  </View>
                );
              })}
            </View>

            {otpError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{otpError}</Text>
              </View>
            )}

            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>{i18n.t('emailAuth.resend') || 'Resend'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.resendCountdown}>
                  {i18n.t('emailAuth.resendIn', { seconds: resendSeconds }) ||
                    `You can resend in ${resendSeconds} seconds`}
                </Text>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Keyboard Accessory */}
      {step === 'email' && (
        <Animated.View style={[styles.keyboardAccessoryView, { bottom: accessoryBottom }]}>
          {(() => {
            const emailValid = isValidEmail(email);
            const passwordValid = isValidPassword(password);
            const isOnPassword = focusedField === 'password';
            const isDisabled =
              isSubmitting ||
              (!isOnPassword && !emailValid) ||
              (isOnPassword && (!emailValid || !passwordValid));

            const handleAccessoryPress = () => {
              if (!isOnPassword) {
                // Move focus to password
                setFocusedField('password');
                passwordInputRef.current?.focus();
                return;
              }
              // Attempt to continue when on password field
              handleContinue();
            };

            return (
              <TouchableOpacity
                style={[styles.primaryButton, isDisabled && styles.primaryButtonDisabled]}
                onPress={handleAccessoryPress}
                activeOpacity={0.7}
                disabled={isDisabled}
              >
                <Text
                  style={[styles.primaryButtonText, isDisabled && styles.primaryButtonTextDisabled]}
                >
                  {isOnPassword ? 'Complete' : i18n.t('next') || 'Next'}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </Animated.View>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay visible={isSubmitting} />
    </SafeAreaView>
  );
}

function maskEmail(value: string): string {
  const [local, domain] = value.split('@');
  if (!local || !domain) return value;
  const visible = local.slice(0, 2);
  const hidden = '•'.repeat(Math.max(local.length - 2, 0));
  return `${visible}${hidden}@${domain}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  kav: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  inputBackground: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#F0F0F0',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  inputContainerError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
    marginTop: 6,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: 'transparent',
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingRight: 8,
  },
  visibilityButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
  },
  keyboardAccessoryView: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  primaryButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // OTP step
  otpTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 10,
  },
  otpSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  maskedEmailBold: {
    fontWeight: '700',
    color: '#000000',
  },
  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 0,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    maxWidth: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.4,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  otpBoxActive: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  otpBoxError: {
    borderColor: '#FF3B30',
  },
  otpChar: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  resendContainer: {
    marginTop: 22,
    alignItems: 'center',
  },
  resendLink: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  resendCountdown: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});
