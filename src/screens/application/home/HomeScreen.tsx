import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Dimensions, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { LoadingLiftCard } from './LoadingLiftCard';
import { ILiftData } from '../feedback/liftDetails';
import { LiftDataCard } from '../../../components/LiftDataCard';

interface HomeScreenProps {
  onShowFeedback: (liftData: ILiftData) => void;
  onShowFeedbackSlideshow: () => void;
  onShowLibrary: () => void;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow, onShowLibrary }: HomeScreenProps) {
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
    removeCompletedLift(liftId);
  };

  const handleLibraryPress = () => {
    hapticFeedback.selection();
    onShowLibrary();
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
        
        {/* Spacer to push content to bottom */}
        <View style={styles.spacer} />
        
        <View style={styles.bottomContent}>
          <View style={styles.topCardsContainer}>
            <TouchableOpacity 
              style={styles.topCard}
              onPress={handleLibraryPress}
              activeOpacity={0.7}
            >
              <View style={styles.topCardContent}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <Path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                </Svg>
                <Text style={styles.topCardTitle}>Library</Text>
              </View>
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
              <View style={styles.noLiftsCard}>
                <View style={styles.noLiftsContent}>
                  <Text style={styles.noLiftsTitle}>You haven't recorded any lifts</Text>
                  <Text style={styles.noLiftsSubtitle}>Start analysing today's workout by taking a quick video</Text>
                </View>
              </View>
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
    marginBottom: -58,
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
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '48%', // Adjust as needed for 50/50 split
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
}); 