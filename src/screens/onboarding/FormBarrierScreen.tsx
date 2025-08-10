import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface FormBarrierScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function FormBarrierScreen({ onNext, onBack }: FormBarrierScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const formBarrierOptions = [
    { 
      key: 'expensive_trainers', 
      label: i18n.t('formBarrier.expensiveTrainers')
    },
    { 
      key: 'gym_advice_scary', 
      label: i18n.t('formBarrier.gymAdviceScary')
    },
    { 
      key: 'no_time', 
      label: i18n.t('formBarrier.noTime')
    },
    { 
      key: 'other', 
      label: i18n.t('formBarrier.other')
    },
  ] as const;

  const handleFormBarrierSelect = (barrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time' | 'other') => {
    hapticFeedback.selection();
    updatePreference('formBarrier', barrier);
  };

  const handleNext = () => {
    if (preferences.formBarrier) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('formBarrier.title')}
      subtitle={i18n.t('formBarrier.subtitle')}
      currentStep={12}
      totalSteps={13}
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
        {formBarrierOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleFormBarrierSelect(option.key)}
            isSelected={preferences.formBarrier === option.key}
            isDark={isDark}
            delay={index * 100}
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
    justifyContent: 'center', // Center the buttons vertically when they fit
    paddingVertical: 20,
    gap: 12,
  },
  formBarrierContent: {
    alignItems: 'flex-start',
  },
  formBarrierLabel: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 