import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
import { ProgressBar } from '../ui/ProgressBar';
import { OnboardingHeader } from './OnboardingHeader';
import { NextButton } from '../ui/NextButton';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextTitle: string;
  nextDisabled?: boolean;
  hideNextButton?: boolean;
  customButtons?: React.ReactNode;
}

export function OnboardingLayout({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextTitle,
  nextDisabled = false,
  hideNextButton = false,
  customButtons,
}: OnboardingLayoutProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Header with back button and progress bar */}
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <View style={styles.progressContainer}>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      </View>
      
      <OnboardingHeader 
        title={title}
        subtitle={subtitle}
      />

      {/* Content area with vertical centering */}
      <View style={styles.contentWrapper}>
        <View style={styles.centeredContent}>
          {children}
        </View>
      </View>

      {/* Show custom buttons if provided, otherwise show default Next button */}
      {customButtons ? (
        <View style={styles.customButtonsContainer}>
          {customButtons}
        </View>
      ) : !hideNextButton ? (
        <NextButton 
          title={nextTitle}
          onPress={onNext}
          disabled={nextDisabled}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 20,
    height: 64,
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 6,
    justifyContent: 'center',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center', // Center content vertically
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center', // Center the buttons vertically within the available space
  },
  customButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
});