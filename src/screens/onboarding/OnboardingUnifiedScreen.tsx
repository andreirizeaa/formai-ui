import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, TextInput, FlatList, Animated, Alert } from 'react-native';
import ReanimatedAnimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay 
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as StoreReview from 'expo-store-review';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
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
import { BicepsFlexed, User, ShieldPlus, Bike, HeartPulse, CircleX, AudioWaveform, ChartNoAxesColumnDecreasing, BookCopy, ShieldOff, BatteryLow, Ellipsis, Sprout, Shrub, TreePine, ChartNoAxesCombined, Hospital, Dumbbell, ShieldCheck, ChartNoAxesColumnIncreasing, ClockArrowUp, BatteryWarning, BatteryMedium, BatteryFull, PartyPopper, Weight, Scale, TrendingUp, ThumbsUp, ThumbsDown, Users, CircleCheck, Trophy } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { SingleDotIcon, SixDotsIcon, ThreeDotsIcon } from '../../components/icons/icons';
import { Line } from 'react-native-svg';

interface OnboardingUnifiedScreenProps {}

interface AnimatedInfoCardProps {
  children: React.ReactNode;
  delay: number;
}

function AnimatedInfoCard({ children, delay }: AnimatedInfoCardProps) {
  const translateY = useSharedValue(delay === 0 ? 0 : 30);
  const opacity = useSharedValue(delay === 0 ? 1 : 0);

  useEffect(() => {
    // If delay is 0, don't animate - show immediately
    if (delay === 0) return;
    
    // Animate in with a staggered delay
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.6,
      })
    );
    
    opacity.value = withDelay(
      delay,
      withSpring(1, {
        damping: 25,
        stiffness: 200,
      })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <ReanimatedAnimated.View style={animatedStyle}>
      {children}
    </ReanimatedAnimated.View>
  );
}

interface StepOption<V> {
  value: V;
  label: string;
  description?: string;
  iconImage?: any; // ImageSourcePropType
  iconWidth?: number; // Custom icon width
  iconHeight?: number; // Custom icon height
  icon?: React.ReactNode; // Lucide icon component
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

interface InfoStepConfig {
  type: 'info';
  id: string;
  title: string;
  subtitle?: string;
}

interface InjuryChanceInfoStepConfig {
  type: 'injuryChanceInfo';
  id: string;
  title: string;
  subtitle?: string;
}

interface PerfectFormGoalMessageStepConfig {
  type: 'perfectFormGoalMessage';
  id: string;
  title: string;
  subtitle?: string;
}

interface GraphStepConfig {
  type: 'graph';
  id: string;
  title: string;
  subtitle?: string;
}

interface GymChallengeInfoStepConfig {
  type: 'gymChallengeInfo';
  id: string;
  title: string;
  subtitle?: string;
}

interface NotificationPermissionStepConfig {
  type: 'notificationPermission';
  id: string;
  title: string;
  subtitle?: string;
}

interface CameraPermissionStepConfig {
  type: 'cameraPermission';
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
  | AllDoneStepConfig
  | InfoStepConfig
  | InjuryChanceInfoStepConfig
  | PerfectFormGoalMessageStepConfig
  | GraphStepConfig
  | GymChallengeInfoStepConfig
  | NotificationPermissionStepConfig
  | CameraPermissionStepConfig;

export function OnboardingUnifiedScreen({}: OnboardingUnifiedScreenProps) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { onboardingData, updateOnboardingData } = useOnboarding();

  // Global icon configuration
  const iconSize = 24;
  const iconColor = isDark ? '#FFFFFF' : '#000000';

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
        { value: 'build_strength', label: i18n.t('onboarding.trainingReason.buildStrength'), icon: <BicepsFlexed size={iconSize} color={iconColor} /> },
        { value: 'improve_physique', label: i18n.t('onboarding.trainingReason.improvePhysique'), icon: <User size={iconSize} color={iconColor} /> },
        { value: 'prevent_injury', label: i18n.t('onboarding.trainingReason.preventInjury'), icon: <ShieldPlus size={iconSize} color={iconColor} /> },
        { value: 'train_for_sport', label: i18n.t('onboarding.trainingReason.trainForSport'), icon: <Bike size={iconSize} color={iconColor} /> },
        { value: 'stay_active_healthy', label: i18n.t('onboarding.trainingReason.stayActiveHealthy'), icon: <HeartPulse size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'injuryChanceInfo',
      id: 'trainSafer',
      title: i18n.t('onboarding.trainSafer.title'),
    },
    {
      type: 'options',
      id: 'gymChallenge',
      title: i18n.t('onboarding.gymChallenge.title'),
      subtitle: i18n.t('onboarding.gymChallenge.subtitle'),
      preferenceKey: 'gymChallenge',
      options: [
        { value: 'unsure_form', label: i18n.t('onboarding.gymChallenge.unsureForm'), icon: <AudioWaveform size={iconSize} color={iconColor} /> },
        { value: 'no_results', label: i18n.t('onboarding.gymChallenge.noResults'), icon: <ChartNoAxesColumnDecreasing size={iconSize} color={iconColor} /> },
        { value: 'worried_injury', label: i18n.t('onboarding.gymChallenge.worriedInjury'), icon: <ShieldOff size={iconSize} color={iconColor} /> },
        { value: 'struggling_motivation', label: i18n.t('onboarding.gymChallenge.strugglingMotivation'), icon: <BatteryLow size={iconSize} color={iconColor} /> },
        { value: 'other', label: i18n.t('onboarding.gymChallenge.other'), icon: <Ellipsis size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'gymChallengeInfo',
      id: 'gymChallengeInfo',
      title: '',
      subtitle: '',
    },
    {
      type: 'cameraPermission',
      id: 'cameraPermission',
      title: i18n.t('onboarding.cameraPermission.title'),
      subtitle: '',
    },
    {
      type: 'options',
      id: 'workouts',
      title: i18n.t('onboarding.workouts.title'),
      subtitle: i18n.t('onboarding.workouts.subtitle'),
      preferenceKey: 'workoutsPerWeek',
      options: [
        { value: '0-2', label: i18n.t('onboarding.workouts.zeroToTwo'), description: i18n.t('onboarding.workouts.zeroToTwoDescription'), icon: <SingleDotIcon height={iconSize} width={iconSize} color={iconColor} /> },
        { value: '3-5', label: i18n.t('onboarding.workouts.threeToFive'), description: i18n.t('onboarding.workouts.threeToFiveDescription'), icon: <ThreeDotsIcon height={iconSize} width={iconSize} color={iconColor} /> },
        { value: '6+', label: i18n.t('onboarding.workouts.SixPlus'), description: i18n.t('onboarding.workouts.SixPlusDescription'), icon: <SixDotsIcon height={iconSize} width={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'options',
      id: 'lifterType',
      title: i18n.t('onboarding.lifterType.title'),
      subtitle: i18n.t('onboarding.lifterType.subtitle'),
      preferenceKey: 'lifterType',
      options: [
        { value: 'beginner', label: i18n.t('onboarding.lifterType.beginner'), icon: <Sprout size={iconSize} color={iconColor} /> },
        { value: 'intermediate', label: i18n.t('onboarding.lifterType.intermediate'), icon: <Shrub size={iconSize} color={iconColor} /> },
        { value: 'advanced', label: i18n.t('onboarding.lifterType.advanced'), icon: <TreePine size={iconSize} color={iconColor} /> },
        { value: 'returning_after_break', label: i18n.t('onboarding.lifterType.returningAfterBreak'), icon: <ChartNoAxesCombined size={iconSize} color={iconColor} /> },
        { value: 'injury_rehab', label: i18n.t('onboarding.lifterType.injuryRehab'), icon: <Hospital size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'options',
      id: 'perfectFormGoal',
      title: i18n.t('onboarding.perfectFormGoal.title'),
      subtitle: i18n.t('onboarding.perfectFormGoal.subtitle'),
      preferenceKey: 'perfectFormGoal',
      options: [
        { value: 'lift_heavier_safely', label: i18n.t('onboarding.perfectFormGoal.liftHeavierSafely'), icon: <Dumbbell size={iconSize} color={iconColor} /> },
        { value: 'build_muscle_efficiently', label: i18n.t('onboarding.perfectFormGoal.buildMuscleEfficiently'), icon: <BicepsFlexed size={iconSize} color={iconColor} /> },
        { value: 'avoid_injuries', label: i18n.t('onboarding.perfectFormGoal.avoidInjuries'), icon: <ShieldCheck size={iconSize} color={iconColor} /> },
        { value: 'boost_confidence', label: i18n.t('onboarding.perfectFormGoal.boostConfidence'), icon: <ChartNoAxesColumnIncreasing size={iconSize} color={iconColor} /> },
        { value: 'train_longer_without_setbacks', label: i18n.t('onboarding.perfectFormGoal.trainLongerWithoutSetbacks'), icon: <ClockArrowUp size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'perfectFormGoalMessage',
      id: 'perfectFormGoalMessage',
      title: '',
      subtitle: '',
    },
    {
      type: 'options',
      id: 'formConfidence',
      title: i18n.t('onboarding.formConfidence.title'),
      subtitle: i18n.t('onboarding.formConfidence.subtitle'),
      preferenceKey: 'formConfidence',
      options: [
        { value: '0-25', label: i18n.t('onboarding.formConfidence.zeroToTwentyFive'), icon: <BatteryWarning size={iconSize} color={iconColor} /> },
        { value: '25-50', label: i18n.t('onboarding.formConfidence.twentyFiveToFifty'), icon: <BatteryLow size={iconSize} color={iconColor} /> },
        { value: '50-75', label: i18n.t('onboarding.formConfidence.fiftyToSeventyFive'), icon: <BatteryMedium size={iconSize} color={iconColor} /> },
        { value: '75-100', label: i18n.t('onboarding.formConfidence.seventyFiveToHundred'), icon: <BatteryFull size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'options',
      id: 'threeMonthGoal',
      title: i18n.t('onboarding.threeMonthGoal.title'),
      subtitle: i18n.t('onboarding.threeMonthGoal.subtitle'),
      preferenceKey: 'threeMonthGoal',
      options: [
        { value: 'lifting_heavier', label: i18n.t('onboarding.threeMonthGoal.liftingHeavier'), icon: <Weight size={iconSize} color={iconColor} /> },
        { value: 'looking_leaner', label: i18n.t('onboarding.threeMonthGoal.lookingLeaner'), icon: <Scale size={iconSize} color={iconColor} /> },
        { value: 'feeling_stronger_injury_free', label: i18n.t('onboarding.threeMonthGoal.feelingStrongerInjuryFree'), icon: <BicepsFlexed size={iconSize} color={iconColor} /> },
        { value: 'more_consistent', label: i18n.t('onboarding.threeMonthGoal.moreConsistent'), icon: <TrendingUp size={iconSize} color={iconColor} /> },
        { value: 'more_confident', label: i18n.t('onboarding.threeMonthGoal.moreConfident'), icon: <PartyPopper size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'graph',
      id: 'potentialGraph',
      title: i18n.t('onboarding.potentialGraph.title'),
      subtitle: '',
    },
    {
      type: 'options',
      id: 'personalTrainer',
      title: i18n.t('onboarding.personalTrainer.title'),
      subtitle: i18n.t('onboarding.personalTrainer.subtitle'),
      preferenceKey: 'hasPersonalTrainer',
      options: [
        { value: true, label: i18n.t('onboarding.personalTrainer.yes'), icon: <ThumbsUp size={iconSize} color={iconColor} /> },
        { value: false, label: i18n.t('onboarding.personalTrainer.no'), icon: <ThumbsDown size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'injuryChanceInfo',
      id: 'costComparison',
      title: i18n.t('onboarding.costComparison.title'),
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
        { value: 'instagram', label: i18n.t('onboarding.discovery.instagram'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/instagram.png') },
        { value: 'tiktok', label: i18n.t('onboarding.discovery.tiktok'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/tiktok.png') },
        { value: 'facebook', label: i18n.t('onboarding.discovery.facebook'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/fasebook.png') },
        { value: 'twitter', label: i18n.t('onboarding.discovery.twitter'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/x.png') },
        { value: 'google', label: i18n.t('onboarding.discovery.google'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/google.png') },
        { value: 'appStore', label: i18n.t('onboarding.discovery.appStore'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/appstore.png') },
        { value: 'playStore', label: i18n.t('onboarding.discovery.playStore'), iconHeight: 30, iconWidth: 30 , iconImage: require('../../../assets/icons/playstore.png') },
        { value: 'friends', label: i18n.t('onboarding.discovery.friends'), icon: <Users size={iconSize} color={iconColor} /> },
        { value: 'other', label: i18n.t('onboarding.discovery.other'), icon: <BookCopy size={iconSize} color={iconColor} /> },
      ],
    },
    {
      type: 'notificationPermission',
      id: 'notificationPermission',
      title: i18n.t('onboarding.notificationPermission.title'),
      subtitle: '',
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
      title: i18n.t('onboarding.saveProgress.title'),
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

  // Animation values for info step
  const percentageBoxHeight = useMemo(() => new Animated.Value(0), []);
  const formaiBoxHeight = useMemo(() => new Animated.Value(0), []);
  
  // Animation value for finger icon
  const fingerTranslateY = useMemo(() => new Animated.Value(0), []);
  
  // State for confetti animation delay
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAllDoneConfetti, setShowAllDoneConfetti] = useState(false);

  // Helpers for measurements
  const isMetric = onboardingData.unitSystem === 'metric';
  const heightOptions = Array.from({ length: 151 }, (_, i) => 100 + i); // 100-250 cm
  const feetOptions = Array.from({ length: 8 }, (_, i) => 1 + i); // 1-8 feet
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches
  const weightOptions = isMetric
    ? Array.from({ length: 151 }, (_, i) => 40 + i) // 40-190 kg
    : Array.from({ length: 251 }, (_, i) => 90 + i); // 90-340 lbs

  // Repeated picker logic (20 repeats with middle selected by default)
  const repeats = 20;
  const middleRepeatIndex = Math.floor(repeats / 2);

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
    return onboardingData.metricWeight / 0.453592;
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
    if (currentStep.id === 'trainSafer' || currentStep.id === 'costComparison') {
      // Animate boxes growing from 0 height
      Animated.parallel([
        Animated.timing(percentageBoxHeight, {
          toValue: 150,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(formaiBoxHeight, {
          toValue: 50,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Reset animation values when leaving info step
      percentageBoxHeight.setValue(0);
      formaiBoxHeight.setValue(0);
    }
  }, [currentStep.id, percentageBoxHeight, formaiBoxHeight]);

  // Finger animation effect
  useEffect(() => {
    if (currentStep.type === 'notificationPermission' || currentStep.type === 'cameraPermission') {
      const startFingerAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(fingerTranslateY, {
              toValue: -15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(fingerTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      
      startFingerAnimation();
    } else {
      // Reset animation when leaving permission steps
      fingerTranslateY.setValue(0);
    }
  }, [currentStep.type, fingerTranslateY]);

  useEffect(() => {
    if (currentStep.type === 'allDone') {
      hapticFeedback.success();
    }
  }, [currentStep.type]);

  // Confetti animation delay effect
  useEffect(() => {
    if (currentStep.type === 'perfectFormGoalMessage') {
      // Reset confetti state when entering the step
      setShowConfetti(false);
      
      // Start confetti animation after 100ms delay (same as allDone)
      const timer = setTimeout(() => {
        setShowConfetti(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (currentStep.type === 'allDone') {
      // Reset allDone confetti state when entering the step
      setShowAllDoneConfetti(false);
      
      // Start confetti animation after 100ms delay
      const timer = setTimeout(() => {
        setShowAllDoneConfetti(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Hide confetti when leaving the steps
      setShowConfetti(false);
      setShowAllDoneConfetti(false);
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

  function getPerfectFormGoalMessage() {
    const goal = onboardingData.perfectFormGoal;
    switch (goal) {
      case 'lift_heavier_safely':
        return {
          highlighted: i18n.t('onboarding.perfectFormGoalMessage.highlighted.liftHeavierSafely'),
          rest: i18n.t('onboarding.perfectFormGoalMessage.rest'),
        };
      case 'build_muscle_efficiently':
        return {
          highlighted: i18n.t('onboarding.perfectFormGoalMessage.highlighted.buildMuscleEfficiently'),
          rest: i18n.t('onboarding.perfectFormGoalMessage.restRealistic'),
        };
      case 'avoid_injuries':
        return {
          highlighted: i18n.t('onboarding.perfectFormGoalMessage.highlighted.avoidInjuries'),
          rest: i18n.t('onboarding.perfectFormGoalMessage.restFantastic'),
        };
      case 'boost_confidence':
        return {
          highlighted: i18n.t('onboarding.perfectFormGoalMessage.highlighted.boostConfidence'),
          rest: i18n.t('onboarding.perfectFormGoalMessage.restAfter'),
        };
      case 'train_longer_without_setbacks':
        return {
          highlighted: i18n.t('onboarding.perfectFormGoalMessage.highlighted.trainLongerWithoutSetbacks'),
          rest: i18n.t('onboarding.perfectFormGoalMessage.restNormal'),
        };
      default:
        return {
          highlighted: i18n.t('onboarding.perfectFormGoalMessage.highlighted.default'),
          rest: i18n.t('onboarding.perfectFormGoalMessage.restAchievable'),
        };
    }
  }

  function getGymChallengeInfo() {
    const challenge = onboardingData.gymChallenge;
    switch (challenge) {
      case 'no_results':
        return {
          headline: i18n.t('onboarding.gymChallengeInfo.noResults.headline'),
          message: i18n.t('onboarding.gymChallengeInfo.noResults.message'),
          howWeGetYouThere: [
            'Form analysis to ensure every rep counts',
            'Video feedback to spot what\'s holding you back',
            'Accuracy tracking to measure real progress over time'
          ],
        };
      case 'unsure_form':
        return {
          headline: i18n.t('onboarding.gymChallengeInfo.unsureForm.headline'),
          message: i18n.t('onboarding.gymChallengeInfo.unsureForm.message'),
          howWeGetYouThere: [
            'Instant form breakdown from your workout videos',
            'Actionable tips to fix mistakes quickly',
            'Accuracy scoring to track your improvement'
          ],
        };
      case 'worried_injury':
        return {
          headline: i18n.t('onboarding.gymChallengeInfo.worriedInjury.headline'),
          message: i18n.t('onboarding.gymChallengeInfo.worriedInjury.message'),
          howWeGetYouThere: [
            'Video feedback to highlight unsafe positions',
            'Safer technique recommendations tailored to you',
            'Accuracy tracking to ensure long-term consistency'
          ],
        };
      case 'struggling_motivation':
        return {
          headline: i18n.t('onboarding.gymChallengeInfo.strugglingMotivation.headline'),
          message: i18n.t('onboarding.gymChallengeInfo.strugglingMotivation.message'),
          howWeGetYouThere: [
            'Easy-to-read accuracy scores after every workout',
            'Visible improvements with tracked progress trends',
            'Encouraging tips that help you stay consistent'
          ],
        };
      case 'other':
        return {
          headline: i18n.t('onboarding.gymChallengeInfo.other.headline'),
          message: i18n.t('onboarding.gymChallengeInfo.other.message'),
          howWeGetYouThere: [
            'Personalized feedback on your movement videos',
            'Accuracy tracking across different exercise types',
            'Continuous tips and insights to support your goals'
          ],
        };
      default:
        return {
          headline: i18n.t('onboarding.gymChallengeInfo.other.headline'),
          message: i18n.t('onboarding.gymChallengeInfo.other.message'),
          howWeGetYouThere: [
            'Personalized feedback on your movement videos',
            'Accuracy tracking across different exercise types',
            'Continuous tips and insights to support your goals'
          ],
        };
    }
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
  } else if (currentStep.type === 'info') {
    nextDisabled = false; // always enabled for info step
  } else if (currentStep.type === 'gymChallengeInfo') {
    nextDisabled = false; // always enabled for gym challenge info step
  } else if (currentStep.type === 'cameraPermission') {
    nextDisabled = false; // always enabled for camera permission step
  } else if (currentStep.type === 'notificationPermission') {
    nextDisabled = false; // always enabled for notification permission step
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
      hideNextButton={currentStep.type === 'saveProgress' || currentStep.type === 'notificationPermission' || currentStep.type === 'cameraPermission'}
      hideTitle={currentStep.type === 'notificationPermission' || currentStep.type === 'cameraPermission'}
      
    >
      {currentStep.id === 'trainSafer' && (
        <View style={styles.infoStepContainer}>
          <LinearGradient
              colors={['rgba(246, 51, 154, 0.25)', 'rgba(255, 149, 0, 0.25)']}
              locations={[0, 0.9963]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.comparisonCard}
          >
              <View style={styles.comparisonRow}>
                {/* Without FormAI */}
                <View style={styles.comparisonSection}>
                  <View style={styles.whiteBoxContainer}>
                    <Text style={[styles.sectionTitle, { color: '#000000' }]}>
                      {i18n.t('onboarding.trainSafer.withoutFormAI')}
                    </Text>
                        <Animated.View style={[styles.percentageBox, { backgroundColor: '#1d293d', height: percentageBoxHeight }]}>
                        <Text style={[styles.percentageText, { color: '#fff' }]}>
                          60%
                        </Text>
                      </Animated.View>
                  </View>
                </View>

                {/* With FormAI */}
                <View style={styles.comparisonSection}>
                  <View style={styles.whiteBoxContainer}>
                    <Text style={[styles.sectionTitle, { color: '#000000' }]}>
                      {i18n.t('onboarding.trainSafer.withFormAI')}
                    </Text>
                        <Animated.View style={[styles.formaiBox, { backgroundColor: '#000000', height: formaiBoxHeight }]}>
                        <Text style={[styles.formaiText, { color: '#FFFFFF' }]}>
                          3x less
                        </Text>
                      </Animated.View>
                  </View>
                </View>
              </View>

            <Text style={[styles.description, { color: '#ffffff' }]}>
              {i18n.t('onboarding.trainSafer.description')}
            </Text>
          </LinearGradient>
        </View>
      )}

      {currentStep.id === 'costComparison' && (
        <View style={styles.infoStepContainer}>
          <LinearGradient
            colors={['rgba(246, 51, 154, 0.25)', 'rgba(255, 149, 0, 0.25)']}
            locations={[0, 0.9963]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.comparisonCard}
          >
              <View style={styles.comparisonRow}>
                {/* Personal Trainer */}
                <View style={styles.comparisonSection}>
                  <View style={styles.whiteBoxContainer}>
                    <Text style={[styles.sectionTitle, { color: '#000000' }]}>
                      {i18n.t('onboarding.costComparison.personalTrainer')}
                    </Text>
                        <Animated.View style={[styles.percentageBox, { backgroundColor: '#1d293d', height: percentageBoxHeight }]}>
                        <Text style={[styles.percentageText, { color: '#ffffff' }]}>
                          $5000+/yr
                        </Text>
                      </Animated.View>
                  </View>
                </View>

                {/* With FormAI */}
                <View style={styles.comparisonSection}>
                  <View style={styles.whiteBoxContainer}>
                    <Text style={[styles.sectionTitle, { color: '#000000' }]}>
                      {i18n.t('onboarding.costComparison.withFormAI')}
                    </Text>
                        <Animated.View style={[styles.formaiBox, { backgroundColor: '#000000', height: formaiBoxHeight }]}>
                        <Text style={[styles.formaiText, { color: '#FFFFFF' }]}>
                          {i18n.t('onboarding.costComparison.costLess')}
                        </Text>
                      </Animated.View>
                  </View>
                </View>
              </View>

            <Text style={[styles.description, { color: '#ffffff' }]}>
              {i18n.t('onboarding.costComparison.description')}
            </Text>
          </LinearGradient>
        </View>
      )}

      {currentStep.type === 'perfectFormGoalMessage' && (
        <View style={styles.perfectFormGoalMessageContainer}>
          {/* Confetti animation positioned behind content */}
          {showConfetti && (
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../../assets/animations/confetti.json')}
                speed={0.7}
                loop={false}
                autoPlay
                style={styles.confettiAnimation}
              />
            </View>
          )}

          <View style={styles.perfectFormGoalMessageContent}>
            <Text style={[styles.perfectFormGoalMessageTitle]}>
              <Text style={[styles.highlightedText, { color: '#fe9a00' }]}>
                {getPerfectFormGoalMessage().highlighted}
              </Text>
              {getPerfectFormGoalMessage().rest}
            </Text>
            <Text style={[styles.perfectFormGoalMessageSubtitle]}>
              {i18n.t('onboarding.perfectFormGoalMessage.subtitle')}
            </Text>
          </View>
        </View>
      )}

      {currentStep.type === 'gymChallengeInfo' && (
        <ScrollView 
          style={styles.gymChallengeInfoContainer}
          contentContainerStyle={styles.gymChallengeInfoContent}
          showsVerticalScrollIndicator={false}
          bounces
          alwaysBounceVertical={false}
        >
          {/* Main card with headline and message */}
          <LinearGradient
            colors={['rgba(246, 51, 154, 0.25)', 'rgba(255, 149, 0, 0.25)']}
            locations={[0, 0.9963]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gymChallengeInfoCard}
          >
            <Text style={[styles.gymChallengeInfoHeadline, { color: '#ffffff' }]}>
              {getGymChallengeInfo().headline}
            </Text>
            <Text style={[styles.gymChallengeInfoMessage, { color: '#ffffff' }]}>
              {getGymChallengeInfo().message}
            </Text>
          </LinearGradient>

          {/* How we get you there section */}
          <Text style={[styles.howWeGetYouThereTitle]}>
            {i18n.t('onboarding.gymChallengeInfo.howWeGetYouThereTitle')}:
          </Text>

          {/* How we get you there items */}
          {getGymChallengeInfo().howWeGetYouThere.map((item: string, index: number) => (
            <AnimatedInfoCard key={index} delay={index * 100}>
              <View style={styles.howWeGetYouThereCard}>
                <View style={styles.howWeGetYouThereIcon}>
                  <Text style={styles.howWeGetYouThereNumber}>{index + 1}</Text>
                </View>
                <Text style={[styles.howWeGetYouThereItem]}>
                  {item}
                </Text>
              </View>
            </AnimatedInfoCard>
          ))}
        </ScrollView>
      )}

      {currentStep.type === 'graph' && (
        <View style={styles.graphContainer}>
          <LinearGradient
            colors={['rgba(246, 51, 154, 0.25)', 'rgba(255, 149, 0, 0.25)']}
            locations={[0, 0.9963]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.graphGradient}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.graphTitle}>{i18n.t('onboarding.potentialGraph.chartTitle')}</Text>
            </View>
            <LineChart
                data={{
                    labels: ['3 Days', '', '14 Days', '', '30 Days'],
                    datasets: [
                      {
                        key: 'main-dataset',
                        data: [20, 25, 30, 58, 85],
                        color: () => '#000000',
                        strokeWidth: 3,
                      },
                      {
                        key: 'transparent-start',
                        data: [10],
                        withDots: false,
                        color: () => 'transparent',
                        strokeWidth: 0,
                      },
                      {
                        key: 'transparent-end',
                        data: [81],
                        withDots: false,
                        color: () => 'transparent',
                        strokeWidth: 0,
                      },
                    ],
                  }}
                  fromZero={false}
                              width={400}
                height={200}
              withHorizontalLabels={false}
              withInnerLines={false}
              withOuterLines={false}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,  
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => `#ffffff`,
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: '800',
                },
                style: {
                  borderRadius: 16,
                  paddingVertical: 40,
                  marginLeft: 20,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#000000',
                  fill: '#FFFFFF',
                },
                fillShadowGradient: '#ffb86a',
                fillShadowGradientOpacity: 0.6,
                fillShadowGradientFrom: '#ffb86a',
                fillShadowGradientTo: '#e2e8f0',
              }}
              decorator={({ width, height }: { width: number, height: number }) => {
                const lineWidth = width * 0.7; // 70% of chart width
                const startX = (width - lineWidth) / 2; // center horizontally
                return (
                  <Line
                    key="decorator-line"
                    x1={startX}
                    y1={height - 34}   // increased bottom margin
                    x2={startX + lineWidth}
                    y2={height - 34}
                    stroke="black"
                    strokeWidth="1"
                  />
                );
              }}
              renderDotContent={({ x, y, index }) => {
                // Check if this is the last data point (index 4 for the 5th data point)
                if (index === 4) {
                  return (
                    <View 
                      key={`trophy-dot-${index}`}
                      style={[styles.customTrophyDot, { left: x - 18, top: y - 18 }]}
                    >
                      <View style={styles.trophyDotBackground}>
                        <Trophy size={20} color="#FFFFFF" />
                      </View>
                    </View>
                  );
                }
                return null;
              }}
              bezier
              style={styles.chart}
            />
            <Text style={styles.graphSubtitle}>
              {i18n.t('onboarding.potentialGraph.subtitle')}
            </Text>
          </LinearGradient>
        </View>
      )}

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
                  hasIcon={!!(item.icon || item.iconImage)}
                >
                  <View style={currentStep.id === 'language' || currentStep.id === 'units' || currentStep.id === 'gender' ? styles.optionContentRowCentered : styles.optionContentRow}>
                    {item.icon ? (
                      <View style={[
                        styles.optionIconContainer,
                        { backgroundColor: selectedValue === item.value ? '#364153' : '#FFFFFF' }
                      ]}>
                        {React.cloneElement(item.icon as React.ReactElement<any>, {
                          color: selectedValue === item.value ? '#FFFFFF' : iconColor
                        })}
                      </View>
                    ) : item.iconImage ? (
                      <View style={[
                        styles.optionIconContainer,
                        { backgroundColor: selectedValue === item.value ? '#364153' : '#FFFFFF' }
                      ]}>
                        <Image 
                          source={item.iconImage} 
                          style={[
                            styles.optionIconImage,
                            item.iconWidth ? { width: item.iconWidth } : undefined,
                            item.iconHeight ? { height: item.iconHeight } : undefined
                          ] as any} 
                          contentFit="contain" 
                        />
                      </View>
                    ) : null}
                    <View style={currentStep.id === 'language' || currentStep.id === 'units' || currentStep.id === 'gender' ? styles.optionTextContainerCentered : styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: selectedValue === item.value ? '#000' : '#ffffff',
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
                  hasIcon={!!(option.icon || option.iconImage)}
                >
                  <View style={currentStep.id === 'language' || currentStep.id === 'units' || currentStep.id === 'gender' ? styles.optionContentRowCentered : styles.optionContentRow}>
                    {option.icon ? (
                      <View style={[
                        styles.optionIconContainer,
                        { backgroundColor: selectedValue === option.value ? '#364153' : '#FFFFFF' }
                      ]}>
                        {React.cloneElement(option.icon as React.ReactElement<any>, {
                          color: selectedValue === option.value ? '#FFFFFF' : iconColor
                        })}
                      </View>
                    ) : option.iconImage ? (
                      <View style={[
                        styles.optionIconContainer,
                        { backgroundColor: selectedValue === option.value ? '#364153' : '#FFFFFF' }
                      ]}>
                        <Image 
                          source={option.iconImage} 
                          style={[
                            styles.optionIconImage,
                            option.iconWidth ? { width: option.iconWidth } : undefined,
                            option.iconHeight ? { height: option.iconHeight } : undefined
                          ] as any} 
                          contentFit="contain" 
                        />
                      </View>
                    ) : null}
                    <View style={currentStep.id === 'language' || currentStep.id === 'units' || currentStep.id === 'gender' ? styles.optionTextContainerCentered : styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: selectedValue === option.value ? '#00000' : '#FFFFFF',
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
                            { color: selectedValue === option.value ? '#000000' : '#ffffff' },
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
              <Text style={[styles.pickerLabel]}>
                {i18n.t('onboarding.measurements.height')}
              </Text>
              <View style={styles.pickerWrapper}> 
                {isMetric ? (
                  <Picker
                    selectedValue={
                      (() => {
                        const current = getCurrentHeight() as number;
                        const base = 100;
                        const len = heightOptions.length;
                        const idx = Math.max(0, Math.min(len - 1, current - base));
                        return middleRepeatIndex * len + idx;
                      })()
                    }
                    onValueChange={value => {
                      const len = heightOptions.length;
                      const optionIndex = Number(value) % len;
                      const selected = heightOptions[optionIndex];
                      handleHeightSelect(selected);
                    }}
                    style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                    itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                    dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                  >
                    {Array.from({ length: repeats * heightOptions.length }, (_, i) => heightOptions[i % heightOptions.length]).map((height, index) => (
                      <Picker.Item key={`h-${index}`} label={`${height} ${i18n.t('onboarding.measurements.cm')}`} value={index} color={'#ffffff'}/>
                    ))}
                  </Picker>
                ) : (
                  <View style={styles.imperialPickersContainer}>
                    <View style={styles.imperialPickerWrapper}>
                      <Picker
                        selectedValue={
                          (() => {
                            const { feet } = getCurrentHeight() as { feet: number; inches: number };
                            const base = 1;
                            const len = feetOptions.length;
                            const idx = Math.max(0, Math.min(len - 1, feet - base));
                            return middleRepeatIndex * len + idx;
                          })()
                        }
                        onValueChange={value => {
                          const len = feetOptions.length;
                          const optionIndex = Number(value) % len;
                          const selected = feetOptions[optionIndex];
                          handleFeetSelect(selected);
                        }}
                        style={[styles.imperialPicker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                        dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                      >
                        {Array.from({ length: repeats * feetOptions.length }, (_, i) => feetOptions[i % feetOptions.length]).map((feet, index) => (
                          <Picker.Item key={`f-${index}`} label={`${feet} ft`} value={index} color={'#ffffff'} />
                        ))}
                      </Picker>
                    </View>
                    <View style={styles.imperialPickerWrapper}>
                      <Picker
                        selectedValue={
                          (() => {
                            const { inches } = getCurrentHeight() as { feet: number; inches: number };
                            const base = 0;
                            const len = inchesOptions.length;
                            const idx = Math.max(0, Math.min(len - 1, inches - base));
                            return middleRepeatIndex * len + idx;
                          })()
                        }
                        onValueChange={value => {
                          const len = inchesOptions.length;
                          const optionIndex = Number(value) % len;
                          const selected = inchesOptions[optionIndex];
                          handleInchesSelect(selected);
                        }}
                        style={[styles.imperialPicker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                        itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                        dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                      >
                        {Array.from({ length: repeats * inchesOptions.length }, (_, i) => inchesOptions[i % inchesOptions.length]).map((inches, index) => (
                          <Picker.Item key={`i-${index}`} label={`${inches} in`} value={index} color={'#ffffff'} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.measurePickerSection}>
              <Text style={[styles.pickerLabel]}>
                {i18n.t('onboarding.measurements.weight')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={
                    (() => {
                      const current = getCurrentWeight();
                      const base = isMetric ? 40 : 90;
                      const len = weightOptions.length;
                      const idx = Math.max(0, Math.min(len - 1, Math.round(current) - base));
                      return middleRepeatIndex * len + idx;
                    })()
                  }
                  onValueChange={value => {
                    const len = weightOptions.length;
                    const optionIndex = Number(value) % len;
                    const selected = weightOptions[optionIndex];
                    handleWeightSelect(selected);
                  }}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {Array.from({ length: repeats * weightOptions.length }, (_, i) => weightOptions[i % weightOptions.length]).map((weight, index) => (
                    <Picker.Item key={`w-${index}`} label={`${weight} ${isMetric ? i18n.t('onboarding.measurements.kg') : i18n.t('onboarding.measurements.lbs')}`} value={index} color={isDark ? '#FFFFFF' : '#ffffff'} />
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
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={
                    (() => {
                      const month = effectiveBirthDate.month || 1;
                      return middleRepeatIndex * 12 + (month - 1);
                    })()
                  }
                  onValueChange={value => updateBirthDate('month', (Number(value) % 12) + 1)}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {Array.from({ length: repeats * 12 }, (_, i) => months[i % 12]).map((month, index) => (
                    <Picker.Item key={`m-${index}`} label={month} value={index} color={'#ffffff'} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.birthdatePickerSection}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={
                    (() => {
                      const year = effectiveBirthDate.year || currentYear - 25;
                      const month = effectiveBirthDate.month || 1;
                      const day = effectiveBirthDate.day || 1;
                      const maxDays = new Date(year, month, 0).getDate();
                      return middleRepeatIndex * maxDays + (Math.min(day, maxDays) - 1);
                    })()
                  }
                  onValueChange={value => {
                    const year = effectiveBirthDate.year || currentYear - 25;
                    const month = effectiveBirthDate.month || 1;
                    const maxDays = new Date(year, month, 0).getDate();
                    const selectedDay = (Number(value) % maxDays) + 1;
                    updateBirthDate('day', selectedDay);
                  }}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {(() => {
                    const year = effectiveBirthDate.year || currentYear - 25;
                    const month = effectiveBirthDate.month || 1;
                    const maxDays = new Date(year, month, 0).getDate();
                    return Array.from({ length: repeats * maxDays }, (_, i) => (i % maxDays) + 1).map((d, index) => (
                      <Picker.Item key={`d-${index}`} label={String(d)} value={index} color={'#ffffff'} />
                    ));
                  })()}
                </Picker>
              </View>
            </View>
            <View style={styles.birthdatePickerSection}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={
                    (() => {
                      const selectedYear = effectiveBirthDate.year || currentYear - 25;
                      const baseYear = 1950;
                      const yearCount = currentYear - baseYear + 1;
                      const idx = Math.max(0, Math.min(yearCount - 1, selectedYear - baseYear));
                      return middleRepeatIndex * yearCount + idx;
                    })()
                  }
                  onValueChange={value => {
                    const baseYear = 1950;
                    const yearCount = currentYear - baseYear + 1;
                    const selectedYear = baseYear + (Number(value) % yearCount);
                    updateBirthDate('year', selectedYear);
                  }}
                  style={[styles.picker, { color: isDark ? '#FFFFFF' : '#000000' }]}
                  itemStyle={Platform.OS === 'ios' ? { color: isDark ? '#FFFFFF' : '#000000', fontSize: 14 } : undefined}
                  dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                  {(() => {
                    const baseYear = 1950;
                    const yearCount = currentYear - baseYear + 1;
                    return Array.from({ length: repeats * yearCount }, (_, i) => baseYear + (i % yearCount)).map((yearVal, index) => (
                      <Picker.Item key={`y-${index}`} label={String(yearVal)} value={index} color={'#ffffff'} />
                    ));
                  })()}
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
                  style={styles.profileImage as any}
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
                  style={styles.profileImage as any}
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
                  style={styles.profileImage as any}
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
                    <CircleX size={24} color={isDark ? '#FFFFFF' : '#8E8E93'} />
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
          {showAllDoneConfetti && (
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../../../assets/animations/confetti.json')}
                autoPlay
                loop={false}
                speed={0.7}
                style={styles.confettiAnimation}
              />
            </View>
          )}

          <View style={styles.allDoneContent}>
            {/* Header with checkmark and "All done!" text */}
            <View style={styles.header}>
              <CircleCheck size={36} color={'#34C759'} />
              <Text 
                style={[
                  styles.allDoneText
                ]}
              >
                {i18n.t('onboarding.allDone.allDone')}
              </Text>
            </View>

            {/* Main thank you message */}
            <Text 
              style={[
                styles.thankYouText
              ]}
            >
              {i18n.t('onboarding.allDone.thankYou')}
            </Text>

            {/* Privacy message */}
            <Text 
              style={[
                styles.privacyText,
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

      {currentStep.type === 'notificationPermission' && (
        <View style={styles.notificationPermissionContainer}>
          {/* Dialog container with flex to center dialog */}
          <View style={styles.dialogWrapper}>
            {/* Title above the dialog */}
            <Text style={[
              styles.permissionTitle
            ]}>
              {i18n.t('onboarding.notificationPermission.title')}
            </Text>
            {/* iOS-style Notification Permission Dialog */}
            <View style={[
              styles.dialog,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                shadowColor: isDark ? '#000000' : '#000000',
              }
            ]}>
              {/* Text Area */}
              <View style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#f3f4f6',
                }
              ]}>
                <Text style={[
                  styles.dialogText,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}>
                  {i18n.t('onboarding.notificationPermission.dialogText')}
                </Text>
              </View>
              
              {/* Buttons Container */}
              <View style={[
                styles.buttonContainer,
                {
                  borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  borderTopWidth: 1,
                }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.dontAllowButton,
                    {
                      backgroundColor: isDark ? '#2C2C2E' : '#f3f4f6',
                    }
                  ]}
                  onPress={() => {
                    hapticFeedback.selection();
                    handleNext();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                    }
                  ]}>
                    {i18n.t('onboarding.notificationPermission.dontAllow')}
                  </Text>
                </TouchableOpacity>
                
                <View style={[
                  styles.buttonDivider,
                  {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  }
                ]} />
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.allowButton,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#364153',
                    }
                  ]}
                  onPress={async () => {
                    hapticFeedback.selection();
                    try {
                      await Notifications.requestPermissionsAsync();
                      handleNext();
                    } catch (error) {
                      Alert.alert('Permission Error', 'Unable to request notification permissions. You can enable them later in settings.');
                      handleNext();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: isDark ? '#000000' : '#FFFFFF',
                      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                    }
                  ]}>
                    {i18n.t('onboarding.notificationPermission.allow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Animated upwards pointing finger emoji */}
            <Animated.View style={[
              styles.animatedFingerContainer,
              {
                transform: [{ translateY: fingerTranslateY }]
              }
            ]}>
              <Text style={styles.pointingEmoji}>👆</Text>
            </Animated.View>
          </View>
        </View>
      )}

      {currentStep.type === 'cameraPermission' && (
        <View style={styles.cameraPermissionContainer}>
          {/* Dialog container with flex to center dialog */}
          <View style={styles.dialogWrapper}>
            {/* Title above the dialog */}
            <Text style={[
              styles.permissionTitle,
            ]}>
              {i18n.t('onboarding.cameraPermission.title')}
            </Text>
            {/* iOS-style Camera Permission Dialog */}
            <View style={[
              styles.dialog,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                shadowColor: isDark ? '#000000' : '#000000',
              }
            ]}>
              {/* Text Area */}
              <View style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#f3f4f6',
                }
              ]}>
                <Text style={[
                  styles.dialogText,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}>
                  {i18n.t('onboarding.cameraPermission.dialogText')}
                </Text>
              </View>
              
              {/* Buttons Container */}
              <View style={[
                styles.buttonContainer,
                {
                  borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  borderTopWidth: 1,
                }
              ]}>
                <View
                  style={[
                    styles.button,
                    styles.dontAllowButton,
                    {
                      backgroundColor: isDark ? '#2C2C2E' : '#f3f4f6',
                      paddingVertical: 0,
                      marginVertical: 0,
                    }
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                    }
                  ]}>
                    {i18n.t('onboarding.cameraPermission.dontAllow')}
                  </Text>
                </View>
                
                <View style={[
                  styles.buttonDivider,
                  {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  }
                ]} />
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.allowButton,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#364153',
                      paddingVertical: 0,
                      marginVertical: 0,
                    }
                  ]}
                  onPress={async () => {
                    hapticFeedback.selection();
                    try {
                      const { Camera } = await import('expo-camera');
                      const result = await Camera.requestCameraPermissionsAsync();
                      result.granted && handleNext();
                    } catch (error) {}
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: isDark ? '#000000' : '#FFFFFF',
                      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                    }
                  ]}>
                    {i18n.t('onboarding.cameraPermission.allow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Animated upwards pointing finger emoji */}
            <Animated.View style={[
              styles.animatedFingerContainer,
              {
                transform: [{ translateY: fingerTranslateY }]
              }
            ]}>
              <Text style={styles.pointingEmoji}>👆</Text>
            </Animated.View>
          </View>
        </View>
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
  optionContentRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  optionTextContainerCentered: {
    flex: 1,
    alignItems: 'center', // Center text content
  },
  optionIconImage: {
    // Custom dimensions can be overridden by passing specific width/height in the options
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '800',
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
    fontWeight: '800',
    marginBottom: 20,
    color: '#ffffff',
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
  },
  allDoneContent: {
    alignItems: 'center',
    maxWidth: 340,
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
    color: '#ffffff',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
  },
  thankYouText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'

  },
  privacyText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    color: '#ffffff',
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
  optionIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  // Info step styles
  infoStepContainer: {
    marginTop: -30,
    flex: 1,
    justifyContent: 'center',
  },
  whiteBackgroundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comparisonCard: {
    borderRadius: 20,
    padding: 24,
  },
  whiteBoxContainer: {
    height: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  comparisonSection: {
    flex: 1,
    alignItems: 'center',
  },
  sectionTitle: {
    paddingTop: 10,
    width: 80,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  percentageBox: {
    width: 125,
    height: 150,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    marginTop: 'auto',
    marginBottom: -2,
    marginHorizontal: -2,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formaiBox: {
    width: 125,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    marginTop: 'auto',
    marginBottom: -2,
    marginHorizontal: -2,
  },
  formaiText: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 17,
    fontWeight: '600',  
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  // Perfect form goal message styles
  perfectFormGoalMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  perfectFormGoalMessageContent: {
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    zIndex: 2,
    position: 'relative',
  },
  perfectFormGoalMessageTitle: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 44,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    width: '100%',
  },
  perfectFormGoalMessageSubtitle: {
    width: '80%',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  highlightedText: {
    fontWeight: '800',
  },
  // Graph styles
  graphContainer: {
    marginTop: -40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 350,
    position: 'relative',
  },
  chart: {
    borderRadius: 16,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  graphTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: 16,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  graphSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    lineHeight: 22,
  },
  trophyContainer: {
    position: 'absolute',
    top: '5%',
    right: '10%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  trophyIcon: {
    fontSize: 16,
  },
  customTrophyDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  trophyDotBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fe9a00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gym challenge info styles
  gymChallengeInfoContainer: {
    marginTop: -50,
    flex: 1,
  },
  gymChallengeInfoContent: {
    paddingTop: 0,
    gap: 8,
    paddingBottom: 20,
  },
  gymChallengeInfoCard: {
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  gymChallengeInfoHeadline: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  gymChallengeInfoMessage: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  howWeGetYouThereTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'left',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  howWeGetYouThereCard: {
    backgroundColor: '#1d293d',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 22,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  howWeGetYouThereIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  howWeGetYouThereNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  howWeGetYouThereItem: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flex: 1,
  },
  // Notification permission styles
  notificationPermissionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Camera permission styles
  cameraPermissionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 38,
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  notificationPermissionTitle: {
    fontSize: 32,
    marginTop: 60,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  dialogWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  textArea: {
    padding: 24,
    paddingBottom: 20,
  },
  dialogText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 44,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAllowButton: {
    // Styled above
  },
  allowButton: {
    // Styled above
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDivider: {
    width: 1,
    height: '100%',
  },
  pointingEmoji: {
    fontSize: 40,
  },
  animatedFingerContainer: {
    marginTop: 20,
    marginLeft: '55%',
  },
}); 