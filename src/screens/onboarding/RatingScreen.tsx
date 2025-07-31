import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import * as StoreReview from 'expo-store-review';

interface RatingScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function RatingScreen({ onNext, onBack }: RatingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const handleRateFormAI = async () => {
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
          Skip
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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Star Rating Section */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            <Text style={styles.starEmoji}>⭐⭐⭐⭐⭐</Text>
          </View>
        </View>

        {/* Testimonial Card */}
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
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    alignItems: 'center',
  },
  starEmoji: {
    fontSize: 48,
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
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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