import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageSourcePropType, ImageBackground, Modal, Animated as RNAnimated } from 'react-native';
import { Image } from 'expo-image';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { useLiftData, ILiftData } from '../../../context/LiftDataContext';
import { deleteLift as deleteLiftApi } from '../../../services/liftService';
import { LoadingLiftCard } from './LoadingLiftCard';
import { LiftDataCard } from '../../../components/LiftDataCard';
import { SwipeableCalendar } from '../../../components/ui/SwipeableCalendar';
import { SwipeableAccuracyCard } from '../../../components/ui/SwipeableAccuracyCard';
import { useUserCheckIns } from '../../../context/UserCheckInsContext';
import { useTutorialTarget } from '../../../context/TutorialContext';

import i18n from '../../../utils/i18n';
import { X, ChevronRight } from 'lucide-react-native';

interface HomeScreenProps {
  onShowFeedback: (liftData: ILiftData) => void;
  onShowFeedbackSlideshow: () => void;
  onShowLibrary: () => void;
  onShowShare: () => void;
  onTriggerAddOptions: () => void;
  onNavigateToPerformance: () => void;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow, onShowLibrary, onShowShare, onTriggerAddOptions, onNavigateToPerformance }: HomeScreenProps) {
  const { loadingLifts } = useLoadingLifts();
  const { liftData , getLiftsByDate , refreshLifts } = useLiftData();
  const { currentStreak } = useUserCheckIns();
  
  // Selected date state for calendar
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Fire card popup state
  const [isFirePopupVisible, setIsFirePopupVisible] = useState(false);
  
  // Accuracy card swipe state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // ScrollView ref for gesture handling
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Tutorial target ref for the "see all lifts" button
  const { ref: seeAllLiftsRef } = useTutorialTarget('home_see_all_lifts');
  
  // Lifts for the selected date from LiftDataContext only
  const liftsForSelectedDate: ILiftData[] = getLiftsByDate(selectedDate);
  
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

  const handleLiftPress = (lift: ILiftData) => {
    hapticFeedback.selection();
    onShowFeedback(lift);
  };

  const handleDeleteLift = async (liftId: string) => {
    hapticFeedback.success();
    const ok = await deleteLiftApi(liftId);
    if (ok) {
      await refreshLifts();
    }
  };

  const handleLibraryPress = () => {
    hapticFeedback.selection();
    onShowLibrary();
  };



  const handleNoLiftsPress = () => {
    hapticFeedback.selection();
    onTriggerAddOptions();
  };

  const handleDateSelect = (date: Date) => {
    hapticFeedback.selection();
    setSelectedDate(date);
  };

  const handleFireCardPress = () => {
    hapticFeedback.selection();
    setIsFirePopupVisible(true);
  };

  const handleFirePopupClose = () => {
    hapticFeedback.selection();
    setIsFirePopupVisible(false);
  };



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
        <TouchableOpacity 
          style={styles.streakBadge}
          activeOpacity={0.7}
          onPress={handleFireCardPress}
        >
          <Image
            source={require('../../../../assets/icons/fire.png')}
            style={styles.streakBadgeIcon}
            contentFit="contain"
          />
          <Text style={styles.streakBadgeText}>{currentStreak}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Swipeable Calendar */}
      <SwipeableCalendar 
        onDateSelect={handleDateSelect} 
        initialSelectedDate={selectedDate}
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
          <Text style={styles.sectionTitle}>{i18n.t('home.lifts')}</Text>
          <TouchableOpacity 
            ref={seeAllLiftsRef}
            style={styles.seeAllPill} 
            onPress={handleLibraryPress} 
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>{i18n.t('home.seeAll')}</Text>
                              <ChevronRight size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        <View 
          style={styles.liftsScrollView} 
        >
          {/* Show loading lifts first */}
          {loadingLifts.map((loadingLift) => (
            <LoadingLiftCard key={loadingLift.id} lift={loadingLift} />
          ))}
          
          {/* Show completed lifts for selected date */}
          {liftsForSelectedDate.length > 0 ? (
            liftsForSelectedDate.map((lift, index) => {
              return (
                <LiftDataCard 
                  key={lift.id} 
                  lift={lift} 
                  onPress={() => handleLiftPress(lift)}
                />
              );
            })
          ) : loadingLifts.length === 0 ? (
            <TouchableOpacity 
              style={styles.noLiftsCard}
              onPress={handleNoLiftsPress}
              activeOpacity={0.7}
            >
              <View style={styles.noLiftsContent}>
                <Text style={styles.noLiftsTitle}>{i18n.t('home.noRecordedLifts')}</Text>
                <Text style={styles.noLiftsSubtitle}>{i18n.t('home.startAnalyzingWorkout')}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Fire Card Popup */}
      <Modal
        visible={isFirePopupVisible}
        transparent
        onRequestClose={handleFirePopupClose}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={handleFirePopupClose}
        >
          <TouchableOpacity 
            style={styles.modalContainer} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                hapticFeedback.selection();
                handleFirePopupClose();
              }}
            >
              <X size={20} color="#000000" />
            </TouchableOpacity>

            {/* Title with FormAI logo */}
            <View style={styles.modalHeader}>
              <Image
                source={require('../../../../assets/formai-light-icon.png')}
                style={styles.modalLogo}
                contentFit="contain"
              />
            </View>

            {/* Large centered fire icon */}
            <View style={styles.fireModalContent}>
              <Image
                source={require('../../../../assets/icons/fire.png')}
                style={styles.fireModalIcon}
                contentFit="contain"
              />
            </View>

            {/* Streak text */}
            <Text style={styles.streakText}>
              {currentStreak === 0
                ? i18n.t('home.zeroDayStreak')
                : i18n.t('home.dayStreak', { count: currentStreak })}
            </Text>

            {/* Message */}
            <Text style={styles.message}>
              {currentStreak === 0
                ? i18n.t('home.noStreakMessage')
                : i18n.t('home.onFireMessage')}
            </Text>

            {/* Action button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                hapticFeedback.success();
                handleFirePopupClose();
              }}
            >
              <Text style={styles.buttonText}>{i18n.t('home.continue')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 24,
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
  },
  seeAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
    gap: 4,
  },
  spacer: {
    flex: 1,
  },
  bottomContent: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  liftsScrollView: {
    backgroundColor: 'transparent',
  },
  liftsScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    paddingBottom: 20,
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
    fontFamily: 'SF Pro Display',
  },
  noLiftsSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
    textAlign: 'center',
  },

  blankCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fireCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
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
    width: '28%',
  },
  fireCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fireIcon: {
    width: 44,
    height: 44,
  },
  fireNumber: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'left',
  },
  fireModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fireModalIcon: {
    width: 118,
    height: 118,
  },
  streakText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ed694a',
    fontFamily: 'SF Pro Display',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: -16,
  },
  modalHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalLogo: {
    width: 100,
    height: 30,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    height: 65,
    borderRadius: 18,
    backgroundColor: '#ed694a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },

}); 