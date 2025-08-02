import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
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
        icon: undefined
    }
  ] as const;

  const handleDiscoverySelect = (source: 'instagram' | 'tiktok' | 'facebook' | 'google' | 'other') => {
    hapticFeedback.selection();
    updatePreference('discoverySource', source);
  };

  const handleNext = () => {
    if (preferences.discoverySource) {
      hapticFeedback.next();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('discovery.title')}
      subtitle={i18n.t('discovery.subtitle')}
      currentStep={4}
      totalSteps={12}
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
        {discoveryOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.discoveryButton,
              {
                backgroundColor: preferences.discoverySource === option.key
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.discoverySource === option.key
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleDiscoverySelect(option.key)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.discoveryContent,
              option.key === 'other' && styles.discoveryContentCentered
            ]}>
              {option.icon && (
                <Image 
                  source={option.icon} 
                  style={styles.discoveryIconImage}
                  resizeMode="contain"
                />
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
    justifyContent: 'center',
    gap: 12,
  },
  discoveryButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  discoveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  discoveryContentCentered: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  discoveryIconImage: {
    width: 48,
    height: 48,
  },
  discoveryLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 