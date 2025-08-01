import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Switch } from 'react-native';
import { useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';

interface MeasurementsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function MeasurementsScreen({ onNext, onBack }: MeasurementsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();
  
  const isMetric = preferences.unitSystem === 'metric';

  // Set default values if not already set
  React.useEffect(() => {
    if (!preferences.height) {
      updatePreference('height', 170); // Default to 170cm
    }
    if (!preferences.weight) {
      updatePreference('weight', 60); // Default to 60kg
    }
  }, []);

  const handleUnitSystemChange = (value: boolean) => {
    const system = value ? 'metric' : 'imperial';
    updatePreference('unitSystem', system);
    
    // Set appropriate default values for the new system
    if (system === 'metric') {
      updatePreference('height', 170); // 170cm
      updatePreference('weight', 60);  // 60kg
    } else {
      updatePreference('height', 67 * 2.54); // 67 inches converted to cm
      updatePreference('weight', 130 * 0.453592); // 130 lbs converted to kg
    }
  };

  const handleHeightSelect = (height: number) => {
    updatePreference('height', isMetric ? height : height * 2.54); // Convert to cm if imperial
  };

  const handleWeightSelect = (weight: number) => {
    updatePreference('weight', isMetric ? weight : weight * 0.453592); // Convert to kg if imperial
  };

  const handleNext = () => {
    if (preferences.height && preferences.weight) {
      onNext();
    }
  };

  const textColor = isDark ? '#FFFFFF' : '#000000';

  // Generate height options
  const heightOptions = isMetric 
    ? Array.from({ length: 151 }, (_, i) => 100 + i) // 100-250 cm
    : Array.from({ length: 60 }, (_, i) => 39 + i); // 39-98 inches (approximately 100-250cm)

  // Generate weight options
  const weightOptions = isMetric
    ? Array.from({ length: 151 }, (_, i) => 40 + i) // 40-190 kg
    : Array.from({ length: 251 }, (_, i) => 90 + i); // 90-340 lbs

  const getCurrentHeight = () => {
    if (!preferences.height) return isMetric ? 170 : 67;
    if (isMetric) return preferences.height;
    return Math.round(preferences.height / 2.54); // Convert cm to inches
  };

  const getCurrentWeight = () => {
    if (!preferences.weight) return isMetric ? 60 : 130;
    if (isMetric) return preferences.weight;
    return Math.round(preferences.weight / 0.453592); // Convert kg to lbs
  };

  return (
    <OnboardingLayout
      title={i18n.t('measurements.title')}
      subtitle={i18n.t('measurements.subtitle')}
      currentStep={7}
      totalSteps={12}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!preferences.height || !preferences.weight}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        <View style={styles.mainContent}>
          {/* Unit System Toggle */}
          <View style={styles.unitToggleContainer}>
            <Text style={[styles.unitLabel, { color: textColor }]}>
              {i18n.t('measurements.imperial')}
            </Text>
            <Switch
              value={isMetric}
              onValueChange={handleUnitSystemChange}
              trackColor={{ 
                false: isDark ? '#39393D' : '#767577', 
                true: '#000000' 
              }}
              thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
              ios_backgroundColor={isDark ? '#39393D' : '#767577'}
              style={styles.switch}
            />
            <Text style={[styles.unitLabel, { color: textColor }]}>
              {i18n.t('measurements.metric')}
            </Text>
          </View>

          {/* Pickers Row */}
          <View style={styles.pickersRow}>
            {/* Height Picker */}
            <View style={styles.pickerSection}>
              <Text style={[styles.pickerLabel, { color: textColor }]}>
                {i18n.t('measurements.height')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={getCurrentHeight()}
                  onValueChange={(value) => value && handleHeightSelect(value)}
                  style={[styles.picker, { color: textColor }]}
                  itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                  dropdownIconColor={textColor}
                >
                  {heightOptions.map(height => (
                    <Picker.Item 
                      key={height} 
                      label={`${height} ${isMetric ? i18n.t('measurements.cm') : i18n.t('measurements.in')}`} 
                      value={height}
                      color={textColor}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Weight Picker */}
            <View style={styles.pickerSection}>
              <Text style={[styles.pickerLabel, { color: textColor }]}>
                {i18n.t('measurements.weight')}
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={getCurrentWeight()}
                  onValueChange={(value) => value && handleWeightSelect(value)}
                  style={[styles.picker, { color: textColor }]}
                  itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                  dropdownIconColor={textColor}
                >
                  {weightOptions.map(weight => (
                    <Picker.Item 
                      key={weight} 
                      label={`${weight} ${isMetric ? i18n.t('measurements.kg') : i18n.t('measurements.lbs')}`} 
                      value={weight}
                      color={textColor}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    marginTop: 20,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  unitLabel: {
    fontSize: 28,
    fontWeight: '600',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  pickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
  },
  pickerSection: {
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
}); 