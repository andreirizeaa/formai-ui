import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import { LANGUAGES } from '../../constants/languages';
import i18n from '../../utils/i18n';

interface LanguageScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function LanguageScreen({ onNext, onBack }: LanguageScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const handleLanguageSelect = (languageCode: string) => {
    updatePreference('language', languageCode);
    i18n.locale = languageCode;
  };

  const handleNext = () => {
    if (preferences.language) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('language.title')}
      subtitle={i18n.t('language.subtitle')}
      currentStep={1}
      totalSteps={12}
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
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              {
                backgroundColor: preferences.language === language.code
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: preferences.language === language.code
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleLanguageSelect(language.code)}
            activeOpacity={0.7}
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
    justifyContent: 'center', // Center the buttons vertically when they fit
    paddingVertical: 20,
  },
  languageButton: {
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '500',
  },
}); 