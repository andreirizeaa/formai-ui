import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SwipeableLineGraphCard } from '../../../components/ui/SwipeableLineGraphCard';
import { SwipeableSummaryCard } from '../../../components/ui/SwipeableSummaryCard';
import { FilterModal } from '../library/FilterModal';
import { useLiftData } from '../../../context/LiftDataContext';
import { hapticFeedback } from '../../../utils/haptic';
import Svg, { Path, Circle } from 'react-native-svg';

interface PerformanceScreenProps {
  onTriggerAddOptions?: () => void;
}

interface DateRange {
  from: { month: number; day: number; year: number } | null;
  to: { month: number; day: number; year: number } | null;
}

export function PerformanceScreen({ onTriggerAddOptions }: PerformanceScreenProps) {
  const { liftData } = useLiftData();
  const [isDateRangeModalVisible, setIsDateRangeModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  
  // Initialize date range with current data range
  React.useEffect(() => {
    if (liftData.length > 0) {
      const dates = liftData.map(lift => {
        const [day, month, year] = lift.liftDate.split('-').map(Number);
        return new Date(year, month - 1, day);
      }).sort((a, b) => a.getTime() - b.getTime());

      const startDate = dates[0];
      const endDate = dates[dates.length - 1];

      setDateRange({
        from: {
          month: startDate.getMonth() + 1,
          day: startDate.getDate(),
          year: startDate.getFullYear()
        },
        to: {
          month: endDate.getMonth() + 1,
          day: endDate.getDate(),
          year: endDate.getFullYear()
        }
      });
    } else {
      // Default to today's date a year ago to today
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      
      setDateRange({
        from: {
          month: oneYearAgo.getMonth() + 1,
          day: oneYearAgo.getDate(),
          year: oneYearAgo.getFullYear()
        },
        to: {
          month: today.getMonth() + 1,
          day: today.getDate(),
          year: today.getFullYear()
        }
      });
    }
  }, [liftData]);

  // Filter lift data based on date range
  const filteredLiftData = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return liftData;
    }

    const fromDate = new Date(dateRange.from.year, dateRange.from.month - 1, dateRange.from.day);
    const toDate = new Date(dateRange.to.year, dateRange.to.month - 1, dateRange.to.day);

    return liftData.filter(lift => {
      const [day, month, year] = lift.liftDate.split('-').map(Number);
      const liftDate = new Date(year, month - 1, day);
      return liftDate >= fromDate && liftDate <= toDate;
    });
  }, [liftData, dateRange]);
  
  // Check if there are no lifts
  const hasNoLifts = filteredLiftData.length === 0;

  // Get date range for display
  const dateRangeText = useMemo(() => {
    if (!dateRange.from || !dateRange.to) {
      return 'Select date range';
    }

    const formatDate = (date: { month: number; day: number; year: number }) => {
      const dateObj = new Date(date.year, date.month - 1, date.day);
      return dateObj.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  }, [dateRange]);

  // Get filter pill text based on selected movements
  const filterPillText = useMemo(() => {
    if (selectedMovements.length === 0) {
      return 'All lifts';
    } else if (selectedMovements.length === 1) {
      return '1 Lift';
    } else {
      return `${selectedMovements.length} Lifts`;
    }
  }, [selectedMovements]);

  const handleDateRangePress = () => {
    hapticFeedback.selection();
    setIsDateRangeModalVisible(true);
  };

  const handleFilterPress = () => {
    hapticFeedback.selection();
    setIsFilterModalVisible(true);
  };

  const handleCloseModal = () => {
    hapticFeedback.selection();
    setIsDateRangeModalVisible(false);
  };

  const handleCloseFilterModal = () => {
    hapticFeedback.selection();
    setIsFilterModalVisible(false);
  };

  const handleFilterSelect = (movements: string[]) => {
    setSelectedMovements(movements);
  };

  const handleResetDateRange = () => {
    hapticFeedback.success();
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    setDateRange({
      from: {
        month: oneYearAgo.getMonth() + 1,
        day: oneYearAgo.getDate(),
        year: oneYearAgo.getFullYear()
      },
      to: {
        month: today.getMonth() + 1,
        day: today.getDate(),
        year: today.getFullYear()
      }
    });
    
    setIsDateRangeModalVisible(false);
  };

  const handleApplyDateRange = () => {
    hapticFeedback.success();
    setIsDateRangeModalVisible(false);
  };

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
    
    setDateRange(newDateRange);
  };

  // Generate years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => 2020 + i
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Performance</Text>
          
          {/* Date Range and Filter Pills */}
          <View style={styles.pillsContainer}>
            <TouchableOpacity 
              style={[styles.pill, styles.dateRangePill]}
              onPress={handleDateRangePress}
              activeOpacity={0.7}
            >
              <View style={styles.pillContent}>
                <Text style={styles.pillText}>{dateRangeText}</Text>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                    fill="#000000"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pill, styles.filterPill]}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <View style={styles.pillContent}>
                <Text style={styles.pillText}>{filterPillText}</Text>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                    fill="#000000"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Performance Cards */}
          {hasNoLifts ? (
            <TouchableOpacity 
              style={styles.performanceCard}
              activeOpacity={0.7}
            >
              <View style={styles.performanceCardContent}>
                <View style={styles.performanceCardHeader}>
                  <Text style={styles.performanceCardLabel}>
                    No lifts found
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <SwipeableLineGraphCard 
              cardData={filteredLiftData}
              onTriggerAddOptions={onTriggerAddOptions}
              hasNoLifts={hasNoLifts}
              chartType="accuracyPerWeight"
            />
          )}

          {/* Performance Summary Card */}
          {!hasNoLifts && (
            <SwipeableSummaryCard 
              cardData={filteredLiftData}
              hasNoLifts={false}
            />
          )}

          {/* Accuracy Over Time Cards */}
          {!hasNoLifts && (
            <SwipeableLineGraphCard 
              cardData={filteredLiftData}
              hasNoLifts={false}
              chartType="accuracyOverTime"
            />
          )}
        </View>
      </ScrollView>

      {/* Date Range Modal */}
      <Modal
        visible={isDateRangeModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={handleCloseModal}
        >
          <TouchableOpacity 
            style={styles.popupContainer} 
            activeOpacity={1} 
            onPress={() => {}} // Prevent closing when clicking inside the modal
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit date range</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                    stroke="#000000"
                    strokeWidth={2}
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* From Date Section */}
              <View style={styles.dateSection}>
                <Text style={styles.dateSectionTitle}>From</Text>
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
                <Text style={styles.dateSectionTitle}>To</Text>
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
                  onPress={handleResetDateRange}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyDateRange}>
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={handleCloseFilterModal}
        onFilterSelect={handleFilterSelect}
        currentFilters={selectedMovements}
        title="Filter lifts"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    marginBottom: -24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 24,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateRangePill: {
    flex: 0.75,
  },
  filterPill: {
    flex: 0.25,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
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
    borderRadius: 12,
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
    borderRadius: 12,
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
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  performanceCardContent: {
    alignItems: 'center',
  },
  performanceCardHeader: {
  },
  performanceCardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
  },
}); 