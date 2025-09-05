import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, ImageSourcePropType, ImageBackground, Modal, Animated as RNAnimated } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { useLiftData, ILiftData } from '../../../context/LiftDataContext';
import { deleteLift as deleteLiftApi } from '../../../services/liftService';
import { LiftCard } from '../../../components/LiftCard';
import { SwipeableCalendar } from '../../../components/ui/SwipeableCalendar';
import { SwipeableAccuracyCard } from '../../../components/ui/SwipeableAccuracyCard';
import { StreakModal } from '../../../components/ui/StreakModal';
import { useUserCheckIns } from '../../../context/UserCheckInsContext';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { useSelectedDate } from '../../../context/SelectedDateContext';

import i18n from '../../../utils/i18n';
import { ChevronRight, FileVideoCamera } from 'lucide-react-native';

interface HomeScreenProps {
  onShowFeedback: (liftData: ILiftData) => void;
  onShowFeedbackSlideshow: () => void;
  onShowLibrary: () => void;
  onShowShare: () => void;
  onTriggerAddOptions: () => void;
  onNavigateToPerformance: () => void;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow, onShowLibrary, onShowShare, onTriggerAddOptions, onNavigateToPerformance }: HomeScreenProps) {
  const { loadingLifts, showStreakModal, closeStreakModal } = useLoadingLifts();
  const { liftData , getLiftsByDate , refreshLifts } = useLiftData();
  const { currentStreak } = useUserCheckIns();
  const { selectedDate, setSelectedDate } = useSelectedDate();
  
  // Fire card popup state - manual trigger for fire card press
  const [isFirePopupVisible, setIsFirePopupVisible] = useState(false);
  
  // Accuracy card swipe state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // ScrollView ref for gesture handling
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Tutorial target ref for the "see all lifts" button
  const { ref: seeAllLiftsRef } = useTutorialTarget('home_see_all_lifts');
  
  // Lifts for the selected date from LiftDataContext only
  const liftsForSelectedDate: ILiftData[] = getLiftsByDate(selectedDate);
  
  // Combined lifts for seamless transition - loading lifts + final lifts (excluding duplicates)
  const combinedLiftsForDay = useMemo(() => {
    // loading lifts are already filtered by selected date in context
    const loading = loadingLifts;

    // any completed loading items with finalData should hide the same ILiftData (by id)
    const completedMap = new Set<string>(
      loading
        .filter(l => l.status === 'completed' && l.finalData?.id)
        .map(l => l.finalData!.id)
    );

    const finals = liftsForSelectedDate.filter(l => !completedMap.has(l.id));

    // show loading first, then finals (or mix if you prefer)
    return [...loading, ...finals];
  }, [loadingLifts, liftsForSelectedDate]);
  
  // Calculate average accuracy for the selected date
  const averageAccuracy = useMemo(() => {
    return liftsForSelectedDate.length > 0 
      ? Math.round(liftsForSelectedDate.reduce((sum, lift) => sum + lift.analysis.accuracy, 0) / liftsForSelectedDate.length)
      : 0;
  }, [liftsForSelectedDate]);
  
  // Calculate average accuracy for all lifts across all dates
  const allTimeAverageAccuracy = useMemo(() => {
    return liftData.length > 0 
      ? Math.round(liftData.reduce((sum, lift) => sum + lift.analysis.accuracy, 0) / liftData.length)
      : 0;
  }, [liftData]);

  // Format selected date with ordinal suffix
  const formatSelectedDate = useCallback(() => {
    const day = selectedDate.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[selectedDate.getMonth()];
    
    // Add ordinal suffix to day
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    
    return `${day}${suffix} ${month} lifts`;
  }, [selectedDate]);
  
  // Different data for each card
  const cardData = useMemo(() => [
    { 
      percentage: averageAccuracy, 
      label: liftsForSelectedDate.length > 0 ? i18n.t('home.dailyAccuracyLevel') : i18n.t('home.noLiftsToday')
    },
    { percentage: allTimeAverageAccuracy, label: i18n.t('home.allTimeAccuracy') }
  ], [averageAccuracy, allTimeAverageAccuracy, liftsForSelectedDate.length]);

  // Animation values for each lift card - recreate when lifts change
  const liftAnimations = useRef<RNAnimated.Value[]>([]);
  const fadeAnimations = useRef<RNAnimated.Value[]>([]);

  // Update animation arrays when lifts change
  useEffect(() => {
    const newLiftAnimations = liftsForSelectedDate.map(() => new RNAnimated.Value(0));
    const newFadeAnimations = liftsForSelectedDate.map(() => new RNAnimated.Value(0));
    
    liftAnimations.current = newLiftAnimations;
    fadeAnimations.current = newFadeAnimations;
  }, [liftsForSelectedDate]);



  // Animate lift cards when lifts change
  useEffect(() => {
    if (liftsForSelectedDate.length === 0) return;

    const animations = liftsForSelectedDate.map((_, index) => {
      return RNAnimated.parallel([
        RNAnimated.timing(liftAnimations.current[index], {
          toValue: 1,
          duration: 300,
          delay: index * 50, // Stagger the animations
          useNativeDriver: true,
        }),
        RNAnimated.timing(fadeAnimations.current[index], {
          toValue: 1,
          duration: 250,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]);
    });

    RNAnimated.parallel(animations).start();
  }, [liftsForSelectedDate]); // Re-run when lifts change

  const handleLiftPress = useCallback((liftId: string) => {
    hapticFeedback.selection();
    const lift = liftsForSelectedDate.find(l => l.id === liftId) || liftData.find(l => l.id === liftId);
    if (lift) {
      onShowFeedback(lift);
    }
  }, [liftsForSelectedDate, liftData, onShowFeedback]);

  const handleDeleteLift = useCallback(async (liftId: string) => {
    hapticFeedback.success();
    const ok = await deleteLiftApi(liftId);
    if (ok) {
      await refreshLifts();
    }
  }, [refreshLifts]);

  const handleLibraryPress = useCallback(() => {
    hapticFeedback.selection();
    onShowLibrary();
  }, [onShowLibrary]);

  const handleNoLiftsPress = useCallback(() => {
    hapticFeedback.selection();
    onTriggerAddOptions();
  }, [onTriggerAddOptions]);

  const handleDateSelect = useCallback((date: Date) => {
    hapticFeedback.selection();
    setSelectedDate(date);
  }, [setSelectedDate]);

  const handleFireCardPress = useCallback(() => {
    hapticFeedback.selection();
    // This will show the manual fire popup (different from streak-triggered popup)
    setIsFirePopupVisible(true);
  }, []);

  const handleFirePopupClose = useCallback(() => {
    hapticFeedback.selection();
    setIsFirePopupVisible(false);
  }, []);



  // Ensure we load lifts from backend on first mount
  useEffect(() => {
    void refreshLifts();
  }, []);

  // Expose showFirstLiftDetails function globally for tutorial
  useEffect(() => {
    (global as any).showFirstLiftDetails = () => {
      // Find the first lift in the current date's lifts, or fall back to any lift
      const firstLift = liftsForSelectedDate.length > 0 
        ? liftsForSelectedDate[0] 
        : liftData.length > 0 
          ? liftData[0] 
          : null;
      
      if (firstLift) {
        hapticFeedback.selection();
        onShowFeedback(firstLift);
      }
    };

    return () => {
      (global as any).showFirstLiftDetails = undefined;
    };
  }, [liftsForSelectedDate, liftData, onShowFeedback]);

  // Expose navigateToLibrary function globally for tutorial
  useEffect(() => {
    (global as any).navigateToLibrary = () => {
      hapticFeedback.selection();
      onShowLibrary();
    };

    return () => {
      (global as any).navigateToLibrary = undefined;
    };
  }, [onShowLibrary]);

  // Render function for unified FlashList
  const renderLiftItem = useCallback(({ item }: { item: any }) => (
    <LiftCard
      lift={item}
      onPress={handleLiftPress}
      showDate={!('status' in item)} // show date pill for true final only
    />
  ), [handleLiftPress]);

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      ref={scrollViewRef}
    >
      <View style={styles.header}>
        <Image
          source={require('../../../../assets/formai-light-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Pressable 
          style={({ pressed }) => [
            styles.streakBadge,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={handleFireCardPress}
        >
          <Image
            source={require('../../../../assets/icons/fire.png')}
            style={styles.streakBadgeIcon}
            contentFit="contain"
          />
          <Text style={styles.streakBadgeText}>{currentStreak}</Text>
        </Pressable>
      </View>
      
      {/* Swipeable Calendar */}
      <SwipeableCalendar 
        onDateSelect={handleDateSelect} 
      />
      
      {/* Swipeable Accuracy Card */}
      <SwipeableAccuracyCard
        cardData={cardData}
        currentCardIndex={currentCardIndex}
        onCardIndexChange={setCurrentCardIndex}
      />
      
      {/* Spacer to push content to bottom */}
      <View style={styles.spacer} />
      
      <View style={styles.bottomContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{formatSelectedDate()}</Text>
          <Pressable 
            ref={seeAllLiftsRef}
            style={({ pressed }) => [
              styles.seeAllPill,
              { opacity: pressed ? 0.7 : 1 }
            ]} 
            onPress={handleLibraryPress}
          >
            <Text style={styles.seeAllText}>{i18n.t('home.seeAll')}</Text>
            <FileVideoCamera size={16} color="#8E8E93" />
          </Pressable>
        </View>
        <View style={styles.liftsScrollView}>
          {/* Show unified list of loading and final lifts */}
          {combinedLiftsForDay.length > 0 ? (
            <FlashList
              data={combinedLiftsForDay}
              renderItem={renderLiftItem}
              keyExtractor={(item) => item.id}
              estimatedItemSize={146}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          ) : (
            <LiftCard
              lift={null}
              isNoLiftsCard={true}
              noLiftsTitle={i18n.t('home.noRecordedLifts')}
              noLiftsSubtitle={i18n.t('home.startAnalyzingWorkout')}
              onNoLiftsPress={handleNoLiftsPress}
            />
          )}
        </View>
      </View>
      
      {/* Streak-triggered Fire Card Popup */}
      <StreakModal
        visible={showStreakModal}
        currentStreak={currentStreak}
        onClose={closeStreakModal}
      />
      
      {/* Manual Fire Card Popup */}
      <StreakModal
        visible={isFirePopupVisible}
        currentStreak={currentStreak}
        onClose={handleFirePopupClose}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    marginBottom: -62,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 40,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakBadgeIcon: {
    width: 18,
    height: 18,
  },
  streakBadgeText: {
    marginLeft: 2,
    marginTop: 4,
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,

  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
    marginRight: 2,
  },
  seeAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  spacer: {
    flex: 1,
  },
  bottomContent: {
    backgroundColor: 'transparent',
  },
  liftsScrollView: {
    backgroundColor: 'transparent',
    paddingBottom: 54,
  },
  liftsScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  loadingLiftsContainer: {
    paddingHorizontal: 20,
  },




}); 