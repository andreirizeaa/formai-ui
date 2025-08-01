import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Switch } from 'react-native';
import { useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

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
    hapticFeedback.selection();
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

  const handleFeetSelect = (feet: number) => {
    const currentHeight = preferences.height || 170;
    const totalInches = Math.round(currentHeight / 2.54); // Convert current cm to inches
    const currentInches = totalInches % 12;
    const newTotalInches = feet * 12 + currentInches;
    updatePreference('height', newTotalInches * 2.54); // Convert back to cm
  };

  const handleInchesSelect = (inches: number) => {
    const currentHeight = preferences.height || 170;
    const totalInches = Math.round(currentHeight / 2.54); // Convert current cm to inches
    const currentFeet = Math.floor(totalInches / 12);
    const newTotalInches = currentFeet * 12 + inches;
    updatePreference('height', newTotalInches * 2.54); // Convert back to cm
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
  const heightOptions = Array.from({ length: 151 }, (_, i) => 100 + i); // 100-250 cm
  const feetOptions = Array.from({ length: 8 }, (_, i) => 1 + i); // 1-8 feet
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

  // Generate weight options
  const weightOptions = isMetric
    ? Array.from({ length: 151 }, (_, i) => 40 + i) // 40-190 kg
    : Array.from({ length: 251 }, (_, i) => 90 + i); // 90-340 lbs

  const getCurrentHeight = () => {
    if (!preferences.height) return isMetric ? 170 : { feet: 5, inches: 7, totalInches: 67 };
    if (isMetric) return preferences.height;
    const totalInches = Math.round(preferences.height / 2.54); // Convert cm to inches
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet, inches, totalInches };
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
                {isMetric ? (
                  // Single picker for metric
                  <Picker
                    selectedValue={getCurrentHeight() as number}
                    onValueChange={(value) => value && handleHeightSelect(value)}
                    style={[styles.picker, { color: textColor }]}
                    itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                    dropdownIconColor={textColor}
                  >
                    {heightOptions.map(height => (
                      <Picker.Item 
                        key={height} 
                        label={`${height} ${i18n.t('measurements.cm')}`} 
                        value={height}
                        color={textColor}
                      />
                    ))}
                  </Picker>
                ) : (
                  // Two pickers for imperial
                  <View style={styles.imperialPickersContainer}>
                    <View style={styles.imperialPickerWrapper}>
                      <Picker
                        selectedValue={(getCurrentHeight() as { feet: number }).feet}
                        onValueChange={(value) => value && handleFeetSelect(value)}
                        style={[styles.imperialPicker, { color: textColor }]}
                        itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                        dropdownIconColor={textColor}
                      >
                        {feetOptions.map(feet => (
                          <Picker.Item 
                            key={feet} 
                            label={`${feet} ft`} 
                            value={feet}
                            color={textColor}
                          />
                        ))}
                      </Picker>
                    </View>
                    <View style={styles.imperialPickerWrapper}>
                      <Picker
                        selectedValue={(getCurrentHeight() as { inches: number }).inches}
                        onValueChange={(value) => value && handleInchesSelect(value)}
                        style={[styles.imperialPicker, { color: textColor }]}
                        itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                        dropdownIconColor={textColor}
                      >
                        {inchesOptions.map(inches => (
                          <Picker.Item 
                            key={inches} 
                            label={`${inches} in`} 
                            value={inches}
                            color={textColor}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}
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
  imperialPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  imperialPicker: {
    height: Platform.OS === 'ios' ? 280 : 80,
    width: 90,
    minWidth: 80,
  },
}); 