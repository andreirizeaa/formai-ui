import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import { LANGUAGES } from '../../constants/languages';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface LanguageScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function LanguageScreen({ onNext, onBack }: LanguageScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const handleLanguageSelect = (languageCode: string) => {
    hapticFeedback.selection();
    updatePreference('language', languageCode);
    i18n.locale = languageCode;
  };

  const handleNext = () => {
    if (preferences.language) {
      hapticFeedback.selection();
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('language.title')}
      subtitle={i18n.t('language.subtitle')}
      currentStep={1}
      totalSteps={13}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.language}
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
        {LANGUAGES.map((language, index) => (
          <AnimatedOptionButton
            key={language.code}
            onPress={() => handleLanguageSelect(language.code)}
            isSelected={preferences.language === language.code}
            isDark={isDark}
            delay={index * 100}
          >
            <View style={styles.languageContent}>
              <Text 
                style={[
                  styles.languageName,
                  { 
                    color: preferences.language === language.code
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {language.nativeName}
              </Text>
              <Text style={styles.flag}>{language.flag}</Text>
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
    justifyContent: 'center', // Center the buttons vertically when they fit
    paddingVertical: 20,
    gap: 12,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 