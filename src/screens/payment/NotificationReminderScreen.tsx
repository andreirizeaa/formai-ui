import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BackButton } from '../../components/ui/BackButton';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { useOnboarding } from '../../context/OnboardingContext';

interface NotificationReminderScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Bell Icon Component
function BellIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NotificationReminderScreen({ onNext, onBack }: NotificationReminderScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const { preferences, updatePreference, getOnboardingDataForAPI } = useOnboarding();

  // Shake animation effect
  useEffect(() => {
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    // Repeat the shake sequence continuously for 2 seconds
    const repeatShake = Animated.loop(
      shakeSequence,
      { iterations: 8 } // 8 iterations * 400ms = 3.2 seconds, but we'll stop after 2 seconds
    );

    repeatShake.start();

    // Stop the animation after 2 seconds
    const timer = setTimeout(() => {
      repeatShake.stop();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const shakeInterpolate = shakeAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  // Handle notification reminder completion
  const handleNotificationReminderComplete = () => {
    const now = new Date();
    const startDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Calculate trial end date (3 days from now)
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + 3);
    const trialEndDateString = trialEndDate.toISOString().split('T')[0];
    
    // Update subscription preferences for notification reminder flow
    updatePreference('subscriptionPlan', 'yearly'); // Notification reminder is for yearly plan
    updatePreference('subscriptionActive', false); // Not active until payment
    updatePreference('subscriptionCost', 39.99);
    updatePreference('freeTrialActive', true);
    updatePreference('freeTrialStartDate', startDate);
    updatePreference('freeTrialEndDate', trialEndDateString);
    
    // Continue to next screen
    onNext();
  };

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <BackButton onPress={onBack} />
      </View>

      {/* Main content */}
      <View style={styles.contentWrapper}>
        <View style={styles.centeredContent}>
          {/* Main Title */}
          <Text style={[
            styles.mainTitle,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {i18n.t('notificationReminder.title')}
          </Text>

          {/* Bell Icon */}
          <View style={styles.bellContainer}>
            <Animated.View 
              style={[
                styles.bellIcon,
                {
                  transform: [
                    { rotate: shakeInterpolate },
                    { rotate: '15deg' } // Keep the original 15deg rotation
                  ]
                }
              ]}
            >
              <BellIcon 
                color={isDark ? '#8E8E93' : '#8E8E93'} 
                size={160}
              />
              {/* Notification Badge */}
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.buttonContainer}>
        {/* No Payment Due Text */}
        <View style={styles.noPaymentContainer}>
          <Text style={[
            styles.checkmark,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            ✓
          </Text>
          <Text style={[
            styles.noPaymentText,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {i18n.t('notificationReminder.noPaymentDue')}
          </Text>
        </View>

        {/* Continue for Free Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
          ]}
          onPress={() => {
            hapticFeedback.selection();
            handleNotificationReminderComplete();
          }}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.continueButtonText,
            { color: isDark ? '#000000' : '#FFFFFF' }
          ]}>
            {i18n.t('notificationReminder.continueForFree')}
          </Text>
        </TouchableOpacity>

        {/* Pricing Text */}
        <Text style={[
          styles.pricingText,
          { color: isDark ? '#8E8E93' : '#8E8E93' }
        ]}>
          {i18n.t('notificationReminder.pricing')}
        </Text>
      </View>
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
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 20,
    height: 64,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 100,
    lineHeight: 36,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  bellContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  bellIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '15deg' }],
  },
  notificationBadge: {
    position: 'absolute',
    top: -32,
    right: -32,
    backgroundColor: '#FF3B30',
    borderRadius: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  noPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  noPaymentText: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  pricingText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 