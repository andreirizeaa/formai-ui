import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface WorkoutsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function WorkoutsScreen({ onNext, onBack }: WorkoutsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const workoutOptions = [
    { key: '0', label: i18n.t('workouts.zero'), subtitle: i18n.t('workouts.sedentary') },
    { key: '1-3', label: i18n.t('workouts.oneToThree'), subtitle: i18n.t('workouts.lightlyActive') },
    { key: '3-5', label: i18n.t('workouts.threeToFive'), subtitle: i18n.t('workouts.active') },
    { key: '5-7', label: i18n.t('workouts.fiveToSeven'), subtitle: i18n.t('workouts.dedicatedAthlete') },
  ] as const;

  const handleWorkoutSelect = (workoutFrequency: '0' | '1-3' | '3-5' | '5-7') => {
    hapticFeedback.selection();
    updatePreference('workoutsPerWeek', workoutFrequency);
  };

  const handleNext = () => {
    if (preferences.workoutsPerWeek) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('workouts.title')}
      subtitle={i18n.t('workouts.subtitle')}
      currentStep={4}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.workoutsPerWeek}
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
        {workoutOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleWorkoutSelect(option.key)}
            isSelected={preferences.workoutsPerWeek === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.workoutContent}>
              <Text 
                style={[
                  styles.workoutNumber,
                  { 
                    color: preferences.workoutsPerWeek === option.key
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {option.label}
              </Text>
              <Text 
                style={[
                  styles.workoutSubtitle,
                  { 
                    color: preferences.workoutsPerWeek === option.key
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {option.subtitle}
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
  workoutContent: {
    alignItems: 'flex-start',
  },
  workoutNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  workoutSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 8,
  },
}); 