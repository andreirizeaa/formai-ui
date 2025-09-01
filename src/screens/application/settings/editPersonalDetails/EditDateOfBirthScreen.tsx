import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { editUserDetails } from '../../../../services/userService';
import { ChevronLeft } from 'lucide-react-native';

interface EditDateOfBirthScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditDateOfBirthScreen({ onBack, currentValue, onSave }: EditDateOfBirthScreenProps) {
  const { updateUserDetails, refetchUserDetails } = useUserDetails();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(7); // Default July
  const [selectedDay, setSelectedDay] = useState(15); // Default 15th
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25); // Default 25 years ago

  const currentYear = new Date().getFullYear();

  // Parse current value to determine initial state
  React.useEffect(() => {
    updateValues();
  }, [currentValue]);

  const updateValues = () => {
    if (currentValue) {
      // First try to parse DD-MM-YYYY format
      const ddMmYyyyMatch = currentValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (ddMmYyyyMatch) {
        const [, day, month, year] = ddMmYyyyMatch;
        setSelectedDay(parseInt(day));
        setSelectedMonth(parseInt(month));
        setSelectedYear(parseInt(year));
        return;
      }

      // Try to parse YYYY-MM-DD format (for backward compatibility)
      const isoDateMatch = currentValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoDateMatch) {
        const [, year, month, day] = isoDateMatch;
        setSelectedYear(parseInt(year));
        setSelectedMonth(parseInt(month));
        setSelectedDay(parseInt(day));
        return;
      }

      // Parse date from format like "July 15, 1998" or "15/07/1998"
      const dateMatch = currentValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        setSelectedDay(parseInt(day));
        setSelectedMonth(parseInt(month));
        setSelectedYear(parseInt(year));
      } else {
        // Try parsing month name format with translated month names
        const englishMonths = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Find the month index by matching against both English and translated names
        let monthIndex = -1;
        for (let i = 0; i < englishMonths.length; i++) {
          const englishMonth = englishMonths[i];
          const translatedMonth = i18n.t(`months.${englishMonth.toLowerCase()}`);
          if (currentValue.toLowerCase().includes(englishMonth.toLowerCase()) || 
              currentValue.toLowerCase().includes(translatedMonth.toLowerCase())) {
            monthIndex = i;
            break;
          }
        }
        
        if (monthIndex !== -1) {
          setSelectedMonth(monthIndex + 1);
        }
        
        // Extract day and year
        const dayMatch = currentValue.match(/(\d{1,2})/);
        const yearMatch = currentValue.match(/(\d{4})/);
        if (dayMatch) setSelectedDay(parseInt(dayMatch[1]));
        if (yearMatch) setSelectedYear(parseInt(yearMatch[1]));
      }
    }
  }

  const months = [
    i18n.t('months.january'),
    i18n.t('months.february'),
    i18n.t('months.march'),
    i18n.t('months.april'),
    i18n.t('months.may'),
    i18n.t('months.june'),
    i18n.t('months.july'),
    i18n.t('months.august'),
    i18n.t('months.september'),
    i18n.t('months.october'),
    i18n.t('months.november'),
    i18n.t('months.december')
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    // Validate day if it exceeds the new month's max days
    const maxDays = getDaysInMonth(month, selectedYear);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Validate day if it exceeds the new year's max days for the selected month
    const maxDays = getDaysInMonth(selectedMonth, year);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    hapticFeedback.selection();
    setIsSaving(true);
    // Return the date in DD-MM-YYYY format for UI
    const formattedDate = `${String(selectedDay).padStart(2, '0')}-${String(selectedMonth).padStart(2, '0')}-${selectedYear}`;
    // Convert to YYYY-MM-DD for API
    const isoDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    try {
      await editUserDetails({ birth_date: isoDate });
      updateUserDetails('dateOfBirth', formattedDate);
      await refetchUserDetails();
      hapticFeedback.success();
      onSave(formattedDate);
    } catch (e) {
      hapticFeedback.error();
      updateValues();
      Alert.alert(i18n.t('settings.editFailed.dateOfBirth'), i18n.t('settings.editFailed.message'), [{ text: 'Ok', onPress: () => {
        hapticFeedback.selection();
        onBack();
      } }]);

    }
    setIsSaving(false);
  };

  // Generate years from 1940 to current year - 4 (descending order for better UX)
  const years = Array.from(
    { length: currentYear - 1940 - 3 }, // -3 because we want to go up to currentYear - 4
    (_, i) => currentYear - 4 - i
  ).reverse(); // Reverse to show in ascending order
  
  // Generate days based on selected month and year
  const maxDays = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

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
        <Text style={styles.headerTitle}>{i18n.t('personalDetails.editDateOfBirth')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.pickersContainer}>
          {/* Month Picker */}
          <View style={[styles.pickerSection, styles.monthPickerSection]}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={handleMonthChange}
                style={styles.picker}
                itemStyle={Platform.OS === 'ios' ? { fontSize: 14 } : undefined}
              >
                {months.map((month, index) => (
                  <Picker.Item 
                    key={index + 1} 
                    label={month} 
                    value={index + 1}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Day Picker */}
          <View style={styles.pickerSection}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedDay}
                onValueChange={handleDayChange}
                style={styles.picker}
                itemStyle={Platform.OS === 'ios' ? { fontSize: 14 } : undefined}
              >
                {days.map(day => (
                  <Picker.Item 
                    key={day} 
                    label={day.toString()} 
                    value={day}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Year Picker */}
          <View style={styles.pickerSection}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={handleYearChange}
                style={styles.picker}
                itemStyle={Platform.OS === 'ios' ? { fontSize: 14 } : undefined}
              >
                {years.map(year => (
                  <Picker.Item 
                    key={year} 
                    label={year.toString()} 
                    value={year}
                  />
                ))}
              </Picker>
            </View>
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