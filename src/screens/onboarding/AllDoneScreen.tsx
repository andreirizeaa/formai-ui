import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import i18n from '../../utils/i18n';
import Svg, { Circle, Path } from 'react-native-svg';
import Explosion from '../../animations/ConfettiExplosion';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = Dimensions.get('window');
  const explosionRef = useRef<any>(null);

  useEffect(() => {
    // Show confetti after content has rendered
    const timer = setTimeout(() => {
      setShowConfetti(true);
      // Start the explosion after a short delay
      setTimeout(() => {
        if (explosionRef.current) {
          explosionRef.current.start();
        }
      }, 100);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <OnboardingLayout
      title={i18n.t('allDone.title')}
      subtitle=""
      currentStep={13}
      totalSteps={16}
      onBack={onBack}
      onNext={onNext}
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

      {showConfetti && (
        <View style={styles.confetti}>
          <Explosion
            ref={explosionRef}
            count={200}
            origin={{ x: width / 2, y: height}}
            fallSpeed={3000}
            explosionSpeed={200}
            fadeOut={true}
          />
        </View>
      )}
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
    fontSize: 17,
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
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -10, // Ensure it's behind other content
  },
}); 