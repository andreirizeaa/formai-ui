import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptic';

interface SummaryCardData {
  title: string;
  value: number;
  color: string;
}

interface SwipeableSummaryCardProps {
  cardData: any[]; // Raw lift data
  onTriggerAddOptions?: () => void;
  hasNoLifts?: boolean;
}

export function SwipeableSummaryCard({ cardData, onTriggerAddOptions, hasNoLifts = false }: SwipeableSummaryCardProps) {
  const { width } = Dimensions.get('window');
  
  // Current card index state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const translateX = useSharedValue(0);

  // Calculate summary card data
  const processedCardData = useMemo(() => {
    if (!cardData || cardData.length === 0) return [];

    const summaryCards: SummaryCardData[] = [];

    // 1. Average Accuracy Card
    const averageAccuracy = Math.round(cardData.reduce((sum, lift) => sum + lift.analysis.accuracy, 0) / cardData.length);
    const accuracyColor = averageAccuracy > 80 ? "#00a63e" : averageAccuracy < 50 ? "#fb2c36" : "#fe9a00";
    
    summaryCards.push({
      title: "Average accuracy",
      value: averageAccuracy,
      color: accuracyColor
    });

    // 2. Average Form Improvement Card
    const improvementData = calculateAverageFormImprovement(cardData);
    const improvementColor = improvementData > 10 ? "#00a63e" : improvementData < 0 ? "#fb2c36" : "#fe9a00";
    
    summaryCards.push({
      title: "Average form improvement",
      value: Math.round(improvementData),
      color: improvementColor
    });

    return summaryCards;
  }, [cardData]);

  // Calculate average form improvement across all movements
  function calculateAverageFormImprovement(lifts: any[]): number {
    if (lifts.length === 0) return 0;

    // Get all unique lift types
    const uniqueLiftTypes = [...new Set(lifts.map(lift => lift.liftType))];
    
    const movementImprovements: number[] = [];

    uniqueLiftTypes.forEach(liftType => {
      const liftsOfType = lifts.filter(lift => lift.liftType === liftType);
      
      if (liftsOfType.length < 2) return; // Need at least 2 lifts to calculate improvement
      
      // Sort by date (earliest to latest)
      const sortedLifts = liftsOfType.sort((a, b) => {
        const [dayA, monthA, yearA] = a.liftDate.split('-').map(Number);
        const [dayB, monthB, yearB] = b.liftDate.split('-').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });

      const earliestAccuracy = sortedLifts[0].analysis.accuracy;
      const latestAccuracy = sortedLifts[sortedLifts.length - 1].analysis.accuracy;
      
      const improvement = ((latestAccuracy - earliestAccuracy) / earliestAccuracy) * 100;
      movementImprovements.push(improvement);
    });

    // Return average improvement across all movements
    return movementImprovements.length > 0 
      ? movementImprovements.reduce((sum, improvement) => sum + improvement, 0) / movementImprovements.length 
      : 0;
  }

  const handleCardSwipe = (direction: 'left' | 'right') => {
    hapticFeedback.selection();
    
    if (direction === 'left' && currentCardIndex < processedCardData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else if (direction === 'right' && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handlePaginationDotPress = (index: number) => {
    hapticFeedback.selection();
    setCurrentCardIndex(index);
  };

  const cardGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      // Only respond to horizontal gestures (ignore vertical scrolling)
      const horizontalThreshold = 10; // Minimum horizontal movement to start gesture
      const verticalThreshold = 20; // Maximum vertical movement allowed
      
      // If vertical movement is greater than horizontal, ignore the gesture
      if (Math.abs(event.translationY) > Math.abs(event.translationX) + verticalThreshold) {
        return;
      }
      
      // Only start gesture if horizontal movement exceeds threshold
      if (Math.abs(event.translationX) < horizontalThreshold) {
        return;
      }
      
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = 50;
      if (event.translationX > threshold) {
        // Swipe right (positive translation) = go to previous card
        runOnJS(handleCardSwipe)('right');
      } else if (event.translationX < -threshold) {
        // Swipe left (negative translation) = go to next card
        runOnJS(handleCardSwipe)('left');
      }
      translateX.value = withSpring(0);
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.cardsContainer}>
      {hasNoLifts ? (
        // Simple clickable card when no lifts
        <TouchableOpacity 
          style={styles.performanceCard}
          onPress={() => {
            hapticFeedback.selection();
            onTriggerAddOptions?.();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.performanceCardContent}>
            <View style={styles.performanceCardHeader}>
              <Text style={styles.performanceCardLabel}>
                No lifts found
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        // Swipeable cards when there are lifts
        <>
          <PanGestureHandler 
            onGestureEvent={cardGestureHandler}
            shouldCancelWhenOutside={true}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-5, 5]}
          >
            <Animated.View style={cardAnimatedStyle}>
              <View style={styles.performanceSummaryCard}>
                <View style={styles.performanceSummaryCardContent}>
                  <View style={styles.performanceSummaryCardLeftSection}>
                    <Text style={styles.performanceSummaryCardNumber}>
                      {processedCardData[currentCardIndex]?.value || 0}%
                    </Text>
                    <Text style={styles.performanceSummaryCardLabel}>
                      {processedCardData[currentCardIndex]?.title || 'No data'}
                    </Text>
                  </View>
                  <View style={styles.performanceSummaryCardRightSection}>
                    <Svg width={120} height={120} viewBox="0 0 120 120">
                      {/* Background circle */}
                      <Circle
                        cx="60"
                        cy="60"
                        r="36"
                        stroke="#E5E5E5"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress circle - percentage filled */}
                      <Circle
                        cx="60"
                        cy="60"
                        r="36"
                        stroke={processedCardData[currentCardIndex]?.color || "#E5E5E5"}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 36}`}
                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - (processedCardData[currentCardIndex]?.value || 0) / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                      {/* Inner circle */}
                      <Circle
                        cx="60"
                        cy="60"
                        r="28"
                        fill="#FFFFFF"
                      />
                    </Svg>
                  </View>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>

          {/* Pagination Dots */}
          {processedCardData.length > 1 && (
            <View style={styles.paginationContainer}>
              {processedCardData.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentCardIndex && styles.paginationDotActive
                  ]}
                  onPress={() => handlePaginationDotPress(index)}
                >
                  <View style={styles.paginationDotInner} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    marginBottom: 24,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceCardContent: {
    alignItems: 'center',
  },
  performanceCardHeader: {
  },
  performanceCardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
  },
  performanceSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    paddingBottom: 0,
    paddingTop: 0,
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
    width: '100%',
  },
  performanceSummaryCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  performanceSummaryCardLeftSection: {
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  performanceSummaryCardNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  performanceSummaryCardLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  performanceSummaryCardRightSection: {
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDotActive: {
    backgroundColor: '#000000',
  },
  paginationDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
}); 