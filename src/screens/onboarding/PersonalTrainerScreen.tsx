import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
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
    if (preferences.hasPersonalTrainer !== null) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('personalTrainer.title')}
      subtitle={i18n.t('personalTrainer.subtitle')}
      currentStep={5}
      totalSteps={12}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={preferences.hasPersonalTrainer === null}
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
        {trainerOptions.map((option) => (
          <TouchableOpacity
            key={option.key.toString()}
            style={[
              styles.trainerButton,
              {
                backgroundColor: preferences.hasPersonalTrainer === option.key
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.hasPersonalTrainer === option.key
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleTrainerSelect(option.key)}
            activeOpacity={0.7}
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
  trainerButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
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