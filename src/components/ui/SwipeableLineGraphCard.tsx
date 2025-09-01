import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { LineChart } from 'react-native-chart-kit';
import { hapticFeedback } from '../../utils/haptic';
import { formatWeightForDisplay } from '../../utils/unitConversions';
import { CircleQuestionMark } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 320; // Increased to accommodate shadow and padding

type Lift = {
  liftType: string;
  weightValue: number;
  liftDate: string; // "DD-MM-YYYY"
  analysis: { accuracy: number };
};

type TimeRange = '90d' | '6m' | '1y' | 'all';

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color: (opacity?: number) => string;
    strokeWidth: number;
  }>;
}

interface ProcessedCardData {
  title: string;
  subtitle: string;
  chartData: ChartData;
}

interface SwipeableLineGraphCardProps {
  ref?: React.RefObject<any>;
  cardData: Lift[];
  onTriggerAddOptions?: () => void;
  hasNoLifts?: boolean;
  chartType?: 'accuracyPerWeight' | 'accuracyOverTime';
  unitPreference?: 'metric' | 'imperial';
  onInfoPress?: () => void;
  externalScrollGestureRef?: React.RefObject<any>;
}

const parseLiftDate = (dateStr: string) => {
  const [d, m, y] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Calculate linear regression for line of best fit
const calculateLinearRegression = (dataPoints: number[]) => {
  const n = dataPoints.length;
  if (n < 2) return dataPoints;
  
  // Calculate x values (indices) and y values (data points)
  const xValues = Array.from({ length: n }, (_, i) => i);
  const yValues = dataPoints;
  
  // Calculate means
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
  
  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }
  
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  // Generate line of best fit points
  return xValues.map(x => slope * x + intercept);
};

const getThresholdForRange = (range: TimeRange) => {
  const now = new Date();
  if (range === '90d') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
  if (range === '6m') return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  if (range === '1y') return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return null; // all
};

export function SwipeableLineGraphCard({
  ref,
  cardData,
  onTriggerAddOptions,
  hasNoLifts = false,
  chartType = 'accuracyPerWeight',
  unitPreference = 'metric',
  onInfoPress,
  externalScrollGestureRef,
}: SwipeableLineGraphCardProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');

  // Filter cardData by selected time range
  const rangedCardData = useMemo(() => {
    const threshold = getThresholdForRange(timeRange);
    if (!threshold) return cardData;
    return cardData.filter((lift) => parseLiftDate(lift.liftDate) >= threshold);
  }, [cardData, timeRange]);

  // Build processed cards from filtered data
  const processedCardData: ProcessedCardData[] = useMemo(() => {
    if (!rangedCardData || rangedCardData.length === 0) {
      // Return a placeholder card when there's no data
      return [{
        title: chartType === 'accuracyPerWeight' ? 'Accuracy per weight' : 'Accuracy over time',
        subtitle: 'No data available',
        chartData: {
          labels: [''],
          datasets: [{
            data: [0],
            color: () => '#000000',
            strokeWidth: 1.5,
          }],
        },
      }];
    }

    const uniqueLiftTypes = [...new Set(rangedCardData.map((lift) => lift.liftType))];

    if (chartType === 'accuracyPerWeight') {
      return uniqueLiftTypes.map((liftType) => {
        const liftsOfType = rangedCardData.filter((lift) => lift.liftType === liftType);
        
        // Group lifts by weight and calculate average accuracy for each weight
        const weightGroups = liftsOfType.reduce((acc: Record<number, { totalAccuracy: number; count: number }>, lift) => {
          const weight = lift.weightValue;
          if (!acc[weight]) {
            acc[weight] = { totalAccuracy: 0, count: 0 };
          }
          acc[weight].totalAccuracy += lift.analysis.accuracy;
          acc[weight].count += 1;
          return acc;
        }, {});

        // Convert to array of { weight, averageAccuracy } and sort by weight
        const weightAccuracyData = Object.entries(weightGroups)
          .map(([weight, data]) => ({
            weight: parseFloat(weight),
            averageAccuracy: data.totalAccuracy / data.count
          }))
          .sort((a, b) => a.weight - b.weight);

        let chartLabels: string[];
        let chartDataPoints: number[];

        if (weightAccuracyData.length <= 25) {
          // If 25 or fewer unique weights, use all of them
          chartLabels = weightAccuracyData.map((data, idx) => {
            const position = idx + 1; // Convert to 1-based indexing
            if (position === 1 || position === 9 || position === 16 || position === 22) {
              if (position === 22 && idx !== weightAccuracyData.length - 1) {
                // Position 22 should show the last data point's weight if it's not already the last
                return formatWeightForDisplay(weightAccuracyData[weightAccuracyData.length - 1].weight, unitPreference);
              }
              return formatWeightForDisplay(data.weight, unitPreference);
            }
            return '';
          });
          chartDataPoints = weightAccuracyData.map((data) => data.averageAccuracy);
        } else {
          // If more than 25 unique weights, select 25 strategic points
          const selectedIndices = new Set<number>();
          
          // Always include the first (lowest weight) and last (highest weight)
          selectedIndices.add(0);
          selectedIndices.add(weightAccuracyData.length - 1);
          
          // Add evenly distributed points in between
          const remainingSlots = 23; // 25 total - 2 (first and last)
          const step = (weightAccuracyData.length - 2) / (remainingSlots - 1);
          
          for (let i = 1; i < remainingSlots; i++) {
            const index = Math.round(step * i);
            if (index > 0 && index < weightAccuracyData.length - 1) {
              selectedIndices.add(index);
            }
          }
          
          // Convert to sorted array and get the data
          const selectedIndicesArray = Array.from(selectedIndices).sort((a, b) => a - b);
          chartDataPoints = selectedIndicesArray.map((index) => 
            weightAccuracyData[index].averageAccuracy
          );
          
          // For labels, only show positions 1, 9, 16, 22 (1-based indexing), empty strings elsewhere
          chartLabels = selectedIndicesArray.map((index, labelIndex) => {
            const position = labelIndex + 1; // Convert to 1-based indexing
            if (position === 1 || position === 9 || position === 16 || position === 22) {
              if (position === 22) {
                // Position 22 should show the last data point's weight
                return formatWeightForDisplay(weightAccuracyData[weightAccuracyData.length - 1].weight, unitPreference);
              }
              return formatWeightForDisplay(weightAccuracyData[index].weight, unitPreference);
            }
            return '';
          });
        }

        // Calculate line of best fit
        const lineOfBestFit = calculateLinearRegression(chartDataPoints);

        const chartData: ChartData = {
          labels: chartLabels,
          datasets: [
            {
              data: chartDataPoints,
              color: () => '#000000',
              strokeWidth: 1.5,
            },
            {
              data: lineOfBestFit,
              color: () => '#ffb86a',
              strokeWidth: 2,
            },
          ],
        };

        return {
          title: 'Accuracy per weight',
          subtitle: liftType,
          chartData,
        };
      });
    } else {
      return uniqueLiftTypes.map((liftType) => {
        const liftsOfType = rangedCardData.filter((lift) => lift.liftType === liftType);

        const liftsByDate = liftsOfType.reduce((acc: Record<string, Lift[]>, lift: Lift) => {
          const date = lift.liftDate;
          if (!acc[date]) acc[date] = [];
          acc[date].push(lift);
          return acc;
        }, {});

        const averagedLifts = Object.entries(liftsByDate)
          .map(([date, lifts]) => {
            const avg =
              lifts.reduce(
                (sum, l) => sum + (typeof l.analysis?.accuracy === 'number' ? l.analysis.accuracy : 0),
                0,
              ) / lifts.length;
            return { date, averageAccuracy: avg };
          })
          .sort((a, b) => parseLiftDate(a.date).getTime() - parseLiftDate(b.date).getTime());

        const formatDate = (dateString: string) => {
          const d = parseLiftDate(dateString);
          return d.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        };

        let chartLabels: string[];
        let chartDataPoints: number[];

        if (averagedLifts.length <= 25) {
          // If 25 or fewer data points, use all of them but only show first and last labels
          chartLabels = averagedLifts.map((lift, idx) => {
            if (idx === 0 || idx === averagedLifts.length - 1) {
              return formatDate(lift.date);
            }
            return '';
          });
          chartDataPoints = averagedLifts.map((lift) => lift.averageAccuracy);
        } else {
          // If more than 25 data points, select strategic points
          const selectedIndices = new Set<number>();
          
          // Always include the first and last
          selectedIndices.add(0);
          selectedIndices.add(averagedLifts.length - 1);
          
          // Add evenly distributed points in between
          const remainingSlots = 23; // 25 total - 2 (first and last)
          const step = (averagedLifts.length - 2) / (remainingSlots - 1);
          
          for (let i = 1; i < remainingSlots; i++) {
            const index = Math.round(step * i);
            if (index > 0 && index < averagedLifts.length - 1) {
              selectedIndices.add(index);
            }
          }
          
          // Convert to sorted array and get the data
          const selectedIndicesArray = Array.from(selectedIndices).sort((a, b) => a - b);
          chartDataPoints = selectedIndicesArray.map((index) => 
            averagedLifts[index].averageAccuracy
          );
          
          // For labels, only show positions 1, 11, 21 (1-based indexing), empty strings elsewhere
          // Note: position 21 should show the value for the last data point (position 25)
          chartLabels = selectedIndicesArray.map((index, labelIndex) => {
            const position = labelIndex + 1; // Convert to 1-based indexing
            if (position === 1 || position === 11 || position === 21) {
              if (position === 21) {
                // Position 21 should show the last data point's date
                return formatDate(averagedLifts[averagedLifts.length - 1].date);
              }
              return formatDate(averagedLifts[index].date);
            }
            return '';
          });
        }

        // Calculate line of best fit
        const lineOfBestFit = calculateLinearRegression(chartDataPoints);

        const chartData: ChartData = {
          labels: chartLabels,
          datasets: [
            {
              data: chartDataPoints,
              color: () => '#000000',
              strokeWidth: 1.5,
            },
            {
              data: lineOfBestFit,
              color: () => '#ffb86a',
              strokeWidth: 2,
            },
          ],
        };

        return {
          title: 'Accuracy over time',
          subtitle: liftType,
          chartData,
        };
      });
    }
  }, [rangedCardData, chartType, unitPreference]);

  const Segments = [
    { label: '90 Days', value: '90d' as TimeRange },
    { label: '6 Months', value: '6m' as TimeRange },
    { label: '1 Year', value: '1y' as TimeRange },
    { label: 'All time', value: 'all' as TimeRange },
  ];

  return (
    <View style={styles.cardsContainer}>
      {/* Segmented control ABOVE the carousel and card */}
      <View style={styles.segmentedWrapper}>
        <View style={styles.segmented}>
          {Segments.map((seg, i) => {
            const active = timeRange === seg.value;
            return (
              <React.Fragment key={seg.value}>
                <TouchableOpacity
                  style={[styles.segment, active ? styles.segmentActive : styles.segmentInactive]}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (!active) {
                      hapticFeedback.selection();
                      setTimeRange(seg.value);
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <View style={styles.carouselContainer}>
        <Carousel
          loop={false}
          width={SCREEN_WIDTH}
          height={CARD_HEIGHT}
          data={processedCardData}
          onConfigurePanGesture={(g) => {
            'worklet';
            // Require horizontal intent (> ~12px) before activating
            g.activeOffsetX([-12, 12]);
            // If the user moves vertically by ~8px, fail this pan so the parent ScrollView takes over
            g.failOffsetY([-8, 8]);
            // Allow both to recognize if needed (RNGH ScrollView ref)
            if (externalScrollGestureRef) {
              // works with RNGH 2.x "Gesture" API under the hood
              g.simultaneousWithExternalGesture(externalScrollGestureRef);
            }
          }}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <View style={[styles.performanceCard, { width: CARD_WIDTH }]}>
                <View style={styles.performanceCardContent}>
                  <View style={styles.performanceCardHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.titleRow}>
                        <Text style={styles.performanceCardLabel}>{item.title}</Text>
                        <TouchableOpacity
                          onPress={() => onInfoPress?.()}
                          activeOpacity={0.7}
                          style={styles.titleIcon}
                        >
                          <CircleQuestionMark width={20} height={20} color="#000" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.performanceCardSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.chartContainer} ref={ref}>
                    <LineChart
                      data={item.chartData}
                      width={CARD_WIDTH - 20}
                      height={180}
                      chartConfig={{
                        fillShadowGradientFrom: '#000',
                        fillShadowGradientTo: '#ffffff',
                        backgroundColor: '#FFFFFF',
                        backgroundGradientFrom: '#FFFFFF',
                        backgroundGradientTo: '#FFFFFF',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                        propsForDots: {
                          r: '2',
                          strokeWidth: '2',
                          stroke: '#000',
                          fill: '#000',
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '2,2',
                        },
                        formatXLabel: (val) => val,
                        formatYLabel: (val) => `${val}%`,
                      }}
                      bezier
                      style={styles.chart}
                      withDots={false}
                      withShadow
                      withInnerLines
                      withOuterLines={false}
                      withVerticalLines={false}
                      withHorizontalLines
                      yAxisSuffix="%"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
          onSnapToItem={(index) => setCurrentCardIndex(index)}
          defaultIndex={0}
          pagingEnabled
          snapEnabled
          style={{ backgroundColor: 'transparent' }}
        />
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {processedCardData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentCardIndex ? styles.paginationDotActive : styles.paginationDotInactive,
              ]}
              activeOpacity={0.7}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },

  // --- Segmented control styles ---
  segmentedWrapper: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentInactive: {},
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  segmentTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  // --- Card / chart ---
  carouselContainer: {
    marginTop: -4,
  },
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceCardContent: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  performanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
    width: '100%',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginLeft: 4,
    marginBottom: 6,
  },
  performanceCardLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
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
    marginBottom: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -20,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#000',
  },
  paginationDotInactive: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#000',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 8,
    overflow: 'visible',
    marginLeft: -8,
  },
  chart: {
    borderRadius: 16,
  },
});
