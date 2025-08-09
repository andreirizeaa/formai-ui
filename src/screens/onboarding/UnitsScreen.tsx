import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface UnitsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function UnitsScreen({ onNext, onBack }: UnitsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const unitOptions = [
    { 
      key: 'metric', 
      label: i18n.t('units.metric'),
      description: i18n.t('units.metricDescription')
    },
    { 
      key: 'imperial', 
      label: i18n.t('units.imperial'),
      description: i18n.t('units.imperialDescription')
    },
  ] as const;

  const handleUnitSelect = (unitSystem: 'metric' | 'imperial') => {
    hapticFeedback.selection();
    updatePreference('unitSystem', unitSystem);
  };

  const handleNext = () => {
    if (preferences.unitSystem) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('units.title')}
      subtitle={i18n.t('units.subtitle')}
      currentStep={2}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.unitSystem}
    >
      <View style={styles.container}>
        {unitOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleUnitSelect(option.key)}
            isSelected={preferences.unitSystem === option.key}
            isDark={isDark}
            delay={index * 100}
            style={styles.unitButton}
          >
            <View style={styles.unitContent}>
              <Text 
                style={[
                  styles.unitName,
                  { 
                    color: preferences.unitSystem === option.key
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {option.label}
              </Text>
              <Text style={[
                styles.unitDescription,
                { 
                  color: preferences.unitSystem === option.key
                    ? '#FFFFFF'  // White text when selected
                    : '#9CA3AF',
                }
              ]}>
                {option.description}
              </Text>
            </View>
          </AnimatedOptionButton>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  unitButton: {
    minHeight: 80,
    justifyContent: 'center',
  },
  unitContent: {
    alignItems: 'center',
  },
  unitName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 