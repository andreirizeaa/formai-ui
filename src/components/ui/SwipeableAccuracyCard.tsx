import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptic';
import { CircularProgressChart } from '../icons/icons';

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
  onCardIndexChange 
}: SwipeableAccuracyCardProps) {
  const translateX = useSharedValue(0);

  const handleAccuracyCardSwipe = (direction: 'left' | 'right') => {
    hapticFeedback.selection();
    const newIndex = direction === 'left' 
      ? currentCardIndex + 1  // Next card
      : currentCardIndex - 1; // Previous card
    
    // Prevent swiping beyond bounds
    if (newIndex < 0 || newIndex >= cardData.length) {
      hapticFeedback.error();
      return;
    }
    
    onCardIndexChange(newIndex);
  };

  const handlePaginationDotPress = (index: number) => {
    hapticFeedback.selection();
    onCardIndexChange(index);
  };

  const accuracyCardGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = 50;
      if (event.translationX > threshold) {
        // Swipe right (positive translation) = go to previous card
        runOnJS(handleAccuracyCardSwipe)('right');
      } else if (event.translationX < -threshold) {
        // Swipe left (negative translation) = go to next card
        runOnJS(handleAccuracyCardSwipe)('left');
      }
      translateX.value = withSpring(0);
    },
  });

  const accuracyCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.cardsContainer}>
      <PanGestureHandler onGestureEvent={accuracyCardGestureHandler}>
        <Animated.View style={accuracyCardAnimatedStyle}>
          <View style={styles.accuracyCard}>
            <View style={styles.accuracyCardContent}>
              <View style={styles.accuracyCardLeftSection}>
                <Text style={styles.accuracyCardNumber}>
                  {cardData[currentCardIndex].percentage}%
                </Text>
                <Text style={styles.accuracyCardLabel}>
                  {cardData[currentCardIndex].label}
                </Text>
              </View>
              <View style={styles.accuracyCardRightSection}>
                <CircularProgressChart
                  width={120}
                  height={120}
                  percentage={cardData[currentCardIndex].percentage}
                  progressColor="#000000"
                  backgroundColor="#E5E5E5"
                  strokeWidth={10}
                  radius={48}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
      
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {cardData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              index === currentCardIndex ? styles.paginationDotActive : styles.paginationDotInactive
            ]}
            onPress={() => handlePaginationDotPress(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
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
    width: '100%',
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -10,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#000000',
  },
  paginationDotInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
  },
});
