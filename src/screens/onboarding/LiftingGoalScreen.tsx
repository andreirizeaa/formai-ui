import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
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
        {liftingGoalOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.liftingGoalButton,
              {
                backgroundColor: preferences.liftingGoal === option.key
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.liftingGoal === option.key
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleLiftingGoalSelect(option.key)}
            activeOpacity={0.7}
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
  liftingGoalButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  liftingGoalContent: {
    alignItems: 'center',
  },
  liftingGoalLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 