import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../ui/BackButton';
import { ProgressBar } from '../ui/ProgressBar';
import { NextButton } from '../ui/NextButton';
import { hapticFeedback } from '../../utils/haptic';

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
  nextLoading?: boolean;
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
  nextLoading = false,
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
        <BackButton onPress={() => {
          hapticFeedback.selection();
          onBack();
        }} />
        <View style={styles.progressContainer}>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      </View>
      
      {/* Integrated Header Content */}
      <View style={styles.headerContent}>
        <Text 
          style={[
            styles.title, 
            { 
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
            }
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={[
              styles.subtitle, 
              { 
                color: isDark ? '#AEAEB2' : '#8E8E93',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
              }
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

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
          loading={nextLoading}
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
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 22,
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