import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import i18n from '../../utils/i18n';
import { ActivityIndicator } from 'react-native';

interface SetupLoadingScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function SetupLoadingScreen({ onNext, onBack }: SetupLoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setupSteps = [
    i18n.t('setupLoading.step1'),
    i18n.t('setupLoading.step2'),
  ];

  useEffect(() => {
    let stepIndex = 0;
    
    const showNextStep = () => {
      if (stepIndex < setupSteps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        
        timeoutRef.current = setTimeout(showNextStep, 1500);
      } else {
        // Setup complete, move to next screen
        setTimeout(() => {
          onNext();
        }, 1000);
      }
    };

    showNextStep();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <OnboardingLayout
      title={i18n.t('setupLoading.title')}
      subtitle=""
      currentStep={15}
      totalSteps={16}
      onBack={onBack}
      onNext={() => {}} // No next button, handled automatically
      nextTitle=""
      nextDisabled={true}
      hideNextButton={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Main title */}
          <Text style={[
            styles.mainTitle,
            {
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
            }
          ]}>
            {i18n.t('setupLoading.mainTitle')}
          </Text>

          {/* Current step text */}
          <Text style={[
            styles.stepText,
            {
              color: isDark ? '#8E8E93' : '#8E8E93',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
            }
          ]}>
            {setupSteps[currentStep]}
          </Text>

          {/* Loading spinner */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator 
              size={Platform.OS === 'ios' ? 'large' : 48}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  stepText: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  spinnerContainer: {
    marginTop: 20,
  },
}); 