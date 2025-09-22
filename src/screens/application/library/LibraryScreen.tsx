import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { hapticFeedback } from '../../../utils/haptic';
import { LiftCard } from '../../../components/LiftCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FilterModal } from './FilterModal';
import { DateRangeModal } from './DateRangeModal';
import { ILiftData, useLiftData } from '../../../context/LiftDataContext';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { searchLiftByAssetId } from '../../../services/liftService';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { track } from '../../../services/analytics';
import { showAlert } from '../../../services/alertService';

import i18n from '../../../utils/i18n';
import { 
  ClockArrowDown, 
  ClockArrowUp, 
  SlidersHorizontal, 
  Pencil, 
  X, 
  Search,
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

type LibraryNavigationProp = NativeStackNavigationProp<MainStackParamList>;
type LibraryRouteProp = RouteProp<MainStackParamList, 'Library'>;

export function LibraryScreen({ onBack, onTriggerAddOptions }: LibraryScreenProps) {
  const navigation = useNavigation<LibraryNavigationProp>();
  const route = useRoute<LibraryRouteProp>();
  const { liftData, toggleFavourite, refreshLifts } = useLiftData();
  const { loadingLifts } = useLoadingLifts();
  
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>(route.params?.selectedFilters || []);
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [isDateRangeModalVisible, setIsDateRangeModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [isSearching, setIsSearching] = useState(false);

  // Track screen view on mount
  useEffect(() => {
    track('Screen viewed', { screen_name: 'Library' });
  }, []);

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

  // Expose navigateToHome function globally for tutorial, preserving base
  useEffect(() => {
    const previousNavigateToHome = (global as any).navigateToHome;
    (global as any).navigateToHome = () => {
      hapticFeedback.selection();
      (global as any).__lastHomeNavAt = Date.now();
      onBack();
    };

    return () => {
      if (previousNavigateToHome) {
        (global as any).navigateToHome = previousNavigateToHome;
      } else if ((global as any).__navigateToHomeBase) {
        (global as any).navigateToHome = (global as any).__navigateToHomeBase;
      } else {
        delete (global as any).navigateToHome;
      }
    };
  }, [onBack]);

  // Note: LiftCard handles deletion internally through context

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

  // Only show completed lifts (final lifts only)
  const combinedLiftsForDay = useMemo(() => {
    // Only return the filtered final lifts, no loading lifts
    return filteredByDateLiftData;
  }, [filteredByDateLiftData]);

  // Optimize the filtering and sorting logic
  const filteredAndSortedLifts = useMemo(() => {
    let filtered = combinedLiftsForDay;

    // Apply tab filter (All vs Favourites) - only for final lifts
    if (activeTab === 'favourites') {
      filtered = filtered.filter(lift => lift.isFavourite);
    }

    // Apply movement type filter - only for final lifts
    if (filterOption.length > 0) {
      filtered = filtered.filter(lift => 
        lift.liftType && filterOption.includes(lift.liftType)
      );
    }

    // Apply sort - use a more efficient sort
    return filtered.sort((a, b) => {
      const dateA = new Date(a.liftDate.split('-').reverse().join('-')).getTime();
      const dateB = new Date(b.liftDate.split('-').reverse().join('-')).getTime();
      return sortOption === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [combinedLiftsForDay, activeTab, filterOption, sortOption]);

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
    // Track library screen clicks for no lifts card
    track('Library screen clicks', { event: 'No lifts card' });
    
    // If there are completed lifts but none match the current filters, open the filter modal
    const totalLifts = liftData.length;
    if (totalLifts > 0 && filteredAndSortedLifts.length === 0) {
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
    // Track library screen clicks for sort icon
    track('Library screen clicks', { event: 'Sort' });
    setSortOption(sortOption === 'newest' ? 'oldest' : 'newest');
  }, [sortOption]);

  const handleFilterPress = useCallback(() => {
    hapticFeedback.selection();
    // Track library screen clicks for filter icon
    track('Library screen clicks', { event: 'Open filters' });
    setShowPopupModal(true);
  }, []);

  const handlePopupModalClose = useCallback(() => {
    hapticFeedback.selection();
    setShowPopupModal(false);
  }, []);

  const handleDateRangePress = useCallback(() => {
    hapticFeedback.selection();
    // Track library screen clicks for date range container
    track('Library screen clicks', { event: 'Edit date range' });
    setShowPopupModal(false);
    setIsDateRangeModalVisible(true);
  }, []);

  const handleMovementFilterPress = useCallback(() => {
    hapticFeedback.selection();
    // Track library screen clicks for lifts container
    track('Library screen clicks', { event: 'Edit lifts' });
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
    // Track library screen clicks for tab selection
    track('Library screen clicks', { event: tab === 'all' ? 'All tabs' : 'Favourites tab' });
    setActiveTab(tab);
  }, []);

  const handleLiftPress = useCallback((liftId: string) => {
    hapticFeedback.selection();
    // Track library screen clicks for lift card
    track('Library screen clicks', { event: 'Lift card' });
    const lift = filteredAndSortedLifts.find(l => l.id === liftId);
    if (lift) {
      // Navigate to lift details for completed lifts
      navigation.navigate('LiftDetails', { 
        liftData: lift,
      });
    }
  }, [navigation, filteredAndSortedLifts]);

  const handleBackPress = useCallback(() => {
    hapticFeedback.selection();
    onBack();
  }, [onBack]);

  const handleSearchPress = useCallback(async () => {
    hapticFeedback.selection();
    // Track library screen clicks for search container
    track('Library screen clicks', { event: 'Search' });
    setIsSearching(true);
    
    // Add a small delay to show the loading icon before opening image picker
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        setIsSearching(false);
        return;
      }

      const asset = result.assets[0];
      if (asset && asset.assetId) {
        // Extract the base asset ID (remove /L0/001 suffix if present)
        const fullAssetId = asset.assetId;
        const baseAssetId = fullAssetId.split('/')[0];
        
        // Search for the lift by asset ID
        const foundLift = await searchLiftByAssetId(baseAssetId);
        
        if (foundLift) {
          // Check if we're on the favourites tab and the lift is not favourited
          if (activeTab === 'favourites' && !foundLift.isFavourite) {
            // Show alert that analysis was found but not favourited
            showAlert(
              i18n.t('library.search.analysisFound'),
              i18n.t('library.search.analysisFoundNotFavourited'),
              () => {
                navigation.navigate('LiftDetails', { 
                  liftData: foundLift,
                });
              },
              'LIBRARY_SEARCH_ANALYSIS_FOUND_NOT_FAVOURITED'
            );
          } else {
            // Navigate to the lift details page normally
            navigation.navigate('LiftDetails', { 
              liftData: foundLift,
            });
          }
        } else {
          // Check video duration to determine if we should show the Analyse button
          let durationInSeconds = asset.duration;
          
          // Handle different duration formats
          if (typeof asset.duration === 'number') {
            // If duration is in milliseconds, convert to seconds
            if (asset.duration > 1000) {
              durationInSeconds = asset.duration / 1000;
            }
          }

          // Show alert with Analyse button if video is under 90 seconds
          if (durationInSeconds !== undefined && durationInSeconds !== null && durationInSeconds <= 90) {
            showAlert(
              i18n.t('library.search.noAnalysisFound'),
              i18n.t('library.search.noAnalysisFoundMessage'),
              undefined,
              'LIBRARY_SEARCH_NO_ANALYSIS_FOUND_UNDER_90S'
            );
            // Note: The analyse button functionality would need to be handled differently with showAlert
            // For now, we'll show the alert and the user can manually navigate to upload
          } else {
            // Show regular alert if video is too long or duration unknown
            showAlert(
              i18n.t('library.search.noAnalysisFound'),
              i18n.t('library.search.noAnalysisFoundMessage'),
              undefined,
              'LIBRARY_SEARCH_NO_ANALYSIS_FOUND_OVER_90S'
            );
          }
        }
      }
      setIsSearching(false);
    } catch (error) {
      setIsSearching(false);
      // Handle permission errors specifically
      if (error instanceof Error && error.message.includes('permission')) {
        showAlert(
          i18n.t('library.search.permissionRequired'),
          i18n.t('library.search.permissionMessage'),
          undefined,
          'LIBRARY_SEARCH_PERMISSION_ERROR'
        );
      } else {
        showAlert(
          i18n.t('library.search.error'), 
          i18n.t('library.search.errorMessage'),
          undefined,
          'LIBRARY_SEARCH_GENERAL_ERROR'
        );
      }
    }
  }, [navigation, activeTab]);



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

  // Render function for FlashList
  const renderLiftItem = useCallback(({ item }: { item: any }) => (
    <LiftCard 
      lift={item} 
      onPress={handleLiftPress}
      showDate={true} // show date pill for all completed lifts
    />
  ), [handleLiftPress]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 }
          ]} 
          onPress={handleBackPress}
        >
          <X size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>{i18n.t('library.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.tab, 
            activeTab === 'all' && styles.tabActive,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => handleTabPress('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            {i18n.t('library.all')}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.tab, 
            activeTab === 'favourites' && styles.tabActive,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => handleTabPress('favourites')}
        >
          <Text style={[styles.tabText, activeTab === 'favourites' && styles.tabTextActive]}>
            {i18n.t('library.favourites')}
          </Text>
        </Pressable>
      </View>

      {/* Sort and Filter Buttons */}
      <View style={styles.controlsContainer} ref={libraryScreenRef}>
        <View style={styles.leftControlsContainer}>
          <View style={styles.liftCountContainer}>
            <Text style={styles.liftCountText}>
              {liftCount === 0 ? i18n.t('library.noLifts') : `${liftCount} ${liftCount === 1 ? i18n.t('library.lift') : i18n.t('library.lifts')}`}
            </Text>
          </View>
        </View>
        
        <View style={styles.controlsRightContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.searchPill,
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={handleSearchPress}
          >
            <Search size={17} color="#000000" />
            <Text style={styles.searchPillText}>Search</Text>
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.controlButton,
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={handleSortPress}
          >
            {sortOption === 'newest' ? (
              <ClockArrowUp size={17} color="#000000" />
            ) : (
              <ClockArrowDown size={17} color="#000000" />
            )}
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.controlButton,
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={handleFilterPress}
          >
            <SlidersHorizontal size={17} color="#000000" />
          </Pressable>
        </View>
      </View>

      {/* Content - Optimized FlashList */}
      <View style={styles.scrollContainer}>
        {filteredAndSortedLifts.length > 0 ? (
          <FlashList
            data={filteredAndSortedLifts}
            renderItem={renderLiftItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={146}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
            extraData={filteredAndSortedLifts}
          />
        ) : (
          <LiftCard
            lift={null}
            isNoLiftsCard={true}
            noLiftsTitle={
              liftData.length === 0 ? i18n.t('library.noLiftsAnalysed') : 
              activeTab === 'favourites' ? i18n.t('library.noFavouriteLifts') : i18n.t('library.noLiftsFound')
            }
            noLiftsSubtitle={
              liftData.length === 0
                ? i18n.t('library.startAnalysingWorkout')
                : activeTab === 'favourites'
                ? i18n.t('library.markLiftsAsFavourites')
                : i18n.t('library.tryAdjustingFilters')
            }
            onNoLiftsPress={handleEmptyCardPress}
          />
        )}
      </View>

      {/* Popup Modal */}
      {showPopupModal && (
        <Pressable 
          style={styles.popupOverlay} 
          onPress={handlePopupModalClose}
        >
          <View style={styles.popupContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.popupOption,
                { opacity: pressed ? 0.7 : 1 }
              ]} 
              onPress={handleDateRangePress}
            >
              <Text style={styles.popupOptionText}>{dateRangeText}</Text>
              <Pencil size={20} color="#000000" />
            </Pressable>
            <View style={styles.popupDivider} />
            <Pressable 
              style={({ pressed }) => [
                styles.popupOption,
                { opacity: pressed ? 0.7 : 1 }
              ]} 
              onPress={handleMovementFilterPress}
            >
              <Text style={styles.popupOptionText}>{filterPillText}</Text>
              <Pencil size={20} color="#000000" />
            </Pressable>
          </View>
        </Pressable>
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
      
      <LoadingOverlay visible={isSearching} />
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
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
    paddingHorizontal: 0,
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
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  tabTextActive: {
    fontWeight: '800',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  liftCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  liftCountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  content: {
    flex: 1,
  },

  leftControlsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  searchPillText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
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
    fontWeight: '800',
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
