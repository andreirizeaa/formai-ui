import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';

interface FormBarrierScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function FormBarrierScreen({ onNext, onBack }: FormBarrierScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const formBarrierOptions = [
    { key: 'expensive_trainers', label: i18n.t('formBarrier.expensiveTrainers') },
    { key: 'gym_advice_scary', label: i18n.t('formBarrier.gymAdviceScary') },
    { key: 'no_time', label: i18n.t('formBarrier.noTime') },
  ] as const;

  const handleFormBarrierSelect = (barrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time') => {
    updatePreference('formBarrier', barrier);
  };

  const handleNext = () => {
    if (preferences.formBarrier) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('formBarrier.title')}
      subtitle={i18n.t('formBarrier.subtitle')}
      currentStep={10}
      totalSteps={12}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.formBarrier}
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
        {formBarrierOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.formBarrierButton,
              {
                backgroundColor: preferences.formBarrier === option.key
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.formBarrier === option.key
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleFormBarrierSelect(option.key)}
            activeOpacity={0.7}
          >
            <View style={styles.formBarrierContent}>
              <Text 
                style={[
                  styles.formBarrierLabel,
                  { 
                    color: preferences.formBarrier === option.key
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
    justifyContent: 'center', // Center the buttons vertically when they fit
    paddingVertical: 20,
  },
  formBarrierButton: {
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  formBarrierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formBarrierLabel: {
    fontSize: 17,
    fontWeight: '500',
  },
}); 