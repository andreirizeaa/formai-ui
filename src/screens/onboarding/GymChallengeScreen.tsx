import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface GymChallengeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function GymChallengeScreen({ onNext, onBack }: GymChallengeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const gymChallengeOptions = [
    { key: 'unsure_form', label: i18n.t('gymChallenge.unsureForm') },
    { key: 'no_results', label: i18n.t('gymChallenge.noResults') },
    { key: 'worried_injury', label: i18n.t('gymChallenge.worriedInjury') },
    { key: 'struggling_motivation', label: i18n.t('gymChallenge.strugglingMotivation') },
    { key: 'other', label: i18n.t('gymChallenge.other') },
  ] as const;

  const handleGymChallengeSelect = (challenge: 'unsure_form' | 'no_results' | 'worried_injury' | 'struggling_motivation' | 'other') => {
    hapticFeedback.selection();
    updatePreference('gymChallenge', challenge);
  };

  const handleNext = () => {
    if (preferences.gymChallenge) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('gymChallenge.title')}
      subtitle={i18n.t('gymChallenge.subtitle')}
      currentStep={6}
      totalSteps={18}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.gymChallenge}
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
        {gymChallengeOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleGymChallengeSelect(option.key)}
            isSelected={preferences.gymChallenge === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.gymChallengeContent}>
              <Text 
                style={[
                  styles.gymChallengeLabel,
                  { 
                    color: preferences.gymChallenge === option.key
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
  gymChallengeContent: {
    alignItems: 'flex-start',
  },
  gymChallengeLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 