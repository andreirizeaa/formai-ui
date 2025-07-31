import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';

interface WorkoutsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function WorkoutsScreen({ onNext, onBack }: WorkoutsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const workoutOptions = [
    { key: '0', label: i18n.t('workouts.zero') },
    { key: '1-3', label: i18n.t('workouts.oneToThree') },
    { key: '3-5', label: i18n.t('workouts.threeToFive') },
    { key: '5-7', label: i18n.t('workouts.fiveToSeven') },
  ] as const;

  const handleWorkoutSelect = (workoutFrequency: '0' | '1-3' | '3-5' | '5-7') => {
    updatePreference('workoutsPerWeek', workoutFrequency);
  };

  const handleNext = () => {
    if (preferences.workoutsPerWeek) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('workouts.title')}
      subtitle={i18n.t('workouts.subtitle')}
      currentStep={3}
      totalSteps={10}
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
        {workoutOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.workoutButton,
              {
                backgroundColor: preferences.workoutsPerWeek === option.key
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.workoutsPerWeek === option.key
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleWorkoutSelect(option.key)}
            activeOpacity={0.7}
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
    justifyContent: 'center',
    gap: 12,
  },
  workoutButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
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