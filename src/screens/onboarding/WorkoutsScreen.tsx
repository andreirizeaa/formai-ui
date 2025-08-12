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
    { key: '1-2', label: i18n.t('workouts.oneToTwo') },
    { key: '3-4', label: i18n.t('workouts.threeToFour') },
    { key: '5-6', label: i18n.t('workouts.fiveToSix') },
    { key: 'every_day', label: i18n.t('workouts.everyDay') },
    { key: 'it_varies', label: i18n.t('workouts.itVaries') },
  ] as const;

  const handleWorkoutSelect = (workoutFrequency: '1-2' | '3-4' | '5-6' | 'every_day' | 'it_varies') => {
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
      currentStep={7}
      totalSteps={18}
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
                  styles.workoutLabel,
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
    alignItems: 'center',
  },
  workoutLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 