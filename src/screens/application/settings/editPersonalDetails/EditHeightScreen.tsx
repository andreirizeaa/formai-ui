import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { 
  parseHeightToMetric, 
  convertMetricHeightToImperial, 
  convertImperialHeightToMetric 
} from '../../../../utils/unitConversions';
import { editUserDetails } from '../../../../services/userService';
import { ChevronLeft } from 'lucide-react-native';

interface EditHeightScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditHeightScreen({ onBack, currentValue, onSave }: EditHeightScreenProps) {
  const { userDetails, updateHeight, refetchUserDetails } = useUserDetails();
  const unitSystem = userDetails?.unitSystem ?? 'metric';
  const isMetric = unitSystem === 'metric';
  const [selectedHeight, setSelectedHeight] = useState(170); // Default 170cm
  const [selectedFeet, setSelectedFeet] = useState(5); // Default 5 feet
  const [selectedInches, setSelectedInches] = useState(7); // Default 7 inches
  const [isSaving, setIsSaving] = useState(false);

  // Parse current value to determine initial state
  React.useEffect(() => {
    if (currentValue) {
      // Parse the current height string to get the metric value
      const heightCm = parseHeightToMetric(currentValue);
      
      if (isMetric) {
        setSelectedHeight(heightCm);
      } else {
        // Convert to feet/inches for imperial display
        const { feet, inches } = convertMetricHeightToImperial(heightCm);
        setSelectedFeet(feet);
        setSelectedInches(inches);
      }
    }
  }, [currentValue, isMetric]);

  const handleHeightChange = (height: number) => {
    setSelectedHeight(height);
  };

  const handleFeetChange = (feet: number) => {
    setSelectedFeet(feet);
  };

  const handleInchesChange = (inches: number) => {
    setSelectedInches(inches);
  };

  const handleSave = async () => {
    if (isSaving) return;
    hapticFeedback.selection();
    setIsSaving(true);
    
    let heightCm: number;
    let displayValue: string;
    
    if (isMetric) {
      heightCm = selectedHeight;
      displayValue = `${Math.round(heightCm)} ${i18n.t('onboarding.measurements.cm')}`;
    } else {
      // Convert feet/inches to cm for storage
      heightCm = convertImperialHeightToMetric(selectedFeet, selectedInches);
      displayValue = `${selectedFeet}' ${selectedInches}"`;
    }
    
    try {
      await editUserDetails({ height: heightCm });
      updateHeight(heightCm);
      await refetchUserDetails();
      hapticFeedback.success();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to update height', e);
    }
    
    setIsSaving(false);
    onSave(displayValue);
  };

  // Generate height options
  const heightOptions = Array.from({ length: 151 }, (_, i) => 100 + i); // 100-250 cm
  const feetOptions = Array.from({ length: 8 }, (_, i) => 1 + i); // 1-8 feet
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            hapticFeedback.selection();
            onBack();
          }}
        >
          <ChevronLeft width={24} height={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('personalDetails.editHeight')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Height Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>
            {i18n.t('onboarding.measurements.height')}
          </Text>
          <View style={styles.pickerWrapper}>
            {isMetric ? (
              // Single picker for metric
              <Picker
                selectedValue={selectedHeight}
                onValueChange={(value) => value && handleHeightChange(value)}
                style={styles.picker}
                itemStyle={Platform.OS === 'ios' ? { fontSize: 16 } : undefined}
              >
                {heightOptions.map(height => (
                  <Picker.Item 
                    key={height} 
                    label={`${height} ${i18n.t('onboarding.measurements.cm')}`} 
                    value={height}
                  />
                ))}
              </Picker>
            ) : (
              // Two pickers for imperial
              <View style={styles.imperialPickersContainer}>
                <View style={styles.imperialPickerWrapper}>
                  <Picker
                    selectedValue={selectedFeet}
                    onValueChange={(value) => value && handleFeetChange(value)}
                    style={styles.imperialPicker}
                    itemStyle={Platform.OS === 'ios' ? { fontSize: 16 } : undefined}
                  >
                    {feetOptions.map(feet => (
                      <Picker.Item 
                        key={feet} 
                        label={`${feet} ft`} 
                        value={feet}
                      />
                    ))}
                  </Picker>
                </View>
                <View style={styles.imperialPickerWrapper}>
                  <Picker
                    selectedValue={selectedInches}
                    onValueChange={(value) => value && handleInchesChange(value)}
                    style={styles.imperialPicker}
                    itemStyle={Platform.OS === 'ios' ? { fontSize: 16 } : undefined}
                  >
                    {inchesOptions.map(inches => (
                      <Picker.Item 
                        key={inches} 
                        label={`${inches} in`} 
                        value={inches}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.saveButton, isSaving && { opacity: 0.7 }]} onPress={handleSave} activeOpacity={0.8} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{i18n.t('settings.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 40,
  },
  pickerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
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
    justifyContent: 'space-around',
    width: '100%',
    gap: 30,
  },
  imperialPickerWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  imperialPickerLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginBottom: 15,
  },
  imperialPicker: {
    height: Platform.OS === 'ios' ? 280 : 80,
    width: 120,
    minWidth: 80,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 