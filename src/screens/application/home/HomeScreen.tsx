import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Dimensions, ImageSourcePropType, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { LoadingLiftCard } from './LoadingLiftCard';
import { ILiftData } from '../feedback/liftDetails';
import { LiftDataCard } from '../../../components/LiftDataCard';
import { SwipeableCalendar } from '../../../components/ui/SwipeableCalendar';

interface HomeScreenProps {
  onShowFeedback: (liftData: ILiftData) => void;
  onShowFeedbackSlideshow: () => void;
  onShowLibrary: () => void;
  onShowShare: () => void;
  onTriggerAddOptions: () => void;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow, onShowLibrary, onShowShare, onTriggerAddOptions }: HomeScreenProps) {
  const { loadingLifts, completedLifts, addLoadingLift, removeCompletedLift } = useLoadingLifts();
  
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
        <SwipeableCalendar onDateSelect={handleDateSelect} />
        
        {/* Spacer to push content to bottom */}
        <View style={styles.spacer} />
        
        <View style={styles.bottomContent}>
          <View style={styles.topCardsContainer}>
            <TouchableOpacity 
              style={[styles.topCard, styles.libraryCard]}
              onPress={handleLibraryPress}
              activeOpacity={0.7}
            >
              <View style={styles.topCardContent}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <Path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </Svg>
                <Text style={styles.topCardTitle}>Lifts</Text>
              </View>
            </TouchableOpacity>
            
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
          </View>
          
          <Text style={styles.sectionTitle}>Recent Lifts</Text>
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
                  <Text style={styles.noLiftsTitle}>You haven't recorded any lifts</Text>
                  <Text style={styles.noLiftsSubtitle}>Start analysing today's workout by taking a quick video</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 0, // Increased from 20 to 100 to account for bottom navigation bar
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
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
    width: '35%',
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
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
    textAlign: 'center',
  },
  topCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 8,
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
}); 