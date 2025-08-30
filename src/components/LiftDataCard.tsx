import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { ILiftData, useLiftData } from '../context/LiftDataContext';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { hapticFeedback } from '../utils/haptic';
import i18n from '../utils/i18n';
import { deleteLift as deleteLiftApi } from '../services/liftService';
import { useTutorialTarget } from '../context/TutorialContext';

interface LiftDataCardProps {
  lift: ILiftData;
  onPress?: (lift: ILiftData) => void;
  style?: any;
}

export function LiftDataCard({ lift, onPress, style }: LiftDataCardProps) {
  const translateX = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const loadingProgress = useSharedValue(0);
  const swipeWidth = useSharedValue(0);
  const { removeLift } = useLiftData();
  const { ref: firstLiftCardRef } = useTutorialTarget('home_first_lift_card');
  const [deleting, setDeleting] = useState(false);

  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    hapticFeedback.success();
    removeLift(lift.id);
    deleteLiftApi(lift.id).catch(() => {});
  }

  function startAutoReset() {
    if (autoResetTimeoutRef.current) clearTimeout(autoResetTimeoutRef.current);
    loadingProgress.value = withTiming(100, { duration: 2000, easing: Easing.linear });
    autoResetTimeoutRef.current = setTimeout(() => {
      translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
      loadingProgress.value = withTiming(0, { duration: 0 });
    }, 2000);
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onBegin(() => {
      panStartX.value = translateX.value;
    })
    .onUpdate((event) => {
      const maxSwipe = -swipeWidth.value;
      const next = panStartX.value + event.translationX;
      translateX.value = Math.max(maxSwipe, Math.min(0, next));
    })
    .onEnd(() => {
      const swipe = Math.abs(translateX.value);
      if (swipe > swipeWidth.value * 0.2) {
        translateX.value = withTiming(-swipeWidth.value * 0.3, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        });
        runOnJS(hapticFeedback.selection)();
        runOnJS(startAutoReset)();
      } else {
        translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
      }
    });

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const loadingProgressStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(loadingProgress.value / 100) * 360}deg` }],
  }));

  // Progress ring sizing
  const CIRCLE_SIZE = 44;
  const STROKE = 3;
  const circleBaseStyle = {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: STROKE,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  } as const;
  const progressBaseStyle = {
    position: 'absolute' as const,
    top: -STROKE,
    left: -STROKE,
    right: -STROKE,
    bottom: -STROKE,
    borderRadius: CIRCLE_SIZE / 2 + STROKE,
    borderWidth: STROKE,
    borderColor: '#FFF',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  };

  useEffect(() => {
    return () => {
      if (autoResetTimeoutRef.current) clearTimeout(autoResetTimeoutRef.current);
    };
  }, []);

  return (
    <View
      style={[styles.wrapper, style]}
      onLayout={(e) => {
        swipeWidth.value = e.nativeEvent.layout.width;
      }}
    >
      {/* Background: delete zone (2px inset) */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity onPress={handleDelete} activeOpacity={0.8}>
          <View style={circleBaseStyle}>
            <Animated.View style={[progressBaseStyle, loadingProgressStyle]} />
            <Trash2 size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Foreground: SHADOW wrapper (no overflow), holds the animated translate */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardShadow, shadowStyle]} ref={firstLiftCardRef}>
          {/* Inner card with overflow hidden to clip corners — shadow won’t be clipped */}
          <View style={styles.cardInner}>
            <TouchableOpacity
              onPress={() => onPress?.(lift)}
              activeOpacity={0.7}
              disabled={!onPress}
              style={styles.contentRow}
            >
              {/* Thumbnail */}
              <View style={styles.thumbContainer}>
                {lift.thumbnailURL ? (
                  typeof lift.thumbnailURL === 'string' ? (
                    <Image source={{ uri: lift.thumbnailURL }} style={styles.thumbnail} />
                  ) : (
                    <Image source={lift.thumbnailURL} style={styles.thumbnail} />
                  )
                ) : (
                  <Image
                    source={require('../../assets/placeholder-thumbnail.png')}
                    style={styles.thumbnail}
                  />
                )}
              </View>

              {/* Content */}
              <View style={styles.liftContent}>
                <View style={styles.liftHeader}>
                  <Text style={styles.liftName} numberOfLines={1}>
                    {lift.liftType}
                  </Text>
                  <Text style={styles.liftDate}>{lift.liftDate}</Text>
                </View>
                <View style={styles.liftAccuracyRow}>
                  <Text style={styles.accuracyLabel}>{i18n.t('liftCard.accuracy')}</Text>
                  <View style={styles.accuracyPill}>
                    <Text style={styles.accuracyValue}>{lift.analysis.accuracy}%</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  deleteBackground: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 2,
    right: 2,
    backgroundColor: '#fb2c36',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },

  // ⬇️ Shadow sits here (no overflow). This view moves with the gesture.
  cardShadow: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 18,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // ⬇️ Inner card actually draws the white background and clips children
  cardInner: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },

  contentRow: {
    flexDirection: 'row',
    height: 120,
  },
  thumbContainer: {
    width: '25%',
    height: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  liftContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  liftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flex: 1,
    marginRight: 8,
  },
  liftDate: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  liftAccuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  accuracyPill: {
    backgroundColor: '#000',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  accuracyValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
