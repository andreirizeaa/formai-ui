import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path } from 'react-native-svg';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';

interface EditHeightScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditHeightScreen({ onBack, currentValue, onSave }: EditHeightScreenProps) {
  const [isMetric, setIsMetric] = useState(true);
  const [selectedHeight, setSelectedHeight] = useState(170); // Default 170cm
  const [selectedFeet, setSelectedFeet] = useState(5); // Default 5 feet
  const [selectedInches, setSelectedInches] = useState(7); // Default 7 inches

  // Parse current value to determine initial state
  React.useEffect(() => {
    if (currentValue) {
      const heightMatch = currentValue.match(/(\d+(?:\.\d+)?)/);
      if (heightMatch) {
        const height = parseFloat(heightMatch[1]);
        if (currentValue.includes('"') || currentValue.includes("'")) {
          setIsMetric(false);
          // Parse feet and inches from format like "5' 7""
          const feetMatch = currentValue.match(/(\d+)'/);
          const inchesMatch = currentValue.match(/(\d+)"/);
          if (feetMatch) setSelectedFeet(parseInt(feetMatch[1]));
          if (inchesMatch) setSelectedInches(parseInt(inchesMatch[1]));
        } else {
          setIsMetric(true);
          setSelectedHeight(height);
        }
      }
    }
  }, [currentValue]);

  const handleUnitSystemChange = (value: boolean) => {
    hapticFeedback.selection();
    setIsMetric(value);
    // Convert height when switching units
    if (value) {
      // Convert feet/inches to cm
      const totalInches = selectedFeet * 12 + selectedInches;
      setSelectedHeight(Math.round(totalInches * 2.54)); // Convert inches to cm
    } else {
      // Convert cm to feet/inches
      const totalInches = Math.round(selectedHeight / 2.54); // Convert cm to inches
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      setSelectedFeet(feet);
      setSelectedInches(inches);
    }
  };

  const handleHeightChange = (height: number) => {
    setSelectedHeight(height);
  };

  const handleFeetChange = (feet: number) => {
    setSelectedFeet(feet);
  };

  const handleInchesChange = (inches: number) => {
    setSelectedInches(inches);
  };

  const handleSave = () => {
    hapticFeedback.success();
    if (isMetric) {
      onSave(`${selectedHeight} ${i18n.t('measurements.cm')}`);
    } else {
      onSave(`${selectedFeet}' ${selectedInches}"`);
    }
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
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
              stroke="#000000"
              strokeWidth={2}
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('personalDetails.editHeight')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Unit System Toggle */}
        <View style={styles.unitToggleContainer}>
          <Text style={styles.unitLabel}>
            {i18n.t('measurements.imperial')}
          </Text>
          <Switch
            value={isMetric}
            onValueChange={handleUnitSystemChange}
            trackColor={{ 
              false: '#767577', 
              true: '#000000' 
            }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#767577"
            style={styles.switch}
          />
          <Text style={styles.unitLabel}>
            {i18n.t('measurements.metric')}
          </Text>
        </View>

        {/* Height Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>
            {i18n.t('measurements.height')}
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
                    label={`${height} ${i18n.t('measurements.cm')}`} 
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>{i18n.t('settings.save')}</Text>
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
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  unitLabel: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
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