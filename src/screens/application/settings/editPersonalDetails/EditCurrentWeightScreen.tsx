import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RulerPicker } from 'react-native-ruler-picker';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { 
  parseWeightToMetric, 
  convertMetricWeightToImperial, 
  convertImperialWeightToMetric 
} from '../../../../utils/unitConversions';

interface EditCurrentWeightScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditCurrentWeightScreen({ onBack, currentValue, onSave }: EditCurrentWeightScreenProps) {
  const { userDetails } = useUserDetails();
  const isMetric = userDetails.unitSystem === 'metric';
  const [selectedWeight, setSelectedWeight] = useState(60); // Default 60kg

  // Parse current value to determine initial state
  React.useEffect(() => {
    if (currentValue) {
      // Parse the current weight string to get the metric value
      const weightKg = parseWeightToMetric(currentValue);
      
      // Convert to display units based on user's preference
      if (isMetric) {
        setSelectedWeight(weightKg);
      } else {
        setSelectedWeight(convertMetricWeightToImperial(weightKg));
      }
    }
  }, [currentValue, isMetric]);

  const handleWeightChange = (weight: string | number) => {
    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    setSelectedWeight(numWeight);
  };

  const handleSave = () => {
    hapticFeedback.success();
    
    // Convert to metric for storage
    const weightKg = isMetric ? selectedWeight : convertImperialWeightToMetric(selectedWeight);
    
    // Format for display based on user's unit system
    const unit = isMetric ? 'kg' : 'lbs';
    const formattedWeight = isMetric ? Math.round(weightKg) : Math.round(selectedWeight);
    const displayValue = `${formattedWeight} ${unit}`;
    
    onSave(displayValue);
  };

  // Generate weight options based on unit system
  const weightOptions = isMetric
    ? Array.from({ length: 151 }, (_, i) => 40 + i) // 40-190 kg
    : Array.from({ length: 251 }, (_, i) => 90 + i); // 90-340 lbs

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
        <Text style={styles.headerTitle}>{i18n.t('personalDetails.editCurrentWeight')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Ruler Picker */}
        <View style={styles.rulerContainer}>
          <RulerPicker
            min={isMetric ? 40 : 90}
            max={isMetric ? 190 : 340}
            step={isMetric ? 1 : 1}
            unit={isMetric ? 'kg' : 'lbs'}
            initialValue={selectedWeight}
            onValueChange={handleWeightChange}
            onValueChangeEnd={handleWeightChange}
            width={350}
            height={100}
          />
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
    bottom: 12,
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
  },
  rulerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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