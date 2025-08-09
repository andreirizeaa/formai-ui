import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ScrollView, Dimensions, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';
import { ILiftData } from '../feedback/liftDetails';
import { LiftDataCard } from '../../../components/LiftDataCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { FilterModal } from './FilterModal';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useLiftData } from '../../../context/LiftDataContext';
import { Picker } from '@react-native-picker/picker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

interface LibraryScreenProps {
  onBack: () => void;
  onTriggerAddOptions: () => void;
}

type SortOption = 'newest' | 'oldest';
type FilterOption = string[];
type TabOption = 'all' | 'favourites';

interface DateRange {
  from: { month: number; day: number; year: number } | null;
  to: { month: number; day: number; year: number } | null;
}

type MainStackParamList = {
  Library: { selectedFilters?: string[] };
  LiftDetails: {
    liftData: ILiftData;
  };
};

type LibraryNavigationProp = StackNavigationProp<MainStackParamList>;
type LibraryRouteProp = RouteProp<MainStackParamList, 'Library'>;

export function LibraryScreen({ onBack, onTriggerAddOptions }: LibraryScreenProps) {
  const navigation = useNavigation<LibraryNavigationProp>();
  const route = useRoute<LibraryRouteProp>();
  const { liftData, removeLift, toggleFavourite } = useLiftData();
  
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>(route.params?.selectedFilters || []);
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [isDateRangeModalVisible, setIsDateRangeModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  // Initialize date range with current data range
  React.useEffect(() => {
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
  }, []);

  // Update filter state when navigation params change
  useEffect(() => {
    if (route.params?.selectedFilters) {
      setFilterOption(route.params.selectedFilters);
    }
  }, [route.params?.selectedFilters]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteLift = useCallback((liftId: string) => {
    hapticFeedback.success();
    removeLift(liftId);
  }, [removeLift]);

  // Filter lift data based on date range
  const filteredByDateLiftData = useMemo(() => {
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

  // Optimize the filtering and sorting logic
  const filteredAndSortedLifts = useMemo(() => {
    let filtered = filteredByDateLiftData;

    // Apply tab filter (All vs Favourites)
    if (activeTab === 'favourites') {
      filtered = filtered.filter(lift => lift.isFavourite);
    }

    // Apply movement type filter
    if (filterOption.length > 0) {
      filtered = filtered.filter(lift => filterOption.includes(lift.liftType));
    }

    // Apply sort - use a more efficient sort
    return filtered.sort((a, b) => {
      const dateA = new Date(a.liftDate.split('-').reverse().join('-')).getTime();
      const dateB = new Date(b.liftDate.split('-').reverse().join('-')).getTime();
      return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredByDateLiftData, activeTab, filterOption, sortOption]);

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
    if (filterOption.length === 0) {
      return 'All lifts';
    } else if (filterOption.length === 1) {
      return '1 Lift';
    } else {
      return `${filterOption.length} Lifts`;
    }
  }, [filterOption]);

  const handleEmptyCardPress = useCallback(() => {
    hapticFeedback.selection();
    
    // If there are lifts but none match the current filters, open the filter modal
    if (liftData.length > 0 && filteredAndSortedLifts.length === 0) {
      setShowFilterModal(true);
    } else {
      // Otherwise, go back and trigger add options (for when there are no lifts at all)
      onBack();
      setTimeout(() => {
        onTriggerAddOptions();
      }, 100);
    }
  }, [liftData.length, filteredAndSortedLifts.length, onBack, onTriggerAddOptions]);

  const handleSortPress = useCallback(() => {
    hapticFeedback.selection();
    setSortOption(sortOption === 'newest' ? 'oldest' : 'newest');
  }, [sortOption]);

  const handleFilterPress = useCallback(() => {
    hapticFeedback.selection();
    setShowPopupModal(true);
  }, []);

  const handlePopupModalClose = useCallback(() => {
    hapticFeedback.selection();
    setShowPopupModal(false);
  }, []);

  const handleDateRangePress = useCallback(() => {
    hapticFeedback.selection();
    setShowPopupModal(false);
    setIsDateRangeModalVisible(true);
  }, []);

  const handleMovementFilterPress = useCallback(() => {
    hapticFeedback.selection();
    setShowPopupModal(false);
    setShowFilterModal(true);
  }, []);

  const handleFilterModalClose = useCallback(() => {
    hapticFeedback.selection();
    setShowFilterModal(false);
  }, []);

  const handleDateRangeModalClose = useCallback(() => {
    hapticFeedback.selection();
    setIsDateRangeModalVisible(false);
  }, []);

  const handleTabPress = useCallback((tab: TabOption) => {
    hapticFeedback.selection();
    setActiveTab(tab);
  }, []);

  const handleLiftPress = useCallback((lift: ILiftData) => {
    hapticFeedback.selection();
    navigation.navigate('LiftDetails', { 
      liftData: lift,
    });
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    hapticFeedback.selection();
    onBack();
  }, [onBack]);

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

  const handleResetDateRange = useCallback(() => {
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
  }, []);

  const handleApplyDateRange = useCallback(() => {
    hapticFeedback.success();
    setIsDateRangeModalVisible(false);
  }, []);

  // Generate years from 2020 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, i) => 2020 + i
  );

  // Memoize the lift count to prevent unnecessary re-renders
  const liftCount = useMemo(() => filteredAndSortedLifts.length, [filteredAndSortedLifts.length]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
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
        <Text style={styles.headerTitle}>Library</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => handleTabPress('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favourites' && styles.tabActive]}
          onPress={() => handleTabPress('favourites')}
        >
          <Text style={[styles.tabText, activeTab === 'favourites' && styles.tabTextActive]}>
            Favourites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort and Filter Buttons */}
      <View style={styles.controlsContainer}>
        <View style={styles.liftCountContainer}>
          <Text style={styles.liftCountText}>
            {liftCount} lift{liftCount === 1 ? '' : 's'}
          </Text>
        </View>
        
        <View style={styles.controlsRightContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={handleSortPress}>
            <View style={styles.sortIconsContainer}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="#000000"
                  strokeWidth={2}
                />
              </Svg>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={sortOption === 'newest' 
                    ? "M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                    : "M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                  }
                  stroke="#000000"
                  strokeWidth={2}
                />
              </Svg>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleFilterPress}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                stroke="#000000"
                strokeWidth={2}
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content - Optimized ScrollView */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        removeClippedSubviews={true}
      >
        {filteredAndSortedLifts.length > 0 ? (
          filteredAndSortedLifts.map((lift) => (
            <LiftDataCard 
              key={lift.id} 
              lift={lift} 
              onPress={() => handleLiftPress(lift)}
              onDelete={handleDeleteLift}
            />
          ))
        ) : (
          <TouchableOpacity 
            style={styles.noLiftsCard}
            onPress={handleEmptyCardPress}
            activeOpacity={0.7}
          >
            <View style={styles.noLiftsContent}>
              <Text style={styles.noLiftsTitle}>
                {liftData.length === 0 ? 'No lifts analysed' : 
                 activeTab === 'favourites' ? 'No favourite lifts' : 'No lifts found'}
              </Text>
              <Text style={styles.noLiftsSubtitle}>
                {liftData.length === 0 
                  ? 'Start analysing today\'s workout by taking a quick video'
                  : activeTab === 'favourites'
                  ? 'Mark lifts as favourites to see them here'
                  : 'Try adjusting your filters'
                }
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Popup Modal */}
      {showPopupModal && (
        <TouchableOpacity 
          style={styles.popupOverlay} 
          activeOpacity={1} 
          onPress={handlePopupModalClose}
        >
          <View style={styles.popupContainer}>
            <TouchableOpacity 
              style={styles.popupOption} 
              onPress={handleDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={styles.popupOptionText}>{dateRangeText}</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                  fill="#000000"
                />
              </Svg>
            </TouchableOpacity>
            <View style={styles.popupDivider} />
            <TouchableOpacity 
              style={styles.popupOption} 
              onPress={handleMovementFilterPress}
              activeOpacity={0.7}
            >
              <Text style={styles.popupOptionText}>{filterPillText}</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                  fill="#000000"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <FilterModal
        isVisible={showFilterModal}
        onClose={handleFilterModalClose}
        currentFilters={filterOption}
        onFilterSelect={(movements) => {
          setFilterOption(movements);
          handleFilterModalClose();
        }}
      />

      {/* Date Range Modal */}
      <Modal
        visible={isDateRangeModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleDateRangeModalClose}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={handleDateRangeModalClose}
        >
          <TouchableOpacity 
            style={styles.dateRangeModalContainer} 
            activeOpacity={1} 
            onPress={() => {}} // Prevent closing when clicking inside the modal
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Edit date range</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleDateRangeModalClose}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  scrollContainer: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    // Removed borderBottomColor to eliminate underscore highlight
  },
  tabText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  tabTextActive: {
    fontWeight: '600',
    color: '#000000',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  controlButton: {
    width: 56,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  liftCountContainer: {
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  liftCountText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  content: {
    flex: 1,
  },
  noLiftsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noLiftsContent: {
    alignItems: 'center',
  },
  noLiftsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  noLiftsSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
  },
  controlsRightContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  // Popup Modal Styles
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  popupContainer: {
    position: 'absolute',
    top: 210,
    right: 20,
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  popupOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  popupOptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  popupDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  // Date Range Modal Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  dateRangeModalContainer: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    flex: 1,
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
}); 