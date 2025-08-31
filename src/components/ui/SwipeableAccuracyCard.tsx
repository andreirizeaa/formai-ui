import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { hapticFeedback } from '../../utils/haptic';
import { CircularProgressChart } from '../icons/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Config
const CARD_HEIGHT = 140;
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
});
