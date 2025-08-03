import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated, Dimensions, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { LoadingLiftCard } from './LoadingLiftCard';

interface HomeScreenProps {
  onShowFeedback: (liftData: LiftData) => void;
  onShowFeedbackSlideshow: () => void;
  onShowLibrary: () => void;
  onShowFavourites: () => void;
}

interface LiftData {
  id: string;
  liftType: string;
  liftDate: string;
  accuracy: number;
  lineGraphValues: number[];
  weight: number;
  unit: string;
  sets: number;
  reps: number;
  videoURL: any;
  thumbnailURL?: any;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow, onShowLibrary, onShowFavourites }: HomeScreenProps) {
  const { loadingLifts, completedLifts, addLoadingLift } = useLoadingLifts();
  
  // Use completed lifts from context instead of dummy data
  const recentLifts: LiftData[] = completedLifts;

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

  const handleLiftPress = (lift: LiftData) => {
    hapticFeedback.selection();
    onShowFeedback(lift);
  };

  const handleLibraryPress = () => {
    hapticFeedback.selection();
    onShowLibrary();
  };

  const handleFavouritesPress = () => {
    hapticFeedback.selection();
    onShowFavourites();
  };

  // Test function to add sample loading lifts
  const handleAddTestLift = () => {
    hapticFeedback.selection();
    const today = new Date().toISOString().split('T')[0];
    
    addLoadingLift({
      thumbnailUri: 'https://picsum.photos/200/300',
      movementType: 'Bench Press',
      weightValue: 135,
      weightUnit: 'lbs',
      reps: 8,
      dateToday: today,
    });
  };

  function LiftCard({ lift, index }: { lift: LiftData; index: number }) {
    // Ensure the animation values exist before using them
    const translateY = liftAnimations.current[index]?.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0], // Start 50px below, animate to normal position
    }) || new Animated.Value(0);

    const opacity = fadeAnimations.current[index] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.liftCard,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity 
          onPress={() => handleLiftPress(lift)}
          activeOpacity={0.7}
          style={styles.liftCardContent}
        >
          {/* Video Thumbnail - Left 20% */}
          <View style={styles.videoThumbnailContainer}>
            {lift.thumbnailURL ? (
              <Image
                source={{ uri: lift.thumbnailURL }}
                style={styles.videoThumbnail}
                resizeMode="cover"
                onError={() => {
                  // Fallback to placeholder if thumbnail fails to load
                  console.warn('Failed to load thumbnail:', lift.thumbnailURL);
                }}
              />
            ) : (
              <Image
                source={require('../../../../assets/placeholder-thumbnail.png')}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />
            )}
          </View>
          
          {/* Content - Right 80% */}
          <View style={styles.liftContent}>
            <View style={styles.liftHeader}>
              <Text style={styles.liftName}>{lift.liftType}</Text>
              <Text style={styles.liftDate}>{lift.liftDate}</Text>
            </View>
            <View style={styles.liftAccuracyContainer}>
              <Text style={styles.accuracyLabel}>Accuracy</Text>
              <View style={styles.accuracyPill}>
                <Text style={styles.accuracyValue}>{lift.accuracy}%</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

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
            <TouchableOpacity 
              style={styles.topCard}
              onPress={handleFavouritesPress}
              activeOpacity={0.7}
            >
              <View style={styles.topCardContent}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <Path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </Svg>
                <Text style={styles.topCardTitle}>Favourites</Text>
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
              recentLifts.map((lift, index) => (
                <LiftCard key={lift.id} lift={lift} index={index} />
              ))
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
  liftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  liftCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -20, // Extend beyond card padding
  },
  videoThumbnailContainer: {
    height: 120,
    width: Dimensions.get('window').width * 0.25, // 25% of screen width
    overflow: 'hidden',
    borderTopLeftRadius: 18, // Only left side border radius
    borderBottomLeftRadius: 18, // Only left side border radius
    marginVertical: -20, // Extend beyond card padding
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7', // Light gray background
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
  },
  liftContent: {
    flex: 1,
    paddingLeft: 16, // Add padding to separate from video
    paddingRight: 16, // Add padding to prevent text from touching right edge
  },
  liftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  liftDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
  },
  liftAccuracyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
  },
  accuracyPill: {
    backgroundColor: '#000',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
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