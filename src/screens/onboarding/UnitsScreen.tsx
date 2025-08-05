import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
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
        <TouchableOpacity
          style={[
            styles.unitButton,
            {
              backgroundColor: preferences.unitSystem === 'metric'
                ? '#000000'  // Black background when selected
                : 'transparent',
              borderColor: preferences.unitSystem === 'metric'
                ? '#000000'  // Black border when selected
                : (isDark ? '#2C2C2E' : '#E5E5EA'),
            }
          ]}
          onPress={() => handleUnitSelect('metric')}
          activeOpacity={0.7}
        >
          <View style={styles.unitContent}>
            <Text 
              style={[
                styles.unitName,
                { 
                  color: preferences.unitSystem === 'metric'
                    ? '#FFFFFF'  // White text when selected
                    : (isDark ? '#FFFFFF' : '#000000'),
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}
            >
              {i18n.t('units.metric')}
            </Text>
            <Text style={styles.unitDescription}>
              {i18n.t('units.metricDescription')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.unitButton,
            {
              backgroundColor: preferences.unitSystem === 'imperial'
                ? '#000000'  // Black background when selected
                : 'transparent',
              borderColor: preferences.unitSystem === 'imperial'
                ? '#000000'  // Black border when selected
                : (isDark ? '#2C2C2E' : '#E5E5EA'),
            }
          ]}
          onPress={() => handleUnitSelect('imperial')}
          activeOpacity={0.7}
        >
          <View style={styles.unitContent}>
            <Text 
              style={[
                styles.unitName,
                { 
                  color: preferences.unitSystem === 'imperial'
                    ? '#FFFFFF'  // White text when selected
                    : (isDark ? '#FFFFFF' : '#000000'),
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}
            >
              {i18n.t('units.imperial')}
            </Text>
            <Text style={styles.unitDescription}>
              {i18n.t('units.imperialDescription')}
            </Text>
          </View>
        </TouchableOpacity>
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
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
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
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 