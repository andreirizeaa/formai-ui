import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface DiscoveryScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function DiscoveryScreen({ onNext, onBack }: DiscoveryScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const discoveryOptions = [
    { 
      key: 'instagram', 
      label: i18n.t('discovery.instagram'), 
      icon: require('../../../assets/icons/instagram.png')
    },
    { 
      key: 'tiktok', 
      label: i18n.t('discovery.tiktok'), 
      icon: require('../../../assets/icons/tiktok.png')
    },
    { 
      key: 'facebook', 
      label: i18n.t('discovery.facebook'), 
      icon: require('../../../assets/icons/fasebook.png')
    },
    { 
      key: 'google', 
      label: i18n.t('discovery.google'), 
      icon: require('../../../assets/icons/google.png')
    },
    { 
      key: 'other', 
      label: i18n.t('discovery.other'), 
      icon: null
    },
  ] as const;

  const handleDiscoverySelect = (source: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other') => {
    hapticFeedback.selection();
    updatePreference('discoverySource', source);
  };

  const handleNext = () => {
    if (preferences.discoverySource) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('discovery.title')}
      subtitle={i18n.t('discovery.subtitle')}
      currentStep={5}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.discoverySource}
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
        {discoveryOptions.map((option, index) => (
          <AnimatedOptionButton
            key={option.key}
            onPress={() => handleDiscoverySelect(option.key)}
            isSelected={preferences.discoverySource === option.key}
            isDark={isDark}
            delay={index * 100}
            style={{ paddingVertical: 12 }}
          >
            <View style={styles.discoveryContent}>
              {option.icon ? (
                <Image 
                  source={option.icon} 
                  style={styles.discoveryIconImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.discoveryIconImage} />
              )}
              <Text 
                style={[
                  styles.discoveryLabel,
                  { 
                    color: preferences.discoverySource === option.key
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
    justifyContent: 'center',
    gap: 12,
  },
  discoveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  discoveryIconImage: {
    width: 32,
    height: 32,
  },
  discoveryLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 