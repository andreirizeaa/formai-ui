import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { RulerPicker } from 'react-native-ruler-picker';
import i18n from '../../../../utils/i18n';

interface EditCurrentWeightScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditCurrentWeightScreen({ onBack, currentValue, onSave }: EditCurrentWeightScreenProps) {
  const [isMetric, setIsMetric] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(60); // Default 60kg

  // Parse current value to determine initial state
  React.useEffect(() => {
    if (currentValue) {
      const weightMatch = currentValue.match(/(\d+(?:\.\d+)?)/);
      if (weightMatch) {
        const weight = parseFloat(weightMatch[1]);
        if (currentValue.includes('lbs')) {
          setIsMetric(false);
          setSelectedWeight(weight);
        } else {
          setIsMetric(true);
          setSelectedWeight(weight);
        }
      }
    }
  }, [currentValue]);

  const handleUnitSystemChange = (value: boolean) => {
    setIsMetric(value);
    // Convert weight when switching units
    if (value) {
      // Convert lbs to kg
      setSelectedWeight(Math.round(selectedWeight * 0.453592));
    } else {
      // Convert kg to lbs
      setSelectedWeight(Math.round(selectedWeight / 0.453592));
    }
  };

  const handleWeightChange = (weight: string | number) => {
    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    setSelectedWeight(numWeight);
  };

  const handleSave = () => {
    const unit = isMetric ? 'kg' : 'lbs';
    const formattedWeight = isMetric ? selectedWeight.toFixed(1) : selectedWeight.toString();
    onSave(`${formattedWeight} ${unit}`);
  };

  // Generate weight options
  const weightOptions = isMetric
    ? Array.from({ length: 151 }, (_, i) => 40 + i) // 40-190 kg
    : Array.from({ length: 251 }, (_, i) => 90 + i); // 90-340 lbs

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
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

        {/* Ruler Picker */}
        <View style={styles.rulerContainer}>
          <RulerPicker
            min={isMetric ? 40 : 90}
            max={isMetric ? 190 : 340}
            step={isMetric ? 0.1 : 1}
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
  rulerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
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