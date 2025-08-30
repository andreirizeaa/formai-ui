import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { LineChart } from 'react-native-chart-kit';
import { hapticFeedback } from '../../utils/haptic';
import { formatWeightForDisplay } from '../../utils/unitConversions';
import { CircleQuestionMark } from 'lucide-react-native';
import { useTutorialTarget } from '../../context/TutorialContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = 310; // 🔑 taller by 10px

type Lift = {
  liftType: string;
  weightValue: number;
  liftDate: string; // "DD-MM-YYYY"
  analysis: { accuracy: number };
};

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
}

export function SwipeableLineGraphCard({ 
  ref,
  cardData, 
  onTriggerAddOptions, 
  hasNoLifts = false, 
  chartType = 'accuracyPerWeight',
  unitPreference = 'metric',
  onInfoPress
}: SwipeableLineGraphCardProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Build processed cards
  const processedCardData: ProcessedCardData[] = useMemo(() => {
    if (!cardData || cardData.length === 0) return [];

    const uniqueLiftTypes = [...new Set(cardData.map(lift => lift.liftType))];

    if (chartType === 'accuracyPerWeight') {
      return uniqueLiftTypes.map((liftType) => {
        const liftsOfType = cardData.filter(lift => lift.liftType === liftType);
        const sortedLifts = liftsOfType.sort((a, b) => a.weightValue - b.weightValue);

        const chartData: ChartData = {
          labels: sortedLifts.map(lift =>
            formatWeightForDisplay(lift.weightValue, unitPreference)
          ),
          datasets: [
            {
              data: sortedLifts.map(lift => lift.analysis.accuracy),
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
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
        const liftsOfType = cardData.filter(lift => lift.liftType === liftType);

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
                (sum, lift) =>
                  sum + (typeof lift.analysis?.accuracy === 'number'
                    ? lift.analysis.accuracy
                    : 0),
                0
              ) / lifts.length;
            return { date, averageAccuracy: avg };
          })
          .sort((a, b) => {
            const parseDate = (dateStr: string) => {
              const [day, month, year] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day);
            };
            return parseDate(a.date).getTime() - parseDate(b.date).getTime();
          });

        const formatDate = (dateString: string) => {
          const [day, month, year] = dateString.split('-').map(Number);
          const d = new Date(year, month - 1, day);
          return d.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        };

        const formattedLabels = averagedLifts.map((lift, idx) =>
          idx === 0 || idx === averagedLifts.length - 1 ? formatDate(lift.date) : ''
        );

        const chartData: ChartData = {
          labels: formattedLabels,
          datasets: [
            {
              data: averagedLifts.map(lift => lift.averageAccuracy),
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
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
  }, [cardData, chartType, unitPreference]);

  const getChartWidth = (dataPoints: number) => {
    const minWidth = CARD_WIDTH - 40;
    const pointSpacing = 80;
    return Math.max(minWidth, dataPoints * pointSpacing);
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, animated: true });
    }
  }, [currentCardIndex]);

  return (
    <View style={styles.cardsContainer}>
      {hasNoLifts ? (
        <TouchableOpacity
          style={[styles.performanceCard, { width: CARD_WIDTH }]}
          onPress={() => {
            hapticFeedback.selection();
            onTriggerAddOptions?.();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.performanceCardContent}>
            <View style={styles.performanceCardHeader}>
              <Text style={styles.performanceCardLabel}>No lifts found</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
          <View>
            <Carousel
              loop={false}
              width={SCREEN_WIDTH}
              height={CARD_HEIGHT} // 🔑 taller
              data={processedCardData}
              renderItem={({ item }) => (
                <View style={styles.page}>
                  <View style={[styles.performanceCard, { width: CARD_WIDTH }]}>
                    <View style={styles.performanceCardContent}>
                      <View style={styles.performanceCardHeader}>
                        <View style={styles.headerLeft}>
                          <View style={styles.titleRow}>
                            <Text style={styles.performanceCardLabel}>
                              {item.title}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                onInfoPress?.();
                              }}
                              activeOpacity={0.7}
                              style={styles.titleIcon}
                            >
                              <CircleQuestionMark width={20} height={20} color="#000" />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.performanceCardSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>

                      {item.chartData &&
                        item.chartData.datasets[0].data.length > 0 && (
                          <View style={styles.chartContainer} ref={ref}>
                            <ScrollView
                              ref={scrollViewRef}
                              horizontal
                              showsHorizontalScrollIndicator={false}
                            >
                              <LineChart
                                data={item.chartData}
                                width={getChartWidth(item.chartData.labels.length)}
                                height={180}
                                chartConfig={{
                                  fillShadowGradientFrom: '#4f39f6',
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
                                  formatXLabel: (val) => val,
                                  formatYLabel: (val) => `${val}%`,
                                }}
                                bezier
                                style={styles.chart}
                                withDots
                                withShadow
                                withInnerLines
                                withOuterLines={false}
                                withVerticalLines={false}
                                withHorizontalLines
                                yAxisSuffix="%"
                              />
                            </ScrollView>
                          </View>
                        )}
                    </View>
                  </View>
                </View>
              )}
              onSnapToItem={(index) => {
                if (index !== currentCardIndex) {
                  setCurrentCardIndex(index);
                }
              }}
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
                  index === currentCardIndex
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>
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
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
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
    marginTop: -10,
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
  },
  chart: {
    borderRadius: 16,
  },
});
