import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { hapticFeedback } from '../../../utils/haptic';
import i18n from '../../../utils/i18n';
import { X } from 'lucide-react-native';

interface DateRange {
  from: { month: number; day: number; year: number } | null;
  to: { month: number; day: number; year: number } | null;
}

interface DateRangeModalProps {
  isVisible: boolean;
  onClose: () => void;
  dateRange: DateRange;
  onDateRangeChange: (newDateRange: DateRange) => void;
  onReset: () => void;
  title?: string;
}

export function DateRangeModal({
  isVisible,
  onClose,
  dateRange,
  onDateRangeChange,
  onReset,
  title = i18n.t('performance.editDateRange')
}: DateRangeModalProps) {
  // Date picker helper functions
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const isDateValid = (fromDate: { month: number; day: number; year: number } | null, toDate: { month: number; day: number; year: number } | null) => {
    if (!fromDate || !toDate) return true;
    
    const from = new Date(fromDate.year, fromDate.month - 1, fromDate.day);
    const to = new Date(toDate.year, toDate.month - 1, toDate.day);
    
    return to >= from;
  };

  const updateDateRange = (type: 'from' | 'to', field: 'month' | 'day' | 'year', value: number | null) => {
    hapticFeedback.selection();
    const currentDate = dateRange[type] || { month: 1, day: 1, year: new Date().getFullYear() };
    
    const updatedDate = {
      ...currentDate,
      [field]: value,
    };
    
    // If changing month or year, validate the day
    if (field === 'month' || field === 'year') {
      if (updatedDate.month && updatedDate.year && updatedDate.day) {
        const maxDays = getDaysInMonth(updatedDate.month, updatedDate.year);
        if (updatedDate.day > maxDays) {
          updatedDate.day = maxDays;
        }
      }
    }
    
    const newDateRange = {
      ...dateRange,
      [type]: updatedDate
    };

    // Validate date range - if invalid, don't update
    if (!isDateValid(newDateRange.from, newDateRange.to)) {
      hapticFeedback.error();
      return;
    }
    
    onDateRangeChange(newDateRange);
  };

  const handleApply = () => {
    hapticFeedback.success();
    onClose();
  };

  const handleReset = () => {
    hapticFeedback.success();
    onReset();
    onClose();
  };

  // Generate years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => 2020 + i
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.popupContainer} 
          activeOpacity={1} 
          onPress={() => {}} // Prevent closing when clicking inside the modal
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X width={20} height={20} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* From Date Section */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionTitle}>{i18n.t('performance.from')}</Text>
              <View style={styles.pickersContainer}>
                {/* Month Picker */}
                <View style={[styles.pickerSection, styles.monthPickerSection]}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={dateRange.from?.month}
                      onValueChange={(value) => updateDateRange('from', 'month', value)}
                      style={styles.picker}
                      itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: 14 } : undefined}
                      dropdownIconColor="#000000"
                    >
                      {months.map((month, index) => (
                        <Picker.Item 
                          key={index + 1} 
                          label={month} 
                          value={index + 1}
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Day Picker */}
                <View style={styles.pickerSection}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={dateRange.from?.day}
                      onValueChange={(value) => updateDateRange('from', 'day', value)}
                      style={styles.picker}
                      itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: 14 } : undefined}
                      dropdownIconColor="#000000"
                    >
                      {Array.from(
                        { length: dateRange.from?.month && dateRange.from?.year 
                          ? getDaysInMonth(dateRange.from.month, dateRange.from.year) 
                          : 31 
                        }, 
                        (_, i) => i + 1
                      ).map(day => (
                        <Picker.Item 
                          key={day} 
                          label={day.toString()} 
                          value={day}
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Year Picker */}
                <View style={styles.pickerSection}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={dateRange.from?.year}
                      onValueChange={(value) => updateDateRange('from', 'year', value)}
                      style={styles.picker}
                      itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: 14 } : undefined}
                      dropdownIconColor="#000000"
                    >
                      {years.map(year => (
                        <Picker.Item 
                          key={year} 
                          label={year.toString()} 
                          value={year}
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* To Date Section */}
            <View style={styles.dateSection}>
              <Text style={styles.dateSectionTitle}>{i18n.t('performance.to')}</Text>
              <View style={styles.pickersContainer}>
                {/* Month Picker */}
                <View style={[styles.pickerSection, styles.monthPickerSection]}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={dateRange.to?.month}
                      onValueChange={(value) => updateDateRange('to', 'month', value)}
                      style={styles.picker}
                      itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: 14 } : undefined}
                      dropdownIconColor="#000000"
                    >
                      {months.map((month, index) => (
                        <Picker.Item 
                          key={index + 1} 
                          label={month} 
                          value={index + 1}
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Day Picker */}
                <View style={styles.pickerSection}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={dateRange.to?.day}
                      onValueChange={(value) => updateDateRange('to', 'day', value)}
                      style={styles.picker}
                      itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: 14 } : undefined}
                      dropdownIconColor="#000000"
                    >
                      {Array.from(
                        { length: dateRange.to?.month && dateRange.to?.year 
                          ? getDaysInMonth(dateRange.to.month, dateRange.to.year) 
                          : 31 
                        }, 
                        (_, i) => i + 1
                      ).map(day => (
                        <Picker.Item 
                          key={day} 
                          label={day.toString()} 
                          value={day}
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Year Picker */}
                <View style={styles.pickerSection}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={dateRange.to?.year}
                      onValueChange={(value) => updateDateRange('to', 'year', value)}
                      style={styles.picker}
                      itemStyle={Platform.OS === 'ios' ? { color: '#000000', fontSize: 14 } : undefined}
                      dropdownIconColor="#000000"
                    >
                      {years.map(year => (
                        <Picker.Item 
                          key={year} 
                          label={year.toString()} 
                          value={year}
                          color="#000000"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Buttons */}
          <View style={styles.bottomControls}>
            <View style={styles.buttonStack}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>{i18n.t('performance.reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>{i18n.t('performance.apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    height: '90%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 0,
  },
  dateSection: {
    marginBottom: 30,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginBottom: 20,
    textAlign: 'left',
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
  pickerWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 80,
    width: '100%',
  },
  bottomControls: {
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  buttonStack: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});
