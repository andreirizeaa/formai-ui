import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface FormConfidenceScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function FormConfidenceScreen({ onNext, onBack }: FormConfidenceScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const formConfidenceOptions = [
    { key: '0-25', label: i18n.t('formConfidence.zeroToTwentyFive') },
    { key: '25-50', label: i18n.t('formConfidence.twentyFiveToFifty') },
    { key: '50-75', label: i18n.t('formConfidence.fiftyToSeventyFive') },
    { key: '75-100', label: i18n.t('formConfidence.seventyFiveToHundred') },
  ] as const;

  const handleFormConfidenceSelect = (confidence: '0-25' | '25-50' | '50-75' | '75-100') => {
    hapticFeedback.selection();
    updatePreference('formConfidence', confidence);
  };

  const handleNext = () => {
    if (preferences.formConfidence) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('formConfidence.title')}
      subtitle={i18n.t('formConfidence.subtitle')}
      currentStep={10}
      totalSteps={18}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.formConfidence}
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
        {formConfidenceOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleFormConfidenceSelect(option.key)}
            isSelected={preferences.formConfidence === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.formConfidenceContent}>
              <Text 
                style={[
                  styles.formConfidenceLabel,
                  { 
                    color: preferences.formConfidence === option.key
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
    justifyContent: 'center',
    gap: 12,
  },
  formConfidenceContent: {
    alignItems: 'center',
  },
  formConfidenceLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 