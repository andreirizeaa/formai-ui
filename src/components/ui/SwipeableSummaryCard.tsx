import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedGestureHandler, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptic';
import { CircularProgressChart } from '../icons/icons';

interface SwipeableSummaryCardProps {
  cardData: any[];
  onTriggerAddOptions?: () => void;
  hasNoLifts?: boolean;
}

interface SummaryCardData {
  title: string;
  value: number;
  color: string;
}

function parseDateDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function calculateAverageFormImprovement(lifts: Array<{ liftDate?: string; analysis?: { accuracy?: number } }>): number {
  if (!Array.isArray(lifts) || lifts.length < 2) return 0;

  const sorted = [...lifts]
    .map(l => ({
      date: parseDateDDMMYYYY((l as any).liftDate),
      accuracy: typeof (l as any)?.analysis?.accuracy === 'number' ? (l as any).analysis.accuracy : null,
    }))
    .filter(it => it.date && typeof it.accuracy === 'number')
    .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

  if (sorted.length < 2) return 0;

  // Compare early period vs recent period (first third vs last third)
  const segment = Math.max(1, Math.floor(sorted.length / 3));
  const early = sorted.slice(0, segment);
  const recent = sorted.slice(-segment);

  const avg = (arr: Array<{ accuracy: number | null }>) => {
    const vals = arr.map(x => x.accuracy as number).filter(v => typeof v === 'number');
    if (vals.length === 0) return 0;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  };

  const earlyAvg = avg(early);
  const recentAvg = avg(recent);
  return recentAvg - earlyAvg; // positive => improvement
}

export function SwipeableSummaryCard({ cardData, onTriggerAddOptions, hasNoLifts = false }: SwipeableSummaryCardProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const translateX = useSharedValue(0);

  const summaryCards: SummaryCardData[] = useMemo(() => {
    if (!Array.isArray(cardData) || cardData.length === 0) return [];

    const cards: SummaryCardData[] = [];

    // 1) Average Accuracy
    const validAccuracies = cardData
      .map(l => (typeof l?.analysis?.accuracy === 'number' ? l.analysis.accuracy : null))
      .filter((v): v is number => typeof v === 'number');
    const averageAccuracy = validAccuracies.length > 0
      ? Math.round(validAccuracies.reduce((s, v) => s + v, 0) / validAccuracies.length)
      : 0;
    const accuracyColor = averageAccuracy > 80 ? '#00a63e' : averageAccuracy < 50 ? '#fb2c36' : '#fe9a00';
    cards.push({ title: 'Average accuracy', value: averageAccuracy, color: accuracyColor });

    // 2) Average Form Improvement
    const improvementData = Math.round(calculateAverageFormImprovement(cardData));
    const improvementColor = improvementData > 10 ? '#00a63e' : improvementData < 0 ? '#fb2c36' : '#fe9a00';
    cards.push({ title: 'Average form improvement', value: improvementData, color: improvementColor });

    return cards;
  }, [cardData]);

  useEffect(() => {
    translateX.value = 0;
  }, [summaryCards]);

  useEffect(() => {
    const timer = setTimeout(() => {
      translateX.value = withSpring(0);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentCardIndex >= summaryCards.length) setCurrentCardIndex(0);
    translateX.value = withSpring(0);
  }, [summaryCards.length, currentCardIndex]);

  const handleCardSwipe = (direction: 'left' | 'right') => {
    hapticFeedback.selection();
    const newIndex = direction === 'left' ? currentCardIndex + 1 : currentCardIndex - 1;
    if (newIndex < 0 || newIndex >= summaryCards.length) {
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
      const horizontalThreshold = 10;
      const verticalThreshold = 20;
      if (Math.abs(event.translationY) > Math.abs(event.translationX) + verticalThreshold) return;
      if (Math.abs(event.translationX) < horizontalThreshold) return;
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = 50;
      if (event.translationX > threshold) runOnJS(handleCardSwipe)('right');
      else if (event.translationX < -threshold) runOnJS(handleCardSwipe)('left');
      translateX.value = withSpring(0);
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.cardsContainer}>
      {hasNoLifts ? (
        <TouchableOpacity
          style={styles.accuracyCard}
          onPress={() => {
            hapticFeedback.selection();
            onTriggerAddOptions?.();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.accuracyCardContent}>
            <View style={styles.accuracyCardLeftSection}>
              <Text style={styles.accuracyCardNumber}>--</Text>
              <Text style={styles.accuracyCardLabel}>No lifts found</Text>
            </View>
            <View style={styles.accuracyCardRightSection}>
              <CircularProgressChart
                width={120}
                height={120}
                percentage={0}
                progressColor="#000000"
                backgroundColor="#E5E5E5"
                strokeWidth={8}
                radius={48}
              />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <>
          <PanGestureHandler
            onGestureEvent={cardGestureHandler}
            shouldCancelWhenOutside={true}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-5, 5]}
          >
            <Animated.View style={cardAnimatedStyle}>
              <View style={styles.accuracyCard}>
                <View style={styles.accuracyCardContent}>
                  <View style={styles.accuracyCardLeftSection}>
                    <Text
                      style={styles.accuracyCardNumber}
                      accessibilityLabel={`${summaryCards[currentCardIndex]?.title} value`}
                    >
                      {typeof summaryCards[currentCardIndex]?.value === 'number'
                        ? `${summaryCards[currentCardIndex]?.value}%`
                        : '--'}
                    </Text>
                    <Text style={styles.accuracyCardLabel}>
                      {summaryCards[currentCardIndex]?.title || 'No data'}
                    </Text>
                  </View>
                  <View style={styles.accuracyCardRightSection}>
                    <CircularProgressChart
                      width={120}
                      height={120}
                      percentage={Math.max(0, Math.min(100, summaryCards[currentCardIndex]?.value ?? 0))}
                      progressColor={summaryCards[currentCardIndex]?.color || '#000000'}
                      backgroundColor="#E5E5E5"
                      strokeWidth={8}
                      radius={48}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>

          <View style={styles.paginationContainer}>
            {summaryCards.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentCardIndex ? styles.paginationDotActive : styles.paginationDotInactive,
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
  accuracyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  accuracyCardLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
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


