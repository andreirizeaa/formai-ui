import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import * as StoreReview from 'expo-store-review';
import { hapticFeedback } from '../../utils/haptic';

interface RatingScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function RatingScreen({ onNext, onBack }: RatingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const handleRateFormAI = async () => {
    hapticFeedback.important();
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.log('Store review not available:', error);
    }
  };

  const handleSkip = () => {
    hapticFeedback.selection();
    // Save a default rating of 5 when skipped
    updatePreference('rating', 5);
    onNext();
  };

  const customButtons = (
    <View style={styles.customButtonsContainer}>
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.skipButtonText,
          { color: isDark ? '#AEAEB2' : '#8E8E93' }
        ]}>
          {i18n.t('rating.skip')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.rateButton,
          { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
        ]}
        onPress={handleRateFormAI}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.rateButtonText,
          { color: isDark ? '#000000' : '#FFFFFF' }
        ]}>
          Rate FormAI
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <OnboardingLayout
      title={i18n.t('rating.title')}
      subtitle={i18n.t('rating.subtitle')}
      currentStep={11}
      totalSteps={13}
      onBack={onBack}
      onNext={() => {}}
      nextTitle={i18n.t('next')}
      nextDisabled={true}
      customButtons={customButtons}
    >
      <View style={styles.container}>
        {/* Star Rating Section - positioned below subtitle */}
        <View style={styles.ratingContainer}>
          <View style={[
            styles.starsContainer,
            { borderColor: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            <Text style={styles.starEmoji}>⭐⭐⭐⭐⭐</Text>
          </View>
        </View>

        {/* Spacer to create gap in the middle */}
        <View style={styles.spacer} />

        {/* Centered text in the middle space */}
        <View style={styles.middleTextContainer}>
          <Text style={[
            styles.middleText,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {i18n.t('rating.middleText')}
          </Text>
        </View>

        {/* Testimonial Card - positioned above buttons */}
        <View style={[
          styles.testimonialCard,
          { backgroundColor: isDark ? 'rgba(28, 28, 30, 0.8)' : 'rgba(242, 242, 247, 0.8)' }
        ]}>
          <View style={styles.testimonialHeader}>
            <View style={styles.userInfo}>
              <View style={[
                styles.avatar,
                { backgroundColor: isDark ? '#3A3A3C' : '#D1D1D6' }
              ]}>
                <Text style={[
                  styles.avatarText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  MB
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[
                  styles.userName,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  Marley Bryle
                </Text>
                <View style={styles.userRating}>
                  <Text style={styles.testimonialStarEmoji}>⭐⭐⭐⭐⭐</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[
            styles.testimonialText,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            "I lost 15 lbs in 2 months! I was about to go on Ozempic but decided to give this app a shot and it worked :)"
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  starEmoji: {
    fontSize: 48,
  },
  spacer: {
    height: 40,
  },
  middleTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  middleText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '80%',
  },
  testimonialCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  testimonialHeader: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userRating: {
    flexDirection: 'row',
  },
  testimonialStarEmoji: {
    fontSize: 16,
  },
  testimonialText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  customButtonsContainer: {
    alignItems: 'center',
  },
  rateButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rateButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
}); 