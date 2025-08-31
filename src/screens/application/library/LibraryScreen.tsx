import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ScrollView, Dimensions, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../../utils/haptic';
import { LiftDataCard } from '../../../components/LiftDataCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { FilterModal } from './FilterModal';
import { DateRangeModal } from './DateRangeModal';
import { ILiftData, useLiftData } from '../../../context/LiftDataContext';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { deleteLift as deleteLiftApi } from '../../../services/liftService';

import i18n from '../../../utils/i18n';
import { 
  ClockArrowDown, 
  ClockArrowUp, 
  SlidersHorizontal, 
  Pencil, 
  X,
  ChevronLeft 
} from 'lucide-react-native';

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
  const { liftData, removeLift, toggleFavourite, refreshLifts } = useLiftData();
  
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>(route.params?.selectedFilters || []);
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [isDateRangeModalVisible, setIsDateRangeModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  // Tutorial target ref for the tabs
  const { ref: libraryScreenRef } = useTutorialTarget('library_screen');

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

  // Expose navigateToHome function globally for tutorial
  useEffect(() => {
    (global as any).navigateToHome = () => {
      hapticFeedback.selection();
      onBack();
    };

    return () => {
      (global as any).navigateToHome = undefined;
    };
  }, [onBack]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleDeleteLift = useCallback(async (liftId: string) => {
    hapticFeedback.success();
    const ok = await deleteLiftApi(liftId);
    if (ok) {
      // Refresh data from backend after successful deletion
      await refreshLifts();
    }
  }, [refreshLifts]);

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
      return i18n.t('library.selectDateRange');
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
      return i18n.t('library.allLifts');
    } else if (filterOption.length === 1) {
      return i18n.t('library.oneLift');
    } else {
      return i18n.t('library.liftsCount', { count: filterOption.length });
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
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('library.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => handleTabPress('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            {i18n.t('library.all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favourites' && styles.tabActive]}
          onPress={() => handleTabPress('favourites')}
        >
          <Text style={[styles.tabText, activeTab === 'favourites' && styles.tabTextActive]}>
            {i18n.t('library.favourites')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort and Filter Buttons */}
      <View style={styles.controlsContainer} ref={libraryScreenRef}>
        <View style={styles.liftCountContainer}>
          <Text style={styles.liftCountText}>
            {liftCount} {liftCount === 1 ? i18n.t('library.lift') : i18n.t('library.lifts')}
          </Text>
        </View>
        
        <View style={styles.controlsRightContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={handleSortPress}>
            <View style={styles.sortIconsContainer}>
              {sortOption === 'newest' ? (
                <ClockArrowUp size={20} color="#000000" />
              ) : (
                <ClockArrowDown size={20} color="#000000" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleFilterPress}>
            <SlidersHorizontal size={20} color="#000000" />
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
              showDate={true}
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
                {liftData.length === 0 ? i18n.t('library.noLiftsAnalysed') : 
                 activeTab === 'favourites' ? i18n.t('library.noFavouriteLifts') : i18n.t('library.noLiftsFound')}
              </Text>
              <Text style={styles.noLiftsSubtitle}>
                {liftData.length === 0 
                  ? i18n.t('library.startAnalysingWorkout')
                  : activeTab === 'favourites'
                  ? i18n.t('library.markLiftsAsFavourites')
                  : i18n.t('library.tryAdjustingFilters')
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
              <Pencil size={20} color="#000000" />
            </TouchableOpacity>
            <View style={styles.popupDivider} />
            <TouchableOpacity 
              style={styles.popupOption} 
              onPress={handleMovementFilterPress}
              activeOpacity={0.7}
            >
              <Text style={styles.popupOptionText}>{filterPillText}</Text>
              <Pencil size={20} color="#000000" />
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
      <DateRangeModal
        isVisible={isDateRangeModalVisible}
        onClose={handleDateRangeModalClose}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onReset={handleResetDateRange}
        title={i18n.t('library.editDateRange')}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
