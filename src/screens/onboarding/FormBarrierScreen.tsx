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
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill={color}>
    <Path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
    <Path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
  </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill={color}>
    <Path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
    <Path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill={color}>
    <Path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
  </Svg>
);

const OtherIcon = ({ color }: { color: string }) => (
  <Svg width={31.2} height={31.2} viewBox="0 0 24 24" fill={color}>
    <Path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 8.625a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM15.375 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
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
    height: 60,
    borderRadius: 12,
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
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 12, // Add space between icon and text
  },
}); 