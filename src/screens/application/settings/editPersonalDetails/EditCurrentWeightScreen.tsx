import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { RulerPicker } from 'react-native-ruler-picker';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { editUserDetails } from '../../../../services/userService';
import { 
  parseWeightToMetric, 
  convertMetricWeightToImperial, 
  convertImperialWeightToMetric 
} from '../../../../utils/unitConversions';
import { ChevronLeft } from 'lucide-react-native';

interface EditCurrentWeightScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditCurrentWeightScreen({ onBack, currentValue, onSave }: EditCurrentWeightScreenProps) {
  const { userDetails, refetchUserDetails } = useUserDetails();
  const unitSystem = userDetails?.unitSystem ?? 'metric';
  const isMetric = unitSystem === 'metric';
  const [selectedWeight, setSelectedWeight] = useState(60);
  const [isSaving, setIsSaving] = useState(false);
  const didMount = useRef(false);

  // Set didMount after first render
  useEffect(() => {
    didMount.current = true;
  }, []);

  // Update initial state when currentValue or unit system changes
  useEffect(() => {
    if (!currentValue) return;

    const weightKg = parseWeightToMetric(currentValue);
    const imperialWeight = convertMetricWeightToImperial(weightKg);
    
    // For metric, preserve decimal precision; for imperial, round to whole numbers
    const initialValue = isMetric ? weightKg : Math.round(imperialWeight);
    setSelectedWeight(initialValue);

    // IMPORTANT: reset didMount so that onValueChange doesn't fire right away
    didMount.current = false;

    // Re-enable updates after a tick
    const timer = setTimeout(() => {
      didMount.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [currentValue, isMetric]);

  const handleWeightChange = (weight: string | number) => {
    if (!didMount.current) return;

    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    setSelectedWeight(numWeight);
  };

  const handleSave = async () => {
    if (isSaving) return;
    hapticFeedback.selection();
    setIsSaving(true);

    const weightKg = isMetric ? selectedWeight : convertImperialWeightToMetric(selectedWeight);

    try {
      await editUserDetails({ weight: weightKg });
      await refetchUserDetails();
      hapticFeedback.success();

      const unit = isMetric ? 'kg' : 'lbs';
      // For metric, show 1 decimal place; for imperial, show whole numbers
      const displayValue = isMetric 
        ? `${Number(weightKg.toFixed(1))} ${unit}`
        : `${Math.round(selectedWeight)} ${unit}`;

      onSave(displayValue);
    } catch (e) {
      hapticFeedback.error();
      Alert.alert(i18n.t('settings.editFailed.currentWeight'), i18n.t('settings.editFailed.message'), [
        { text: 'Ok', onPress: () => hapticFeedback.selection() },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

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
        <Text style={styles.headerTitle}>{i18n.t('personalDetails.editCurrentWeight')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.rulerContainer}>
          <RulerPicker
            min={isMetric ? 30 : 90}
            max={isMetric ? 300 : 340}
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
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSaving}
        >
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
    fontWeight: '400',
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