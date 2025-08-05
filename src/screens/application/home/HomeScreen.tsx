import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Dimensions, ImageSourcePropType, ImageBackground, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { LoadingLiftCard } from './LoadingLiftCard';
import { ILiftData } from '../feedback/liftDetails';
import { LiftDataCard } from '../../../components/LiftDataCard';
import { SwipeableCalendar } from '../../../components/ui/SwipeableCalendar';
import { useUserDetails } from '../../../context/UserDetailsContext';

interface HomeScreenProps {
  onShowFeedback: (liftData: ILiftData) => void;
  onShowFeedbackSlideshow: () => void;
  onShowLibrary: () => void;
  onShowShare: () => void;
  onTriggerAddOptions: () => void;
  onNavigateToPerformance: () => void;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow, onShowLibrary, onShowShare, onTriggerAddOptions, onNavigateToPerformance }: HomeScreenProps) {
  const { loadingLifts, completedLifts, addLoadingLift, removeCompletedLift } = useLoadingLifts();
  const { userDetails } = useUserDetails();
  
  // Random percentage value between 1-100
  const [percentageValue, setPercentageValue] = useState(() => Math.floor(Math.random() * 100) + 1);
  
  // Fire card popup state
  const [isFirePopupVisible, setIsFirePopupVisible] = useState(false);
  
  // Use completed lifts from context instead of dummy data
  const recentLifts: ILiftData[] = completedLifts;

  // Animation values for each lift card - recreate when lifts change
  const liftAnimations = useRef<Animated.Value[]>([]);
  const fadeAnimations = useRef<Animated.Value[]>([]);

  // Update animation arrays when lifts change
  useEffect(() => {
    const newLiftAnimations = recentLifts.map(() => new Animated.Value(0));
    const newFadeAnimations = recentLifts.map(() => new Animated.Value(0));
    
    liftAnimations.current = newLiftAnimations;
    fadeAnimations.current = newFadeAnimations;
  }, [recentLifts]);

  // Animate lift cards when lifts change
  useEffect(() => {
    if (recentLifts.length === 0) return;

    const animations = recentLifts.map((_, index) => {
      return Animated.parallel([
        Animated.timing(liftAnimations.current[index], {
          toValue: 1,
          duration: 300,
          delay: index * 50, // Stagger the animations
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimations.current[index], {
          toValue: 1,
          duration: 250,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  }, [recentLifts]); // Re-run when lifts change

  const handleLiftPress = (lift: ILiftData) => {
    hapticFeedback.selection();
    onShowFeedback(lift);
  };

  const handleDeleteLift = (liftId: string) => {
    hapticFeedback.success();
    removeCompletedLift(liftId);
  };

  const handleLibraryPress = () => {
    hapticFeedback.selection();
    onShowLibrary();
  };

  const handleReferCardPress = () => {
    hapticFeedback.selection();
    onShowShare();
  };

  const handleNoLiftsPress = () => {
    hapticFeedback.selection();
    onTriggerAddOptions();
  };

  const handleDateSelect = (date: Date) => {
    hapticFeedback.selection();
    // You can add logic here to filter lifts by date or perform other actions
  };

  const handleFireCardPress = () => {
    hapticFeedback.selection();
    setIsFirePopupVisible(true);
  };

  const handleFirePopupClose = () => {
    hapticFeedback.selection();
    setIsFirePopupVisible(false);
  };

  const handleAccuracyCardPress = () => {
    hapticFeedback.selection();
    onNavigateToPerformance();
  };

  // Test function to add sample loading lifts
  const handleAddTestLift = async () => {
    hapticFeedback.selection();
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await addLoadingLift({
        thumbnailUri: 'https://picsum.photos/200/300',
        movementType: 'Bench Press',
        weightValue: 135,
        weightUnit: 'lbs',
        reps: 8,
        dateToday: today,
      });
    } catch (error) {
      console.error('Failed to add test lift:', error);
      // You could show a toast notification here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image 
            source={require('../../../../assets/formai-light-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          {/* Test button - remove this in production */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={handleAddTestLift}
          >
            <Text style={styles.testButtonText}>Add Test Lift</Text>
          </TouchableOpacity>
        </View>
        
        {/* Swipeable Calendar */}
        <SwipeableCalendar 
          onDateSelect={handleDateSelect} 
          initialSelectedDate={new Date()}
          daysLogged={userDetails.daysLogged}
        />
        
        {/* Single Card */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.accuracyCard}
            onPress={handleAccuracyCardPress}
            activeOpacity={0.7}
          >
            <View style={styles.accuracyCardContent}>
              <View style={styles.accuracyCardLeftSection}>
                <Text style={styles.accuracyCardNumber}>{percentageValue}%</Text>
                <Text style={styles.accuracyCardLabel}>Daily accuracy level</Text>
              </View>
              <View style={styles.accuracyCardRightSection}>
                <Svg width={120} height={120} viewBox="0 0 120 120">
                  {/* Background circle */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#E5E5E5"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle - percentage filled */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="#000000"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - percentageValue / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                  {/* Inner circle */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="#FFFFFF"
                  />
                </Svg>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Spacer to push content to bottom */}
        <View style={styles.spacer} />
        
        <View style={styles.bottomContent}>
          <View style={styles.topCardsContainer}>
            <TouchableOpacity 
              style={styles.fireCard}
              activeOpacity={0.7}
              onPress={handleFireCardPress}
            >
              <View style={styles.fireCardContent}>
                <Image 
                  source={require('../../../../assets/icons/fire.png')}
                  style={styles.fireIcon}
                  resizeMode="contain"
                />
                <Text style={styles.fireNumber}>12</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.rightCardsContainer}>
              <TouchableOpacity 
                style={styles.blankCard}
                onPress={handleReferCardPress}
                activeOpacity={0.7}
              >
                <ImageBackground 
                  source={require('../../../../assets/homescreen-refer-image.png')}
                  style={styles.blankCardBackground}
                  imageStyle={styles.blankCardImage}
                  resizeMode="cover"
                >
                  <View style={styles.blankCardOverlay}>
                    <Text style={styles.blankCardTitle}>Earn by Referring!</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.topCard, styles.libraryCard]}
                onPress={handleLibraryPress}
                activeOpacity={0.7}
              >
                <View style={styles.topCardContent}>
                  <Text style={styles.topCardTitle}>Your video library</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Lifts</Text>
          <View 
            style={styles.liftsScrollView} 
          >
            {/* Show loading lifts first */}
            {loadingLifts.map((loadingLift) => (
              <LoadingLiftCard key={loadingLift.id} lift={loadingLift} />
            ))}
            
            {/* Show completed lifts */}
            {recentLifts.length > 0 ? (
              recentLifts.map((lift, index) => {
                return (
                  <LiftDataCard 
                    key={lift.id} 
                    lift={lift} 
                    onPress={() => handleLiftPress(lift)}
                    onDelete={handleDeleteLift}
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
                  <Text style={styles.noLiftsTitle}>No recorded lifts for this date</Text>
                  <Text style={styles.noLiftsSubtitle}>Start analysing your workout by taking a quick video</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
      
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

            {/* Title with FormAI logo */}
            <View style={styles.modalHeader}>
              <Image 
                source={require('../../../../assets/formai-light-icon.png')}
                style={styles.modalLogo}
                resizeMode="contain"
              />
            </View>

            {/* Large centered fire icon */}
            <View style={styles.fireModalContent}>
              <Image 
                source={require('../../../../assets/icons/fire.png')}
                style={styles.fireModalIcon}
                resizeMode="contain"
              />
            </View>

            {/* Streak text */}
            <Text style={styles.streakText}>12 day streak!</Text>

            {/* Message */}
            <Text style={styles.message}>You're on fire! Keep up the great work with your daily streaks.</Text>

            {/* Action button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                hapticFeedback.success();
                handleFirePopupClose();
              }}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -52,
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
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SF Pro Text',
  },
  scrollView: {
    flex: 1,
    marginBottom: -62,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'SF Pro Display',
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
  topCardsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
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
  libraryCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankCard: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  blankCardBackground: {
    borderRadius: 18,
    height: 60,
    alignItems: 'flex-start',
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
  blankCardImage: {
    borderRadius: 18,
  },
  blankCardContent: {
    padding: 20,
  },
  blankCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SF Pro Text',
  },
  blankCardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
    textAlign: 'center',
  },
  topCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SF Pro Text',
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
  accuracyCard: {
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
    marginBottom: 24,
  },
  accuracyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  accuracyCardLeftSection: {
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  accuracyCardNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  accuracyCardLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
  },
  accuracyCardRightSection: {
    alignItems: 'center',
  },
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireIcon: {
    width: 44,
    height: 44,
  },
  fireNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  rightCardsContainer: {
    flexDirection: 'column',
    gap: 12,
    width: '70%',
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
    fontWeight: '400',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    height: 44,
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