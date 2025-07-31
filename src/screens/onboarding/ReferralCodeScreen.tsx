import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';

interface ReferralCodeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function ReferralCodeScreen({ onNext, onBack }: ReferralCodeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();
  const [referralCode, setReferralCode] = useState(preferences.referralCode || '');

  const handleNext = () => {
    updatePreference('referralCode', referralCode);
    onNext();
  };

  return (
    <OnboardingLayout
      title={i18n.t('referralCode.title')}
      subtitle={i18n.t('referralCode.subtitle')}
      currentStep={12}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={false}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
                color: isDark ? '#FFFFFF' : '#000000',
                borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
              }
            ]}
            placeholder={i18n.t('referralCode.placeholder')}
            placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
    width: '100%',
  },
}); 