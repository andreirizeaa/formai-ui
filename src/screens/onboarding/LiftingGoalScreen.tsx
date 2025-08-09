import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface LiftingGoalScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function LiftingGoalScreen({ onNext, onBack }: LiftingGoalScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const liftingGoalOptions = [
    { key: 'muscle_building', label: i18n.t('liftingGoal.muscleBuilding') },
    { key: 'powerlifting', label: i18n.t('liftingGoal.powerlifting') },
    { key: 'toning', label: i18n.t('liftingGoal.toning') },
    { key: 'strength', label: i18n.t('liftingGoal.strength') },
    { key: 'weight_loss', label: i18n.t('liftingGoal.weightLoss') },
  ] as const;

  const handleLiftingGoalSelect = (goal: 'muscle_building' | 'powerlifting' | 'toning' | 'strength' | 'weight_loss') => {
    hapticFeedback.selection();
    updatePreference('liftingGoal', goal);
  };

  const handleNext = () => {
    if (preferences.liftingGoal) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('liftingGoal.title')}
      subtitle={i18n.t('liftingGoal.subtitle')}
      currentStep={10}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.liftingGoal}
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
        {liftingGoalOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleLiftingGoalSelect(option.key)}
            isSelected={preferences.liftingGoal === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.liftingGoalContent}>
              <Text 
                style={[
                  styles.liftingGoalLabel,
                  { 
                    color: preferences.liftingGoal === option.key
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
  liftingGoalContent: {
    alignItems: 'center',
  },
  liftingGoalLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 