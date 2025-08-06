import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { LineChart } from 'react-native-chart-kit';
import { hapticFeedback } from '../../utils/haptic';

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }>;
}

interface CardData {
  title: string;
  subtitle: string;
  chartData: ChartData;
}

interface SwipeableLineGraphCardProps {
  cardData: CardData[];
  onTriggerAddOptions?: () => void;
  hasNoLifts?: boolean;
}

export function SwipeableLineGraphCard({ cardData, onTriggerAddOptions, hasNoLifts = false }: SwipeableLineGraphCardProps) {
  const { width } = Dimensions.get('window');
  
  // Current card index state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const translateX = useSharedValue(0);

  // Reset shared values when component mounts or data changes
  useEffect(() => {
    translateX.value = 0;
  }, [cardData]);

  // Ensure cards are properly positioned on component mount
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      translateX.value = withSpring(0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Reset current card index when card data changes
  useEffect(() => {
    if (currentCardIndex >= cardData.length) {
      setCurrentCardIndex(0);
    }
    // Reset shared value when card index changes
    translateX.value = withSpring(0);
  }, [cardData.length, currentCardIndex]);

  const handleCardSwipe = (direction: 'left' | 'right') => {
    hapticFeedback.selection();
    const newIndex = direction === 'left' 
      ? currentCardIndex + 1  // Next card
      : currentCardIndex - 1; // Previous card
    
    // Prevent swiping beyond bounds
    if (newIndex < 0 || newIndex >= cardData.length) {
      hapticFeedback.error();
      return;
    }
    
    setCurrentCardIndex(newIndex);
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
                No Lifts Yet
              </Text>
              <Text style={styles.performanceCardSubtitle}>
                Start recording your workouts to see your performance metrics
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
              <View style={styles.performanceCard}>
                <View style={styles.performanceCardContent}>
                  <View style={styles.performanceCardHeader}>
                    <Text style={styles.performanceCardLabel}>
                      {cardData[currentCardIndex].title}
                    </Text>
                    <Text style={styles.performanceCardSubtitle}>
                      {cardData[currentCardIndex].subtitle}
                    </Text>
                  </View>
                  
                  {/* Chart */}
                  {cardData[currentCardIndex].chartData && cardData[currentCardIndex].chartData.datasets[0].data.length > 0 && (
                    <View style={styles.chartContainer}>
                      <LineChart
                        data={cardData[currentCardIndex].chartData}
                        width={width - 80}
                        height={180}
                        chartConfig={{
                          backgroundColor: '#FFFFFF',
                          backgroundGradientFrom: '#FFFFFF',
                          backgroundGradientTo: '#FFFFFF',
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: '2',
                            strokeWidth: '2',
                            stroke: '#000000',
                            fill: '#000000',
                          },
                          formatXLabel: (value) => value,
                          formatYLabel: (value) => `${value}%`,
                        }}
                        bezier
                        style={styles.chart}
                        withDots={true}
                        withShadow={true}
                        withInnerLines={true}
                        withOuterLines={false}
                        withVerticalLines={false}
                        withHorizontalLines={true}
                        yAxisSuffix="%"
                      />
                    </View>
                  )}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
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
  performanceCardContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  performanceCardHeader: {
    alignItems: 'flex-start',
    paddingLeft: 8,
    width: '100%',
    marginBottom: 16,
  },
  performanceCardLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 8,
  },
  performanceCardSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
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
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 10,
    overflow: 'visible',
  },
  chart: {
    borderRadius: 16,
  },
}); 