import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface ThreeMonthGoalScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function ThreeMonthGoalScreen({ onNext, onBack }: ThreeMonthGoalScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const threeMonthGoalOptions = [
    { key: 'lifting_heavier', label: i18n.t('threeMonthGoal.liftingHeavier') },
    { key: 'looking_leaner', label: i18n.t('threeMonthGoal.lookingLeaner') },
    { key: 'feeling_stronger_injury_free', label: i18n.t('threeMonthGoal.feelingStrongerInjuryFree') },
    { key: 'more_consistent', label: i18n.t('threeMonthGoal.moreConsistent') },
    { key: 'more_confident', label: i18n.t('threeMonthGoal.moreConfident') },
  ] as const;

  const handleThreeMonthGoalSelect = (goal: 'lifting_heavier' | 'looking_leaner' | 'feeling_stronger_injury_free' | 'more_consistent' | 'more_confident') => {
    hapticFeedback.selection();
    updatePreference('threeMonthGoal', goal);
  };

  const handleNext = () => {
    if (preferences.threeMonthGoal) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('threeMonthGoal.title')}
      subtitle={i18n.t('threeMonthGoal.subtitle')}
      currentStep={11}
      totalSteps={18}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.threeMonthGoal}
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
        {threeMonthGoalOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleThreeMonthGoalSelect(option.key)}
            isSelected={preferences.threeMonthGoal === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.threeMonthGoalContent}>
              <Text 
                style={[
                  styles.threeMonthGoalLabel,
                  { 
                    color: preferences.threeMonthGoal === option.key
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
  threeMonthGoalContent: {
    alignItems: 'flex-start',
  },
  threeMonthGoalLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 