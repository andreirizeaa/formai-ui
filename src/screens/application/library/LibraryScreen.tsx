import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ScrollView, Dimensions, Image } from 'react-native';
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
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>(route.params?.selectedFilters || []);
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [lifts, setLifts] = useState<ILiftData[]>([
    {
      id: '1',
      isFavourite: false,
      liftType: 'Flat Barbell Bench Press',
      liftDate: '2024-01-15',
      weightValue: 100,
      weightUnit: 'kg',
      reps: 8,
      videoURL: 'https://example.com/video1.mp4',
      thumbnailURL: 'https://picsum.photos/200/300',
      analysis: {
        accuracy: 85,
        lineGraphValues: [85, 87, 83, 89, 86, 88, 84, 87],
        feedback: []
      }
    },
    {
      id: '2',
      isFavourite: false,
      liftType: 'Deadlift',
      liftDate: '2024-01-14',
      weightValue: 150,
      weightUnit: 'kg',
      reps: 5,
      videoURL: 'https://example.com/video2.mp4',
      thumbnailURL: 'https://picsum.photos/200/300',
      analysis: {
        accuracy: 92,
        lineGraphValues: [92, 94, 90, 93, 95, 91, 93, 92],
        feedback: []
      }
    },
    {
      id: '3',
      isFavourite: false,
      liftType: 'Barbell Back Squat',
      liftDate: '2024-01-13',
      weightValue: 120,
      weightUnit: 'kg',
      reps: 6,
      videoURL: 'https://example.com/video3.mp4',
      thumbnailURL: 'https://picsum.photos/200/300',
      analysis: {
        accuracy: 78,
        lineGraphValues: [78, 80, 75, 82, 79, 81, 77, 80],
        feedback: []
      }
    },
    {
      id: '4',
      isFavourite: false,
      liftType: 'Overhead Barbell Press',
      liftDate: '2024-01-12',
      weightValue: 70,
      weightUnit: 'kg',
      reps: 8,
      videoURL: 'https://example.com/video4.mp4',
      thumbnailURL: 'https://picsum.photos/200/300',
      analysis: {
        accuracy: 88,
        lineGraphValues: [88, 90, 86, 89, 87, 91, 85, 88],
        feedback: []
      }
    },
    {
      id: '5',
      isFavourite: false,
      liftType: 'Barbell Row',
      liftDate: '2024-01-11',
      weightValue: 90,
      weightUnit: 'kg',
      reps: 10,
      videoURL: 'https://example.com/video5.mp4',
      thumbnailURL: 'https://picsum.photos/200/300',
      analysis: {
        accuracy: 91,
        lineGraphValues: [91, 93, 89, 92, 90, 94, 88, 91],
        feedback: []
      }
    },
  ]);

  // Update filter state when navigation params change
  useEffect(() => {
    if (route.params?.selectedFilters) {
      setFilterOption(route.params.selectedFilters);
    }
  }, [route.params?.selectedFilters]);

  // Handle lift deletion
  const handleDeleteLift = (liftId: string) => {
    hapticFeedback.success();
    setLifts(prevLifts => prevLifts.filter(lift => lift.id !== liftId));
  };

  // Sample data - replace with your actual data source
  const allLifts: ILiftData[] = lifts;

  const handleEmptyCardPress = () => {
    hapticFeedback.selection();
    
    // If there are lifts but none match the current filters, open the filter modal
    if (allLifts.length > 0 && filteredAndSortedLifts.length === 0) {
      setShowFilterModal(true);
    } else {
      // Otherwise, go back and trigger add options (for when there are no lifts at all)
      onBack();
      setTimeout(() => {
        onTriggerAddOptions();
      }, 100);
    }
  };

  const handleSortPress = () => {
    hapticFeedback.selection();
    setSortOption(sortOption === 'newest' ? 'oldest' : 'newest');
  };

  const handleFilterPress = () => {
    hapticFeedback.selection();
    setShowFilterModal(true);
  };

  const handleFilterModalClose = () => {
    hapticFeedback.selection();
    setShowFilterModal(false);
  };

  const handleTabPress = (tab: TabOption) => {
    hapticFeedback.selection();
    setActiveTab(tab);
  };

  const handleLiftPress = (lift: ILiftData) => {
    hapticFeedback.selection();
    navigation.navigate('LiftDetails', { 
      liftData: lift,
    });
  };

  const filteredAndSortedLifts = useMemo(() => {
    let filtered = allLifts;

    // Apply tab filter (All vs Favourites)
    if (activeTab === 'favourites') {
      // For now, we'll use a simple filter - you can replace this with actual favourite logic
      filtered = filtered.filter(lift => lift.analysis.accuracy > 90); // Example: high accuracy lifts as "favourites"
    }

    // Apply movement type filter
    if (filterOption.length > 0) {
      filtered = filtered.filter(lift => filterOption.includes(lift.liftType));
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.liftDate);
      const dateB = new Date(b.liftDate);
      return sortOption === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [allLifts, activeTab, filterOption, sortOption]);

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
            {filteredAndSortedLifts.length} lift{filteredAndSortedLifts.length === 1 ? '' : 's'}
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

      {/* Content - ScrollView for lift cards only */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {filteredAndSortedLifts.length > 0 ? (
          <>
            {filteredAndSortedLifts.map((lift, index) => (
              <LiftDataCard 
                key={lift.id} 
                lift={lift} 
                onPress={() => handleLiftPress(lift)}
                onDelete={handleDeleteLift}
              />
            ))}
          </>
        ) : (
          <TouchableOpacity 
            style={styles.noLiftsCard}
            onPress={handleEmptyCardPress}
            activeOpacity={0.7}
          >
            <View style={styles.noLiftsContent}>
              <Text style={styles.noLiftsTitle}>
                {allLifts.length === 0 ? 'No lifts analysed' : 
                 activeTab === 'favourites' ? 'No favourite lifts' : 'No lifts found'}
              </Text>
              <Text style={styles.noLiftsSubtitle}>
                {allLifts.length === 0 
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
}); 