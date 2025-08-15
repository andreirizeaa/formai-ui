import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon } from '../../../components/icons/icons';
import { useColorScheme } from 'react-native';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { useUserDetails } from '../../../context/UserDetailsContext';

interface UnitsDetailsScreenProps {
  onBack: () => void;
}

export function UnitsDetailsScreen({ onBack }: UnitsDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userDetails, updateUnitSystem } = useUserDetails();
  const selectedUnit = userDetails.unitSystem;

  const handleUnitSelect = (unitSystem: 'metric' | 'imperial') => {
    hapticFeedback.selection();
    updateUnitSystem(unitSystem);
  };

  const handleSave = () => {
    hapticFeedback.success();
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <BackIcon width={24} height={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('settings.units')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Units Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: selectedUnit === 'metric'
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: selectedUnit === 'metric'
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleUnitSelect('metric')}
            activeOpacity={0.7}
          >
            <View style={styles.unitContent}>
              <Text 
                style={[
                  styles.unitName,
                  { 
                    color: selectedUnit === 'metric'
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {i18n.t('onboarding.units.metric')}
              </Text>
              <Text style={styles.unitDescription}>
                {i18n.t('onboarding.units.metricDescription')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.unitButton,
              {
                backgroundColor: selectedUnit === 'imperial'
                  ? '#000000'  // Black background when selected
                  : 'transparent',
                borderColor: selectedUnit === 'imperial'
                  ? '#000000'  // Black border when selected
                  : (isDark ? '#2C2C2E' : '#E5E5EA'),
              }
            ]}
            onPress={() => handleUnitSelect('imperial')}
            activeOpacity={0.7}
          >
            <View style={styles.unitContent}>
              <Text 
                style={[
                  styles.unitName,
                  { 
                    color: selectedUnit === 'imperial'
                      ? '#FFFFFF'  // White text when selected
                      : (isDark ? '#FFFFFF' : '#000000'),
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}
              >
                {i18n.t('onboarding.units.imperial')}
              </Text>
              <Text style={styles.unitDescription}>
                {i18n.t('onboarding.units.imperialDescription')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button - Stuck to bottom */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>{i18n.t('settings.save')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  unitButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  unitContent: {
    alignItems: 'center',
  },
  unitName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  unitDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 