import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface PersonalTrainerScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function PersonalTrainerScreen({ onNext, onBack }: PersonalTrainerScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const trainerOptions = [
    { key: true, label: i18n.t('personalTrainer.yes') },
    { key: false, label: i18n.t('personalTrainer.no') },
  ] as const;

  const handleTrainerSelect = (hasTrainer: boolean) => {
    hapticFeedback.selection();
    updatePreference('hasPersonalTrainer', hasTrainer);
  };

  const handleNext = () => {
    if (preferences.hasPersonalTrainer !== undefined) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('personalTrainer.title')}
      subtitle={i18n.t('personalTrainer.subtitle')}
      currentStep={9}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={preferences.hasPersonalTrainer === undefined}
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
        {trainerOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key.toString()}
            onPress={() => handleTrainerSelect(option.key)}
            isSelected={preferences.hasPersonalTrainer === option.key}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.trainerContent}>
              <Text 
                style={[
                  styles.trainerLabel,
                  { 
                    color: preferences.hasPersonalTrainer === option.key
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
  trainerContent: {
    alignItems: 'center',
  },
  trainerLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 