import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface LifterTypeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function LifterTypeScreen({ onNext, onBack }: LifterTypeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const lifterTypeOptions = [
    { key: 'beginner', label: i18n.t('lifterType.beginner') },
    { key: 'intermediate', label: i18n.t('lifterType.intermediate') },
    { key: 'advanced', label: i18n.t('lifterType.advanced') },
    { key: 'returning_after_break', label: i18n.t('lifterType.returningAfterBreak') },
    { key: 'injury_rehab', label: i18n.t('lifterType.injuryRehab') },
  ] as const;

  const handleLifterTypeSelect = (type: 'beginner' | 'intermediate' | 'advanced' | 'returning_after_break' | 'injury_rehab') => {
    hapticFeedback.selection();
    updatePreference('lifterType', type);
  };

  const handleNext = () => {
    if (preferences.lifterType) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('lifterType.title')}
      subtitle={i18n.t('lifterType.subtitle')}
      currentStep={8}
      totalSteps={18}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.lifterType}
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
        {lifterTypeOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleLifterTypeSelect(option.key)}
            isSelected={preferences.lifterType === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.lifterTypeContent}>
              <Text 
                style={[
                  styles.lifterTypeLabel,
                  { 
                    color: preferences.lifterType === option.key
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
  lifterTypeContent: {
    alignItems: 'flex-start',
  },
  lifterTypeLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 