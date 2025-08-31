import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { hapticFeedback } from '../../utils/haptic';
import { CircularProgressChart } from '../icons/icons';
import { useLiftData } from '../../context/LiftDataContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Config
const CARD_HEIGHT = 130;
const CARD_WIDTH = SCREEN_WIDTH * 0.9; // ✅ slightly smaller than screen

interface AccuracyCardData {
  percentage: number;
  label: string;
}

interface SwipeableAccuracyCardProps {
  cardData: AccuracyCardData[];
  currentCardIndex: number;
  onCardIndexChange: (index: number) => void;
}

export function SwipeableAccuracyCard({
  cardData,
  currentCardIndex,
  onCardIndexChange,
}: SwipeableAccuracyCardProps) {
  const { addLift, formatDateForLift } = useLiftData();

  const renderItem = ({ item }: { item: AccuracyCardData }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.accuracyCard}>
        <View style={styles.accuracyCardContent}>
          <View style={styles.accuracyCardLeftSection}>
            <Text style={styles.accuracyCardNumber}>{item.percentage}%</Text>
            <Text style={styles.accuracyCardLabel}>{item.label}</Text>
          </View>
          <View style={styles.accuracyCardRightSection}>
            <CircularProgressChart
              width={100}
              height={100}
              percentage={item.percentage}
              progressColor="#000000"
              backgroundColor="#E5E5E5"
              strokeWidth={10}
              radius={42}
              showTargetIcon={true}
              iconColor="#000000"
              iconSize={20}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const handleAddTestLift = () => {
    hapticFeedback.selection();
    
    // Random movement selection
    const movements = [
      'Barbell Front Squat',
      'Deadlift',
      'Bench Press',
      'Overhead Press',
      'Romanian Deadlift',
      'Goblet Squat',
      'Push-ups',
      'Pull-ups',
      'Lunges',
      'Planks',
      'Bent Over Rows',
      'Shoulder Press',
      'Bicep Curls',
      'Tricep Dips',
      'Leg Press'
    ];
    const randomMovement = movements[Math.floor(Math.random() * movements.length)];
    
    // Random accuracy between 60-95%
    const randomAccuracy = Math.floor(Math.random() * 36) + 60;
    
    // Random weight between 40-200
    const randomWeight = Math.floor(Math.random() * 161) + 40;
    
    // Random reps between 1-12
    const randomReps = Math.floor(Math.random() * 12) + 1;
    
    // Generate random line graph values based on reps
    const randomLineGraphValues = Array.from({ length: randomReps }, () => 
      Math.floor(Math.random() * 36) + 60
    );
    
    // Random time between 8 AM and 10 PM
    const randomHour = Math.floor(Math.random() * 14) + 8;
    const randomMinute = Math.floor(Math.random() * 60);
    const randomTime = `${randomHour > 12 ? randomHour - 12 : randomHour}:${randomMinute.toString().padStart(2, '0')} ${randomHour >= 12 ? 'PM' : 'AM'}`;
    
    // Create the test lift
    const today = new Date();
    const id = `demo-${today.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
    
    addLift({
      id,
      isFavourite: Math.random() > 0.7, // 30% chance of being favourite
      liftType: "Deadlift",
      liftDate: formatDateForLift(today),
      liftTime: randomTime,
      weightValue: randomWeight,
      reps: randomReps,
      rawVideoURL: require('../../../assets/tutorial/formai-example-video.mp4'),
      poseVideoURL: require('../../../assets/tutorial/formai-example-pose.mp4'),
      thumbnailURL: require('../../../assets/tutorial/formai-example-video-thumbnail.jpg'),
      analysis: {
        accuracy: randomAccuracy,
        lineGraphValues: randomLineGraphValues,
        feedback: [
          {
            imageURL: require('../../../assets/tutorial/formai-example-feedback.png'),
            flaws: [
              "Right knee is caving inward compared to the left, showing knee valgus.",
              "Right ankle angle suggests the heel may be lifting more than the left.",
              "Torso is leaning forward excessively, which stresses the lower back.",
              "Barbell path is slightly forward of mid-foot, reducing lifting efficiency.",
              "Hip angle indicates possible butt wink or pelvic tuck at the bottom."
            ],
            improvement: [
              "Actively push knees out and think 'spread the floor' with your feet to prevent valgus.",
              "Improve ankle dorsiflexion with stretches and banded mobilizations to keep heels grounded.",
              "Brace your core harder using the Valsalva maneuver to maintain an upright torso.",
              "Keep the bar over mid-foot and adjust grip width to tighten the upper back.",
              "Strengthen glutes and hamstrings with RDLs, hip thrusts, and pause squats to control hip position.",
              "Consider weightlifting shoes with a heel lift if ankle mobility limits squat depth."
            ],
          },
        ],
      },
    });
  };

  return (
    <View style={styles.root}>
      <Carousel
        loop={false}
        width={SCREEN_WIDTH}
        height={CARD_HEIGHT}
        data={cardData}
        renderItem={renderItem}
        pagingEnabled
        snapEnabled
        defaultIndex={currentCardIndex}
        onSnapToItem={(index) => {
          if (index !== currentCardIndex) {
            onCardIndexChange(index);
          }
        }}
        style={{
          backgroundColor: 'transparent',
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {cardData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === currentCardIndex
                ? styles.paginationDotActive
                : styles.paginationDotInactive,
            ]}
            activeOpacity={0.7}
          />
        ))}
      </View>

      {/* Test Lift Button - Only visible in development */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.testLiftButton}
          onPress={handleAddTestLift}
          activeOpacity={0.7}
        >
          <Text style={styles.testLiftButtonText}>Add Random Test Lift</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWrapper: {
    width: SCREEN_WIDTH,               // ✅ each page = screen width
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_WIDTH,                 // ✅ narrower card = gap at edges
    height: CARD_HEIGHT,
  },
  accuracyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  accuracyCardLeftSection: { alignItems: 'flex-start', paddingLeft: 8 },
  accuracyCardNumber: {
    fontSize: 46,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  accuracyCardLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
  },
  accuracyCardRightSection: { alignItems: 'center' },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: { backgroundColor: '#000000' },
  paginationDotInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
  },
  testLiftButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
    alignSelf: 'center',
  },
  testLiftButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display',
  },
});
