import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import Svg, { Path } from 'react-native-svg';

interface FormBarrierScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Icon components
const MoneyIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill="none">
    <Path 
      stroke={color} 
      strokeWidth={1.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
  </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill="none">
    <Path 
      stroke={color} 
      strokeWidth={1.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" 
    />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill="none">
    <Path 
      stroke={color} 
      strokeWidth={1.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
  </Svg>
);

const OtherIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill="none">
    <Path 
      stroke={color} 
      strokeWidth={1.5} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
  </Svg>
);

export function FormBarrierScreen({ onNext, onBack }: FormBarrierScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const formBarrierOptions = [
    { 
      key: 'expensive_trainers', 
      label: i18n.t('formBarrier.expensiveTrainers'),
      icon: MoneyIcon
    },
    { 
      key: 'gym_advice_scary', 
      label: i18n.t('formBarrier.gymAdviceScary'),
      icon: ChatIcon
    },
    { 
      key: 'no_time', 
      label: i18n.t('formBarrier.noTime'),
      icon: ClockIcon
    },
    { 
      key: 'other', 
      label: i18n.t('formBarrier.other'),
      icon: OtherIcon
    },
  ] as const;

  const handleFormBarrierSelect = (barrier: 'expensive_trainers' | 'gym_advice_scary' | 'no_time' | 'other') => {
    updatePreference('formBarrier', barrier);
  };

  const handleNext = () => {
    if (preferences.formBarrier) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('formBarrier.title')}
      subtitle={i18n.t('formBarrier.subtitle')}
      currentStep={10}
      totalSteps={12}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.formBarrier}
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
        {formBarrierOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = preferences.formBarrier === option.key;
          const iconColor = isSelected 
            ? '#FFFFFF' 
            : (isDark ? '#FFFFFF' : '#000000');
          
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.formBarrierButton,
                {
                  backgroundColor: isSelected
                    ? '#000000'  // Black background when selected
                    : 'transparent',
                  borderColor: isSelected
                    ? '#000000'  // Black border when selected
                    : (isDark ? '#2C2C2E' : '#E5E5EA'),
                }
              ]}
              onPress={() => handleFormBarrierSelect(option.key)}
              activeOpacity={0.7}
            >
              <View style={styles.formBarrierContent}>
                <IconComponent color={iconColor} />
                <Text 
                  style={[
                    styles.formBarrierLabel,
                    { 
                      color: isSelected
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
          );
        })}
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
  formBarrierButton: {
    height: 65,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to the left
    paddingHorizontal: 16,
  },
  formBarrierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the left
  },
  formBarrierLabel: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12, // Add space between icon and text
  },
}); 