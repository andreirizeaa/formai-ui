import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
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
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('gender.title')}
      subtitle={i18n.t('gender.subtitle')}
      currentStep={3}
      totalSteps={13}
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
        {genderOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleGenderSelect(option.key)}
            isSelected={preferences.gender === option.key}
            isDark={isDark}
            delay={index * 100}
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
          </AnimatedOptionButton>
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
  genderContent: {
    alignItems: 'center',
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
});