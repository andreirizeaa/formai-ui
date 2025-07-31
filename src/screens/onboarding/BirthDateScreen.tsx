import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import { useOnboarding } from '../../context/OnboardingContext';
import i18n from '../../utils/i18n';

interface BirthDateScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function BirthDateScreen({ onNext, onBack }: BirthDateScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, updatePreference } = useOnboarding();

  const currentYear = new Date().getFullYear();
  const birthDate = preferences.birthDate || { month: null, day: null, year: null };

  // Set default birth date if not already set
  React.useEffect(() => {
    if (!preferences.birthDate || (!preferences.birthDate.month && !preferences.birthDate.day && !preferences.birthDate.year)) {
      updatePreference('birthDate', {
        month: 7,  // July
        day: 15,   // 15th
        year: currentYear - 25 // 25 years ago
      });
    }
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const updateBirthDate = (field: 'month' | 'day' | 'year', value: number | null) => {
    const updatedBirthDate = {
      ...birthDate,
      [field]: value,
    };
    
    // If changing month or year, validate the day
    if (field === 'month' || field === 'year') {
      if (updatedBirthDate.month && updatedBirthDate.year && updatedBirthDate.day) {
        const maxDays = getDaysInMonth(updatedBirthDate.month, updatedBirthDate.year);
        if (updatedBirthDate.day > maxDays) {
          updatedBirthDate.day = maxDays;
        }
      }
    }
    
    updatePreference('birthDate', updatedBirthDate);
  };

  const handleNext = () => {
    if (birthDate.month && birthDate.day && birthDate.year) {
      onNext();
    }
  };

  const isComplete = birthDate.month && birthDate.day && birthDate.year;
  const textColor = isDark ? '#FFFFFF' : '#000000';

  // Generate years from current year - 4 to current year (ascending order)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
  
  // Generate days based on selected month and year
  const maxDays = birthDate.month && birthDate.year 
    ? getDaysInMonth(birthDate.month, birthDate.year) 
    : 31;
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  return (
    <OnboardingLayout
      title={i18n.t('birthDate.title')}
      subtitle={i18n.t('birthDate.subtitle')}
      currentStep={8}
      totalSteps={12}
      onBack={onBack}
      onNext={handleNext}
      nextTitle={i18n.t('next')}
      nextDisabled={!isComplete}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        <View style={styles.pickersContainer}>
          {/* Month Picker */}
          <View style={[styles.pickerSection, styles.monthPickerSection]}>
            <Text style={[styles.pickerLabel, { color: textColor }]}>
              {i18n.t('birthDate.month')}
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={birthDate.month}
                onValueChange={(value) => updateBirthDate('month', value)}
                style={[styles.picker, { color: textColor }]}
                itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                dropdownIconColor={textColor}
              >
                {months.map((month, index) => (
                  <Picker.Item 
                    key={index + 1} 
                    label={month} 
                    value={index + 1}
                    color={textColor}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Day Picker */}
          <View style={styles.pickerSection}>
            <Text style={[styles.pickerLabel, { color: textColor }]}>
              {i18n.t('birthDate.day')}
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={birthDate.day}
                onValueChange={(value) => updateBirthDate('day', value)}
                style={[styles.picker, { color: textColor }]}
                itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                dropdownIconColor={textColor}
              >
                {days.map(day => (
                  <Picker.Item 
                    key={day} 
                    label={day.toString()} 
                    value={day}
                    color={textColor}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Year Picker */}
          <View style={styles.pickerSection}>
            <Text style={[styles.pickerLabel, { color: textColor }]}>
              {i18n.t('birthDate.year')}
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={birthDate.year}
                onValueChange={(value) => updateBirthDate('year', value)}
                style={[styles.picker, { color: textColor }]}
                itemStyle={Platform.OS === 'ios' ? { color: textColor, fontSize: 14 } : undefined}
                dropdownIconColor={textColor}
              >
                {years.map(year => (
                  <Picker.Item 
                    key={year} 
                    label={year.toString()} 
                    value={year}
                    color={textColor}
                  />
                ))}
              </Picker>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  monthPickerSection: {
    flex: 1.4, // Make month picker wider
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