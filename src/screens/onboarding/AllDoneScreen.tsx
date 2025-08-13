import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import LottieView from 'lottie-react-native';
import { CheckmarkWithCircleIcon } from '../../components/icons/icons';

interface AllDoneScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function AllDoneScreen({ onNext, onBack }: AllDoneScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    hapticFeedback.success();
  }, []);

  return (
    <OnboardingLayout
      title={i18n.t('onboarding.allDone.title')}
      subtitle=""
      currentStep={18}
      totalSteps={18}
      onBack={onBack}
      onNext={() => {
        hapticFeedback.selection();
        onNext();
      }}
      nextTitle={i18n.t('next')}
      nextDisabled={false}
    > 
      <View style={styles.container}>
        {/* Confetti animation positioned behind content */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../../assets/animations/confetti.json')}
            autoPlay
            speed={0.6}
            style={styles.confettiAnimation}
          />
        </View>

        <View style={styles.content}>
          {/* Header with checkmark and "All done!" text */}
          <View style={styles.header}>
            <CheckmarkWithCircleIcon width={36} height={36} />
            <Text 
              style={[
                styles.allDoneText,
                { 
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}
            >
              {i18n.t('onboarding.allDone.allDone')}
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
            {i18n.t('onboarding.allDone.thankYou')}
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
            {i18n.t('onboarding.allDone.privacy')}
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
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -10,
  },
  confettiAnimation: {
    width: 700,
    height: 700,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
    zIndex: 2,
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