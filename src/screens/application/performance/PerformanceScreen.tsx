import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS 
} from 'react-native-reanimated';
import { LineChart } from 'react-native-chart-kit';
import { hapticFeedback } from '../../../utils/haptic';
import { useLiftData } from '../../../context/LiftDataContext';

interface PerformanceScreenProps {
  onTriggerAddOptions?: () => void;
}

export function PerformanceScreen({ onTriggerAddOptions }: PerformanceScreenProps) {
  const { liftData } = useLiftData();
  const { width } = Dimensions.get('window');
  
  // Current card index state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentAccuracyOverTimeIndex, setCurrentAccuracyOverTimeIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateXAccuracyOverTime = useSharedValue(0);

  // Reset shared values when component mounts or data changes
  React.useEffect(() => {
    translateX.value = 0;
    translateXAccuracyOverTime.value = 0;
  }, [liftData]);

  // Ensure cards are properly positioned on component mount
  React.useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      translateX.value = withSpring(0);
      translateXAccuracyOverTime.value = withSpring(0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Generate card data based on all lift types that have data
  const cardData = useMemo(() => {
    // Get all unique lift types that have data
    const uniqueLiftTypes = [...new Set(liftData.map(lift => lift.liftType))];

    // Generate card data for each lift type
    return uniqueLiftTypes.map((liftType) => {
      // Get all lifts of this type
      const liftsOfType = liftData.filter(lift => lift.liftType === liftType);
      
      // Sort by weight (lowest to highest)
      const sortedLifts = liftsOfType.sort((a, b) => a.weightValue - b.weightValue);
      
      // Create chart data
      const chartData = {
        labels: sortedLifts.length > 6 
          ? sortedLifts.map((lift, index) => {
              if (index === 0 || index === sortedLifts.length - 1) {
                return `${lift.weightValue}kg`;
              }
              return '';
            })
          : sortedLifts.map(lift => `${lift.weightValue}kg`),
        datasets: [
          {
            data: sortedLifts.map(lift => lift.analysis.accuracy),
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      return {
        title: 'Accuracy per weight',
        subtitle: liftType,
        chartData
      };
    });
  }, [liftData]);

  // Generate accuracy over time card data
  const accuracyOverTimeData = useMemo(() => {
    // Get all unique lift types that have data
    const uniqueLiftTypes = [...new Set(liftData.map(lift => lift.liftType))];

    // Generate card data for each lift type
    return uniqueLiftTypes.map((liftType) => {
      // Get all lifts of this type
      const liftsOfType = liftData.filter(lift => lift.liftType === liftType);
      
      // Group lifts by date and average accuracy for each date
      const liftsByDate = liftsOfType.reduce((acc, lift) => {
        const date = lift.liftDate;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(lift);
        return acc;
      }, {} as Record<string, typeof liftsOfType>);

      // Calculate average accuracy for each date and sort by date
      const averagedLifts = Object.entries(liftsByDate)
        .map(([date, lifts]) => ({
          date,
          averageAccuracy: lifts.reduce((sum, lift) => sum + lift.analysis.accuracy, 0) / lifts.length
        }))
        .sort((a, b) => {
          // Parse DD-MM-YYYY format correctly
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
          };
          return parseDate(a.date).getTime() - parseDate(b.date).getTime();
        });
      
      // Format date for display
      const formatDate = (dateString: string) => {
        // Parse DD-MM-YYYY format correctly
        const [day, month, year] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        return date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      };
      
      // Create chart data
      const chartData = {
        labels: averagedLifts.map((lift, index) => {
          if (index === 0 || index === averagedLifts.length - 1) {
            return formatDate(lift.date);
          }
          return '';
        }),
        datasets: [
          {
            data: averagedLifts.map(lift => lift.averageAccuracy),
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      return {
        title: 'Accuracy over time',
        subtitle: liftType,
        chartData
      };
    });
  }, [liftData]);

  // Check if there are no lifts
  const hasNoLifts = cardData.length === 0;

  // Reset current card index when card data changes
  React.useEffect(() => {
    if (currentCardIndex >= cardData.length) {
      setCurrentCardIndex(0);
    }
    // Reset shared value when card index changes
    translateX.value = withSpring(0);
  }, [cardData.length, currentCardIndex]);

  // Reset current accuracy over time card index when data changes
  React.useEffect(() => {
    if (currentAccuracyOverTimeIndex >= accuracyOverTimeData.length) {
      setCurrentAccuracyOverTimeIndex(0);
    }
    // Reset shared value when card index changes
    translateXAccuracyOverTime.value = withSpring(0);
  }, [accuracyOverTimeData.length, currentAccuracyOverTimeIndex]);

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

  const handleAccuracyOverTimeCardSwipe = (direction: 'left' | 'right') => {
    hapticFeedback.selection();
    const newIndex = direction === 'left' 
      ? currentAccuracyOverTimeIndex + 1  // Next card
      : currentAccuracyOverTimeIndex - 1; // Previous card
    
    // Prevent swiping beyond bounds
    if (newIndex < 0 || newIndex >= accuracyOverTimeData.length) {
      hapticFeedback.error();
      return;
    }
    
    setCurrentAccuracyOverTimeIndex(newIndex);
  };

  const handleAccuracyOverTimePaginationDotPress = (index: number) => {
    hapticFeedback.selection();
    setCurrentAccuracyOverTimeIndex(index);
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

  const accuracyOverTimeCardGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateXAccuracyOverTime.value;
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
      
      translateXAccuracyOverTime.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = 50;
      if (event.translationX > threshold) {
        // Swipe right (positive translation) = go to previous card
        runOnJS(handleAccuracyOverTimeCardSwipe)('right');
      } else if (event.translationX < -threshold) {
        // Swipe left (negative translation) = go to next card
        runOnJS(handleAccuracyOverTimeCardSwipe)('left');
      }
      translateXAccuracyOverTime.value = withSpring(0);
    },
  });

  const accuracyOverTimeCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateXAccuracyOverTime.value }],
    };
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Performance</Text>
        
        {/* Performance Cards */}
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

        {/* Accuracy Over Time Cards */}
        <View style={styles.cardsContainer}>
          {hasNoLifts ? (
            // No additional card when no lifts
            null
          ) : (
            // Swipeable accuracy over time cards when there are lifts
            <>
              <PanGestureHandler 
                onGestureEvent={accuracyOverTimeCardGestureHandler}
                shouldCancelWhenOutside={true}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-5, 5]}
              >
                <Animated.View style={accuracyOverTimeCardAnimatedStyle}>
                  <View style={styles.performanceCard}>
                    <View style={styles.performanceCardContent}>
                      <View style={styles.performanceCardHeader}>
                        <Text style={styles.performanceCardLabel}>
                          {accuracyOverTimeData[currentAccuracyOverTimeIndex].title}
                        </Text>
                        <Text style={styles.performanceCardSubtitle}>
                          {accuracyOverTimeData[currentAccuracyOverTimeIndex].subtitle}
                        </Text>
                      </View>
                      
                      {/* Chart */}
                      {accuracyOverTimeData[currentAccuracyOverTimeIndex].chartData && accuracyOverTimeData[currentAccuracyOverTimeIndex].chartData.datasets[0].data.length > 0 && (
                        <View style={styles.chartContainer}>
                          <LineChart
                            data={accuracyOverTimeData[currentAccuracyOverTimeIndex].chartData}
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
                {accuracyOverTimeData.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentAccuracyOverTimeIndex ? styles.paginationDotActive : styles.paginationDotInactive
                    ]}
                    onPress={() => handleAccuracyOverTimePaginationDotPress(index)}
                    activeOpacity={0.7}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 24,
  },
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