import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface GenderScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function GenderScreen({ onNext, onBack }: GenderScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const genderOptions = [
    { key: 'male', label: i18n.t('gender.male') },
    { key: 'female', label: i18n.t('gender.female') },
  ] as const;

  const handleGenderSelect = (gender: 'male' | 'female' | 'other') => {
    hapticFeedback.selection();
    updatePreference('gender', gender);
  };

  const handleNext = () => {
    if (preferences.gender) {
      hapticFeedback.next();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('gender.title')}
      subtitle={i18n.t('gender.subtitle')}
      currentStep={2}
      totalSteps={12}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.gender}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        scrollIndicatorInsets={{ right: 1 }}
        indicatorStyle={isDark ? 'white' : 'black'}
        bounces={true}
        alwaysBounceVertical={false}
        nestedScrollEnabled={true}
        fadingEdgeLength={Platform.OS === 'android' ? 50 : 0}
      >
        {genderOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.genderButton,
              {
                backgroundColor: preferences.gender === option.key
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.gender === option.key
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleGenderSelect(option.key)}
            activeOpacity={0.7}
          >
            <View style={styles.genderContent}>
              <Text 
                style={[
                  styles.genderLabel,
                  { 
                    color: preferences.gender === option.key
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
    justifyContent: 'center', // Center the buttons vertically when they fit
    paddingVertical: 20,
    gap: 12,
  },
  genderButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  genderContent: {
    alignItems: 'center',
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
});