import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface PerfectFormGoalScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function PerfectFormGoalScreen({ onNext, onBack }: PerfectFormGoalScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const perfectFormGoalOptions = [
    { key: 'lift_heavier_safely', label: i18n.t('perfectFormGoal.liftHeavierSafely') },
    { key: 'build_muscle_efficiently', label: i18n.t('perfectFormGoal.buildMuscleEfficiently') },
    { key: 'avoid_injuries', label: i18n.t('perfectFormGoal.avoidInjuries') },
    { key: 'boost_confidence', label: i18n.t('perfectFormGoal.boostConfidence') },
    { key: 'train_longer_without_setbacks', label: i18n.t('perfectFormGoal.trainLongerWithoutSetbacks') },
  ] as const;

  const handlePerfectFormGoalSelect = (goal: 'lift_heavier_safely' | 'build_muscle_efficiently' | 'avoid_injuries' | 'boost_confidence' | 'train_longer_without_setbacks') => {
    hapticFeedback.selection();
    updatePreference('perfectFormGoal', goal);
  };

  const handleNext = () => {
    if (preferences.perfectFormGoal) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('perfectFormGoal.title')}
      subtitle={i18n.t('perfectFormGoal.subtitle')}
      currentStep={9}
      totalSteps={18}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.perfectFormGoal}
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
        {perfectFormGoalOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handlePerfectFormGoalSelect(option.key)}
            isSelected={preferences.perfectFormGoal === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.perfectFormGoalContent}>
              <Text 
                style={[
                  styles.perfectFormGoalLabel,
                  { 
                    color: preferences.perfectFormGoal === option.key
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
  perfectFormGoalContent: {
    alignItems: 'flex-start',
  },
  perfectFormGoalLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 