import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import Svg, { Path } from 'react-native-svg';

interface ReferralCodeScreenProps {
  onNext: () => void;
  onBack: () => void;
}

function CheckmarkIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m4.5 12.75 6 6 9-13.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ReferralCodeScreen({ onNext, onBack }: ReferralCodeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();
  const [referralCode, setReferralCode] = useState(preferences.referralCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => {
    updatePreference('referralCode', referralCode);
    onNext();
  };

  const handleSubmit = () => {
    hapticFeedback.selection();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <OnboardingLayout
      title={i18n.t('referralCode.title')}
      subtitle={i18n.t('referralCode.subtitle')}
      currentStep={13}
      totalSteps={13}
      onBack={onBack}
      onNext={() => {
        hapticFeedback.selection();
        handleNext();
      }}
      nextTitle={i18n.t('next')}
      nextDisabled={false}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: isDark ? '#FFFFFF' : '#000000',
                borderColor: isDark ? '#FFF' : '#000',
              }
            ]}
            placeholder={i18n.t('referralCode.placeholder')}
            placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            editable={!isLoading && !isSuccess}
          />
        </View>
        
        {!isSuccess ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: isDark ? '#FFFFFF' : '#000000',
                opacity: referralCode.trim().length > 0 && !isLoading ? 1 : 0.5,
              }
            ]}
            onPress={handleSubmit}
            disabled={referralCode.trim().length === 0 || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator 
                color={isDark ? '#FFFFFF' : '#000000'} 
                size="small" 
              />
            ) : (
              <Text style={[
                styles.submitButtonText,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                }
              ]}>
                {i18n.t('referralCode.submit') || 'Submit'}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.successContainer}>
            <View style={[
              styles.successIcon,
              { backgroundColor: '#FF9500' }
            ]}>
              <CheckmarkIcon color="#FFFFFF" size={20} />
            </View>
            <Text style={[
              styles.successText,
              { color: isDark ? '#FFFFFF' : '#000000' }
            ]}>
              {i18n.t('referralCode.success')}
            </Text>
          </View>
        )}
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
    marginBottom: 24,
  },
  input: {
    height: 65,
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
    width: '100%',
  },
  submitButton: {
    height: 40,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 