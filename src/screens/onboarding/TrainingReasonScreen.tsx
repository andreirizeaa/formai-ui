import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface TrainingReasonScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function TrainingReasonScreen({ onNext, onBack }: TrainingReasonScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const trainingReasonOptions = [
    { key: 'build_strength', label: i18n.t('trainingReason.buildStrength') },
    { key: 'improve_physique', label: i18n.t('trainingReason.improvePhysique') },
    { key: 'prevent_injury', label: i18n.t('trainingReason.preventInjury') },
    { key: 'train_for_sport', label: i18n.t('trainingReason.trainForSport') },
    { key: 'stay_active_healthy', label: i18n.t('trainingReason.stayActiveHealthy') },
  ] as const;

  const handleTrainingReasonSelect = (reason: 'build_strength' | 'improve_physique' | 'prevent_injury' | 'train_for_sport' | 'stay_active_healthy') => {
    hapticFeedback.selection();
    updatePreference('trainingReason', reason);
  };

  const handleNext = () => {
    if (preferences.trainingReason) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('trainingReason.title')}
      subtitle={i18n.t('trainingReason.subtitle')}
      currentStep={5}
      totalSteps={18}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.trainingReason}
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
        {trainingReasonOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleTrainingReasonSelect(option.key)}
            isSelected={preferences.trainingReason === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.trainingReasonContent}>
              <Text 
                style={[
                  styles.trainingReasonLabel,
                  { 
                    color: preferences.trainingReason === option.key
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
  trainingReasonContent: {
    alignItems: 'center',
  },
  trainingReasonLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 