import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Image, TouchableOpacity, TextInput, ActivityIndicator, FlatList, ListRenderItem } from 'react-native';
import { useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as StoreReview from 'expo-store-review';
import { CloseIcon } from '../../components/icons/icons';
import { ReferralService } from '../../services/referralService';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useOnboarding } from '../../context/OnboardingContext';
import { OnboardingData } from '../../types/onboarding';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { LANGUAGES } from '../../constants/languages';
import { CreateAccountScreen } from '../../components/onboarding/CreateAccountScreen';
import LottieView from 'lottie-react-native';
import { CheckmarkWithCircleIcon } from '../../components/icons/icons';

interface OnboardingUnifiedScreenProps {}

interface StepOption<V> {
  value: V;
  label: string;
  description?: string;
  iconImage?: any; // ImageSourcePropType
  iconWidth?: number; // Custom icon width
  iconHeight?: number; // Custom icon height
}

type OptionsStepConfig<K extends keyof OnboardingData> = {
  type: 'options';
  id: string;
  title: string;
  subtitle?: string;
  preferenceKey: K;
  options: Array<StepOption<OnboardingData[K]>>;
};

interface MeasurementsStepConfig {
  type: 'measurements';
  id: string;
  title: string;
  subtitle?: string;
}

interface BirthDateStepConfig {
  type: 'birthdate';
  id: string;
  title: string;
  subtitle?: string;
}

interface RatingStepConfig {
  type: 'rating';
  id: string;
  title: string;
  subtitle?: string;
}

interface ReferralStepConfig {
  type: 'referral';
  id: string;
  title: string;
  subtitle?: string;
}

interface CreateAccountStepConfig {
  type: 'saveProgress';
  id: string;
  title: string;
  subtitle?: string;
}

interface AllDoneStepConfig {
  type: 'allDone';
  id: string;
  title: string;
  subtitle?: string;
}

type StepConfig =
  | OptionsStepConfig<keyof OnboardingData>
  | MeasurementsStepConfig
  | BirthDateStepConfig
  | RatingStepConfig
  | ReferralStepConfig
  | CreateAccountStepConfig
  | AllDoneStepConfig;

export function OnboardingUnifiedScreen({}: OnboardingUnifiedScreenProps) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { onboardingData, updateOnboardingData } = useOnboarding();

  const steps: ReadonlyArray<StepConfig> = useMemo(() => [
    {
      type: 'options',
      id: 'language',
      title: i18n.t('onboarding.language.title'),
      subtitle: i18n.t('onboarding.language.subtitle'),
      preferenceKey: 'language',
      options: LANGUAGES.map(lang => ({ value: lang.code, label: `${lang.nativeName} ${lang.flag}` })),
    },
    {
      type: 'options',
      id: 'units',
      title: i18n.t('onboarding.units.title'),
      subtitle: i18n.t('onboarding.units.subtitle'),
      preferenceKey: 'unitSystem',
      options: [
        { value: 'metric', label: i18n.t('onboarding.units.metric'), description: i18n.t('onboarding.units.metricDescription') },
        { value: 'imperial', label: i18n.t('onboarding.units.imperial'), description: i18n.t('onboarding.units.imperialDescription') },
      ],
    },
    {
      type: 'options',
      id: 'gender',
      title: i18n.t('onboarding.gender.title'),
      subtitle: i18n.t('onboarding.gender.subtitle'),
      preferenceKey: 'gender',
      options: [
        { value: 'male', label: i18n.t('onboarding.gender.male') },
        { value: 'female', label: i18n.t('onboarding.gender.female') },
      ],
    },
    {
      type: 'options',
      id: 'trainingReason',
      title: i18n.t('onboarding.trainingReason.title'),
      subtitle: i18n.t('onboarding.trainingReason.subtitle'),
      preferenceKey: 'trainingReason',
      options: [
        { value: 'build_strength', label: i18n.t('onboarding.trainingReason.buildStrength') },
        { value: 'improve_physique', label: i18n.t('onboarding.trainingReason.improvePhysique') },
        { value: 'prevent_injury', label: i18n.t('onboarding.trainingReason.preventInjury') },
        { value: 'train_for_sport', label: i18n.t('onboarding.trainingReason.trainForSport') },
        { value: 'stay_active_healthy', label: i18n.t('onboarding.trainingReason.stayActiveHealthy') },
      ],
    },
    {
      type: 'options',
      id: 'gymChallenge',
      title: i18n.t('onboarding.gymChallenge.title'),
      subtitle: i18n.t('onboarding.gymChallenge.subtitle'),
      preferenceKey: 'gymChallenge',
      options: [
        { value: 'unsure_form', label: i18n.t('onboarding.gymChallenge.unsureForm') },
        { value: 'no_results', label: i18n.t('onboarding.gymChallenge.noResults') },
        { value: 'worried_injury', label: i18n.t('onboarding.gymChallenge.worriedInjury') },
        { value: 'struggling_motivation', label: i18n.t('onboarding.gymChallenge.strugglingMotivation') },
        { value: 'other', label: i18n.t('onboarding.gymChallenge.other') },
      ],
    },
    {
      type: 'options',
      id: 'workouts',
      title: i18n.t('onboarding.workouts.title'),
      subtitle: i18n.t('onboarding.workouts.subtitle'),
      preferenceKey: 'workoutsPerWeek',
      options: [
        { value: '1-2', label: i18n.t('onboarding.workouts.oneToTwo') },
        { value: '3-4', label: i18n.t('onboarding.workouts.threeToFour') },
        { value: '5-6', label: i18n.t('onboarding.workouts.fiveToSix') },
        { value: 'every_day', label: i18n.t('onboarding.workouts.everyDay') },
        { value: 'it_varies', label: i18n.t('onboarding.workouts.itVaries') },
      ],
    },
    {
      type: 'options',
      id: 'lifterType',
      title: i18n.t('onboarding.lifterType.title'),
      subtitle: i18n.t('onboarding.lifterType.subtitle'),
      preferenceKey: 'lifterType',
      options: [
        { value: 'beginner', label: i18n.t('onboarding.lifterType.beginner') },
        { value: 'intermediate', label: i18n.t('onboarding.lifterType.intermediate') },
        { value: 'advanced', label: i18n.t('onboarding.lifterType.advanced') },
        { value: 'returning_after_break', label: i18n.t('onboarding.lifterType.returningAfterBreak') },
        { value: 'injury_rehab', label: i18n.t('onboarding.lifterType.injuryRehab') },
      ],
    },
    {
      type: 'options',
      id: 'perfectFormGoal',
      title: i18n.t('onboarding.perfectFormGoal.title'),
      subtitle: i18n.t('onboarding.perfectFormGoal.subtitle'),
      preferenceKey: 'perfectFormGoal',
      options: [
        { value: 'lift_heavier_safely', label: i18n.t('onboarding.perfectFormGoal.liftHeavierSafely') },
        { value: 'build_muscle_efficiently', label: i18n.t('onboarding.perfectFormGoal.buildMuscleEfficiently') },
        { value: 'avoid_injuries', label: i18n.t('onboarding.perfectFormGoal.avoidInjuries') },
        { value: 'boost_confidence', label: i18n.t('onboarding.perfectFormGoal.boostConfidence') },
        { value: 'train_longer_without_setbacks', label: i18n.t('onboarding.perfectFormGoal.trainLongerWithoutSetbacks') },
      ],
    },
    {
      type: 'options',
      id: 'formConfidence',
      title: i18n.t('onboarding.formConfidence.title'),
      subtitle: i18n.t('onboarding.formConfidence.subtitle'),
      preferenceKey: 'formConfidence',
      options: [
        { value: '0-25', label: i18n.t('onboarding.formConfidence.zeroToTwentyFive') },
        { value: '25-50', label: i18n.t('onboarding.formConfidence.twentyFiveToFifty') },
        { value: '50-75', label: i18n.t('onboarding.formConfidence.fiftyToSeventyFive') },
        { value: '75-100', label: i18n.t('onboarding.formConfidence.seventyFiveToHundred') },
      ],
    },
    {
      type: 'options',
      id: 'threeMonthGoal',
      title: i18n.t('onboarding.threeMonthGoal.title'),
      subtitle: i18n.t('onboarding.threeMonthGoal.subtitle'),
      preferenceKey: 'threeMonthGoal',
      options: [
        { value: 'lifting_heavier', label: i18n.t('onboarding.threeMonthGoal.liftingHeavier') },
        { value: 'looking_leaner', label: i18n.t('onboarding.threeMonthGoal.lookingLeaner') },
        { value: 'feeling_stronger_injury_free', label: i18n.t('onboarding.threeMonthGoal.feelingStrongerInjuryFree') },
        { value: 'more_consistent', label: i18n.t('onboarding.threeMonthGoal.moreConsistent') },
        { value: 'more_confident', label: i18n.t('onboarding.threeMonthGoal.moreConfident') },
      ],
    },
    {
      type: 'options',
      id: 'personalTrainer',
      title: i18n.t('onboarding.personalTrainer.title'),
      subtitle: i18n.t('onboarding.personalTrainer.subtitle'),
      preferenceKey: 'hasPersonalTrainer',
      options: [
        { value: true, label: i18n.t('onboarding.personalTrainer.yes') },
        { value: false, label: i18n.t('onboarding.personalTrainer.no') },
      ],
    },
    {
      type: 'measurements',
      id: 'measurements',
      title: i18n.t('onboarding.measurements.title'),
      subtitle: i18n.t('onboarding.measurements.subtitle'),
    },
    {
      type: 'birthdate',
      id: 'birthDate',
      title: i18n.t('onboarding.birthDate.title'),
      subtitle: i18n.t('onboarding.birthDate.subtitle'),
    },
    {
      type: 'options',
      id: 'discoverySource',
      title: i18n.t('onboarding.discovery.title'),
      subtitle: i18n.t('onboarding.discovery.subtitle'),
      preferenceKey: 'discoverySource',
      options: [
        { value: 'instagram', label: i18n.t('onboarding.discovery.instagram'), iconHeight: 24, iconWidth: 24 , iconImage: require('../../../assets/icons/instagram.png') },
        { value: 'tiktok', label: i18n.t('onboarding.discovery.tiktok'), iconHeight: 24, iconWidth: 24 , iconImage: require('../../../assets/icons/tiktok.png') },
        { value: 'facebook', label: i18n.t('onboarding.discovery.facebook'), iconHeight: 24, iconWidth: 24 , iconImage: require('../../../assets/icons/fasebook.png') },
        { value: 'google', label: i18n.t('onboarding.discovery.google'), iconHeight: 24, iconWidth: 24 , iconImage: require('../../../assets/icons/google.png') },
        { value: 'other', label: i18n.t('onboarding.discovery.other') },
      ],
    },
    // {
    //   type: 'rating',
    //   id: 'rating',
    //   title: i18n.t('onboarding.rating.title'),
    //   subtitle: i18n.t('onboarding.rating.subtitle'),
    // },
    // {
    //   type: 'referral',
    //   id: 'referralCode',
    //   title: i18n.t('onboarding.referralCode.title'),
    //   subtitle: i18n.t('onboarding.referralCode.subtitle'),
    // },
    {
      type: 'allDone',
      id: 'allDone',
      title: i18n.t('onboarding.allDone.title'),
      subtitle: '',
    },
    {
      type: 'saveProgress',
      id: 'saveProgress',
      title: 'Create an account',
      subtitle: '',
    },
  ], [i18n.locale]);

  const totalSteps = steps.length;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];

  // Local state for referral step
  const [referralCode, setReferralCode] = useState(onboardingData.referralCode || '');
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralError, setReferralError] = useState(false);

  // Helpers for measurements
  const isMetric = onboardingData.unitSystem === 'metric';
  const heightOptions = Array.from({ length: 151 }, (_, i) => 100 + i); // 100-250 cm
  const feetOptions = Array.from({ length: 8 }, (_, i) => 1 + i); // 1-8 feet
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches
  const weightOptions = isMetric
    ? Array.from({ length: 151 }, (_, i) => 40 + i) // 40-190 kg
    : Array.from({ length: 251 }, (_, i) => 90 + i); // 90-340 lbs

  function getCurrentHeight() {
    if (!onboardingData.metricHeight) return isMetric ? 170 : { feet: 5, inches: 7, totalInches: 67 };
    if (isMetric) return onboardingData.metricHeight;
    const totalInches = Math.round(onboardingData.metricHeight / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet, inches, totalInches };
  }

  function getCurrentWeight() {
    if (!onboardingData.metricWeight) return isMetric ? 60 : 130;
    if (isMetric) return onboardingData.metricWeight;
    return Math.round(onboardingData.metricWeight / 0.453592);
  }

  function handleHeightSelect(height: number) {
    updateOnboardingData('metricHeight', isMetric ? height : height * 2.54);
  }

  function handleFeetSelect(feet: number) {
    const currentHeight = onboardingData.metricHeight || 170;
    const totalInches = Math.round(currentHeight / 2.54);
    const currentInches = totalInches % 12;
    const newTotalInches = feet * 12 + currentInches;
    updateOnboardingData('metricHeight', newTotalInches * 2.54);
  }

  function handleInchesSelect(inches: number) {
    const currentHeight = onboardingData.metricHeight || 170;
    const totalInches = Math.round(currentHeight / 2.54);
    const currentFeet = Math.floor(totalInches / 12);
    const newTotalInches = currentFeet * 12 + inches;
    updateOnboardingData('metricHeight', newTotalInches * 2.54);
  }

  function handleWeightSelect(weight: number) {
    updateOnboardingData('metricWeight', isMetric ? weight : weight * 0.453592);
  }

  // Birthdate helpers
  const currentYear = new Date().getFullYear();

  function parseBirthDate(birthDateString: string | null) {
    if (!birthDateString) return { month: null as number | null, day: null as number | null, year: null as number | null };
    const [year, month, day] = birthDateString.split('-').map(Number);
    return { month, day, year };
  }

  function formatBirthDateString(month: number | null, day: number | null, year: number | null) {
    if (!month || !day || !year) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  useEffect(() => {
    if (currentStep.type === 'birthdate' && !onboardingData.birthDate) {
      const defaultDate = formatBirthDateString(7, 15, currentYear - 25);
      updateOnboardingData('birthDate', defaultDate);
    }
  }, [currentStep.type, onboardingData.birthDate, currentYear, updateOnboardingData]);

  useEffect(() => {
    if (currentStep.type === 'allDone') {
      hapticFeedback.success();
    }
  }, [currentStep.type]);

  const birthDateObj = parseBirthDate(onboardingData.birthDate);
  const effectiveBirthDate = birthDateObj.month && birthDateObj.day && birthDateObj.year
    ? birthDateObj
    : { month: 7, day: 15, year: currentYear - 25 };

  const months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ];

  function getDaysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }

  function updateBirthDate(field: 'month' | 'day' | 'year', value: number | null) {
    hapticFeedback.selection();
    const updatedObj: any = { ...effectiveBirthDate, [field]: value };
    if (field === 'month' || field === 'year') {
      if (updatedObj.month && updatedObj.year && updatedObj.day) {
        const maxDays = getDaysInMonth(updatedObj.month, updatedObj.year);
        if (updatedObj.day > maxDays) updatedObj.day = maxDays;
      }
    }
    const dateString = formatBirthDateString(updatedObj.month, updatedObj.day, updatedObj.year);
    updateOnboardingData('birthDate', dateString);
  }

  function handleSelectOptionStep(value: any) {
    hapticFeedback.selection();
    const step = currentStep as OptionsStepConfig<keyof OnboardingData>;
    updateOnboardingData(step.preferenceKey as any, value);
    if (step.preferenceKey === 'language' && typeof value === 'string') i18n.locale = value;
  }

  async function handleRateFormAI() {
    hapticFeedback.selection();
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
      updateOnboardingData('hasRated', true);
      // Navigate to next screen after rating dialog
      handleNext();
    } catch (e) {
      updateOnboardingData('hasRated', true);
      // Navigate to next screen even if rating fails
      handleNext();
    }
  }

  function handleNext() {
    const isLast = currentStepIndex === totalSteps - 1;
   
    // Handle referral code validation
    if (currentStep.type === 'referral' && referralCode.trim().length > 0) {
      setReferralValidating(true);
      setReferralError(false);
      
      // Query Supabase referral_codes table to validate the code
      const validateReferralCode = async () => {
        try {
          const result = await ReferralService.validateReferralCode(referralCode.trim().toUpperCase());

          if (result.error) {
            hapticFeedback.error();
            setReferralError(true);
            setReferralValidating(false);
            return;
          }

          // Check if code exists by checking if data is returned
          if (result.isValid) {
            // Valid referral code found
            updateOnboardingData('referralCode', referralCode.trim().toUpperCase());
            // Continue to next step
            setCurrentStepIndex(i => i + 1);

          } else {
            // Invalid referral code
            hapticFeedback.error();
            setReferralError(true);
          }
        } catch (error) {
          hapticFeedback.error();
          setReferralError(true);
        } finally {
          setReferralValidating(false);
        }
      };

      validateReferralCode();
      return;
    }
    
    if (!isLast) {
      hapticFeedback.selection();
      setCurrentStepIndex(i => i + 1);
      return;
    }
    
    // When finished, check if it's the save progress step
    if (currentStep.type === 'saveProgress') {
      // Navigate to payment screens
      navigation.navigate('Payment' as never);
    } else {
      // Continue the original flow
      navigation.navigate('AllDone' as never);
    }
  }

  function handleBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(i => i - 1);
      return;
    }
    // Navigate back to previous screen in stack
    navigation.goBack();
  }

  // Compute next disabled based on step type
  let nextDisabled = false;
  let nextLoading = false;
  if (currentStep.type === 'options') {
    const step = currentStep as OptionsStepConfig<keyof OnboardingData>;
    const selectedValue = onboardingData[step.preferenceKey as keyof OnboardingData] as any;
    nextDisabled = selectedValue === null || selectedValue === undefined || selectedValue === '';
  } else if (currentStep.type === 'measurements') {
    nextDisabled = !onboardingData.metricHeight || !onboardingData.metricWeight;
  } else if (currentStep.type === 'birthdate') {
    nextDisabled = !onboardingData.birthDate;
  } else if (currentStep.type === 'rating') {
    nextDisabled = false; // enable default next for rating step
  } else if (currentStep.type === 'referral') {
    nextLoading = referralValidating; // show loading while validating
  } else if (currentStep.type === 'allDone') {
    nextDisabled = false; // always enabled for allDone step
  }

  const nextHandler = currentStep.type === 'rating' ? handleRateFormAI : handleNext;
  const nextLabel = currentStep.type === 'rating' ? 'Rate FormAI' : i18n.t('next');

  return (
    <OnboardingLayout
      title={currentStep.title}
      subtitle={currentStep.subtitle}
      currentStep={currentStepIndex + 1}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={nextHandler}
      nextTitle={nextLabel}
      nextDisabled={nextDisabled}
      nextLoading={nextLoading}
      hideNextButton={currentStep.type === 'saveProgress'}
      
    >
      {currentStep.type === 'options' && (
        currentStep.id === 'language' ? (
          <FlatList
            data={(currentStep as OptionsStepConfig<keyof OnboardingData>).options}
            keyExtractor={item => String(item.value)}
            renderItem={({ item }) => {
              const selectedValue = onboardingData['language'] as any;
              return (
                <AnimatedOptionButton
                  onPress={() => handleSelectOptionStep(item.value)}
                  isSelected={selectedValue === item.value}
                  isDark={isDark}
                  delay={0}
                >
                  <View style={styles.optionContentRow}>
                    {item.iconImage ? (
                      <Image 
                        source={item.iconImage} 
                        style={[
                          styles.optionIconImage,
                          item.iconWidth ? { width: item.iconWidth } : undefined,
                          item.iconHeight ? { height: item.iconHeight } : undefined
                        ]} 
                        resizeMode="contain" 
                      />
                    ) : null}
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: selectedValue === item.value ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000',
                            fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </View>
                </AnimatedOptionButton>
              );
            }}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator
            removeClippedSubviews
            windowSize={10}
            initialNumToRender={16}
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={16}
            indicatorStyle={isDark ? 'white' : 'black'}
          />
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator
            persistentScrollbar
            scrollIndicatorInsets={{ right: 1 }}
            indicatorStyle={isDark ? 'white' : 'black'}
            bounces
            alwaysBounceVertical={false}
            nestedScrollEnabled
          >
            {(currentStep as OptionsStepConfig<keyof OnboardingData>).options.map((option, index) => {
              const step = currentStep as OptionsStepConfig<keyof OnboardingData>;
              const selectedValue = onboardingData[step.preferenceKey as keyof OnboardingData] as any;
              return (
                <AnimatedOptionButton
                  key={String(option.value)}
                  onPress={() => handleSelectOptionStep(option.value)}
                  isSelected={selectedValue === option.value}
                  isDark={isDark}
                  delay={index * 100}
                  style={option.description ? styles.optionWithDescription : undefined}
                >
                  <View style={styles.optionContentRow}>
                    {option.iconImage ? (
                      <Image 
                        source={option.iconImage} 
                        style={[
                          styles.optionIconImage,
                          option.iconWidth ? { width: option.iconWidth } : undefined,
                          option.iconHeight ? { height: option.iconHeight } : undefined
                        ]} 
                        resizeMode="contain" 
                      />
                    ) : null}
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: selectedValue === option.value ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000',
                            fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text
                          style={[
                            styles.optionDescription,
                            { color: selectedValue === option.value ? '#FFFFFF' : '#9CA3AF' },
                          ]}
                        >
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </AnimatedOptionButton>
              );
            })}
          </ScrollView>
        )
      )}

      {currentStep.type === 'measurements' && (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.measurementsContentContainer}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical={false}
        >
          <View style={styles.measurementsRow}>
            <View style={styles.measurePickerSection}>
              <Text style={[styles.pickerLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {i18n.t('onboarding.measurements.height')}
              </Text>
              <View style={styles.pickerWrapper}> 
                {isMetric ? (
                  <Picker
                    selectedValue={getCurrentHeight() as number}
                    onValueChange={value => value && handleHeightSelect(value)}
                    style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                    itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                    dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                  >
                    {heightOptions.map(height => (
                      <Picker.Item key={height} label={`${height} ${i18n.t('onboarding.measurements.cm')}`} value={height} color={isDark ? '#FFFFFF' : '#000000'} />
                    ))}
                  </Picker>
                ) : (
                  <View style={styles.imperialPickersContainer}>
                    <View style={styles.imperialPickerWrapper}>
                      <Picker
                        selectedValue={(getCurrentHeight() as { feet: number }).feet}
                        onValueChange={value => value && handleFeetSelect(value)}
                        style={[styles.imperialPicker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                        dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                      >
                        {feetOptions.map(feet => (
                          <Picker.Item key={feet} label={`${feet} ft`} value={feet} color={isDark ? '#FFFFFF' : '#000000'} />
                        ))}
                      </Picker>
                    </View>
                    <View style={styles.imperialPickerWrapper}>
                      <Picker
                        selectedValue={(getCurrentHeight() as { inches: number }).inches}
                        onValueChange={value => value && handleInchesSelect(value)}
                        style={[styles.imperialPicker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                        dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                      >
                        {inchesOptions.map(inches => (
                          <Picker.Item key={inches} label={`${inches} in`} value={inches} color={isDark ? '#FFFFFF' : '#000000'} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.measurePickerSection}>
              <Text style={[styles.pickerLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {i18n.t('onboarding.measurements.weight')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={getCurrentWeight()}
                  onValueChange={value => value && handleWeightSelect(value)}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {weightOptions.map(weight => (
                    <Picker.Item key={weight} label={`${weight} ${isMetric ? i18n.t('onboarding.measurements.kg') : i18n.t('onboarding.measurements.lbs')}`} value={weight} color={isDark ? '#FFFFFF' : '#000000'} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {currentStep.type === 'birthdate' && (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.birthdateContentContainer}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical={false}
        >
          <View style={styles.birthdateRow}>
            <View style={[styles.birthdatePickerSection, { flex: 1.4 }]}> 
              <Text style={[styles.pickerLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {i18n.t('onboarding.birthDate.month')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={effectiveBirthDate.month}
                  onValueChange={value => updateBirthDate('month', value)}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {months.map((month, index) => (
                    <Picker.Item key={index + 1} label={month} value={index + 1} color={isDark ? '#FFFFFF' : '#000000'} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.birthdatePickerSection}>
              <Text style={[styles.pickerLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {i18n.t('onboarding.birthDate.day')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={effectiveBirthDate.day}
                  onValueChange={value => updateBirthDate('day', value)}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {Array.from({ length: effectiveBirthDate.month && effectiveBirthDate.year ? new Date(effectiveBirthDate.year, effectiveBirthDate.month, 0).getDate() : 31 }, (_, i) => i + 1).map(day => (
                    <Picker.Item key={day} label={String(day)} value={day} color={isDark ? '#FFFFFF' : '#000000'} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.birthdatePickerSection}>
              <Text style={[styles.pickerLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {i18n.t('onboarding.birthDate.year')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={effectiveBirthDate.year}
                  onValueChange={value => updateBirthDate('year', value)}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {Array.from({ length: (currentYear - 1940 - 3) }, (_, i) => currentYear - 4 - i).reverse().map(year => (
                    <Picker.Item key={year} label={String(year)} value={year} color={isDark ? '#FFFFFF' : '#000000'} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {currentStep.type === 'rating' && (
        <View style={styles.ratingContainer}> 
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../../../assets/animations/star-rating.json')}
              autoPlay
              loop={false}
              style={{ width: 320, height: 300 }}
            />
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: -80 }}>
            <Text style={{ fontSize: 24, fontWeight: '500', textAlign: 'center', width: '80%', color: isDark ? '#FFFFFF' : '#000000' }}>
              {i18n.t('onboarding.rating.middleText')}
            </Text>
          </View>
          
          {/* Testimonial Cards in ScrollView */}
          <ScrollView 
            style={styles.testimonialsScrollView}
            contentContainerStyle={styles.testimonialsContentContainer}
            showsVerticalScrollIndicator={false}
            bounces
            alwaysBounceVertical={false}
          >
            <View style={[
              styles.testimonialBox, 
              { 
                backgroundColor: isDark ? 'rgba(28, 28, 30, 0.5)' : 'rgba(226, 232, 240, 0.6)',
              }
            ]}>
              <View style={styles.testimonialHeader}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
                  style={styles.profileImage}
                />
                <View style={styles.userInfo}>
                  <View style={styles.nameStarsRow}>
                    <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      Sarah Johnson
                    </Text>
                    <Text style={styles.userStars}>⭐⭐⭐⭐⭐</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.testimonialText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                "I lost 12 lbs in 6 weeks! The form corrections helped me avoid injury and I finally feel confident in the gym. Best investment I've made for my fitness!"
              </Text>
            </View>

            {/* Second Testimonial */}
            <View style={[
              styles.testimonialBox, 
              { 
                backgroundColor: isDark ? 'rgba(28, 28, 30, 0.5)' : 'rgba(226, 232, 240, 0.6)',
              }
            ]}>
              <View style={styles.testimonialHeader}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
                  style={styles.profileImage}
                />
                <View style={styles.userInfo}>
                  <View style={styles.nameStarsRow}>
                    <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      Mike Chen
                    </Text>
                    <Text style={styles.userStars}>⭐⭐⭐⭐⭐</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.testimonialText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                "Perfect form coaching! I increased my deadlift by 40lbs safely. The real-time feedback is incredible and prevented me from making costly mistakes."
              </Text>
            </View>

            {/* Third Testimonial */}
            <View style={[
              styles.testimonialBox, 
              { 
                backgroundColor: isDark ? 'rgba(28, 28, 30, 0.5)' : 'rgba(226, 232, 240, 0.6)',
              }
            ]}>
              <View style={styles.testimonialHeader}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' }}
                  style={styles.profileImage}
                />
                <View style={styles.userInfo}>
                  <View style={styles.nameStarsRow}>
                    <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      Emma Rodriguez
                    </Text>
                    <Text style={styles.userStars}>⭐⭐⭐⭐⭐</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.testimonialText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                "Game changer for beginners! I went from being intimidated by the gym to crushing my workouts with confidence. Worth every penny!"
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {currentStep.type === 'referral' && (
        <View style={styles.referralContainer}>
          <View style={[
              styles.inputWrapper,
              {
                borderColor: isDark ? '#FFF' : '#000',
              }
            ]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                  },
                ]}
                placeholder={i18n.t('onboarding.referralCode.placeholder')}
                placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={20}
                editable={!referralValidating}
              />
              {referralCode.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    hapticFeedback.selection();
                    setReferralCode('');
                    setReferralError(false);
                  }}
                  disabled={referralValidating}
                  activeOpacity={0.7}
                >
                  <View style={styles.clearIconContainer}>
                    <CloseIcon width={24} height={24} color={isDark ? '#FFFFFF' : '#8E8E93'} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
            {referralError && (
              <Text style={[
                styles.errorText,
                { color: '#FF3B30' }
              ]}>
                {i18n.t('onboarding.referralCode.error') || 'Invalid referral code'}
              </Text>
            )}
          </View>
      )}

      {currentStep.type === 'allDone' && (
        <View style={styles.allDoneContainer}>
          {/* Confetti animation positioned behind content */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../../../assets/animations/confetti.json')}
              autoPlay
              speed={0.6}
              style={styles.confettiAnimation}
            />
          </View>

          <View style={styles.allDoneContent}>
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
      )}

      {currentStep.type === 'saveProgress' && (
        <CreateAccountScreen
          onNext={() => {
            // Navigate to account loading screen first, then to payment
            navigation.navigate('AccountLoading' as never);
          }}
          onBack={() => {
            // Navigate to AllDone screen
            navigation.navigate('AllDone' as never);
          }}
          onSignIn={() => {
            // Navigate to sign in screen
            navigation.navigate('SignIn' as never);
          }}
        />
      )}
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
    paddingVertical: 20,
    gap: 12,
  },
  optionWithDescription: {
    minHeight: 80,
    justifyContent: 'center',
  },
  optionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  optionIconImage: {
    resizeMode: 'contain',
    // Custom dimensions can be overridden by passing specific width/height in the options
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
  },
  // Measurements styles
  measurementsContentContainer: {
    marginTop: 20,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  measurementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
  },
  measurePickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 280 : 80,
    width: '100%',
  },
  imperialPickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 30,
  },
  imperialPickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  imperialPicker: {
    height: Platform.OS === 'ios' ? 280 : 80,
    width: 90,
    minWidth: 80,
  },
  // Birthdate styles
  birthdateContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  birthdateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  birthdatePickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  // Rating styles
  ratingContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  lottieContainer: {
    alignItems: 'center',
    marginTop: -120,
  },
  // Referral styles
  referralContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 17,
    paddingLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'left',
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  clearIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  // Testimonial styles
  testimonialBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userStars: {
    fontSize: 14,
    color: '#FFD700', // Gold color for stars
  },
  testimonialText: {
    fontSize: 15,
    lineHeight: 22,
  },
  testimonialsScrollView: {
    flexGrow: 1,
    marginBottom: -22,
  },
  testimonialsContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  nameStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allDoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  allDoneContent: {
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
}); 