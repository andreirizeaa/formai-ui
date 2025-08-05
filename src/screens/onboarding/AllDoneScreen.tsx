import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import Svg, { Circle, Path } from 'react-native-svg';

interface AllDoneScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Checkmark icon component
const CheckmarkIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="12" fill="#34C759" />
    <Path 
      d="M9 12L11 14L15 10" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

export function AllDoneScreen({ onNext, onBack }: AllDoneScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <OnboardingLayout
      title={i18n.t('allDone.title')}
      subtitle=""
      currentStep={14}
      totalSteps={16}
      onBack={onBack}
      onNext={() => {
        hapticFeedback.selection();
        onNext();
      }}
      nextTitle={i18n.t('next')}
      nextDisabled={false}
    > 
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header with checkmark and "All done!" text */}
          <View style={styles.header}>
            <CheckmarkIcon />
            <Text 
              style={[
                styles.allDoneText,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}
            >
              {i18n.t('allDone.allDone')}
            </Text>
          </View>

          {/* Main thank you message */}
          <Text 
            style={[
              styles.thankYouText,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
              }
            ]}
          >
            {i18n.t('allDone.thankYou')}
          </Text>

          {/* Privacy message */}
          <Text 
            style={[
              styles.privacyText,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
              }
            ]}
          >
            {i18n.t('allDone.privacy')}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  allDoneText: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  thankYouText: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  privacyText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 