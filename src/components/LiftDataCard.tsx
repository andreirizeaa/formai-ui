import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { ILiftData, useLiftData } from '../context/LiftDataContext';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
  Easing
} from 'react-native-reanimated';
import i18n from '../utils/i18n';
import { hapticFeedback } from '../utils/haptic';
import { deleteLift as deleteLiftApi } from '../services/liftService';
import { useTutorialTarget } from '../context/TutorialContext';
import { Trash2 } from 'lucide-react-native';

interface LiftDataCardProps {
  lift: ILiftData;
  onPress?: (lift: ILiftData) => void;
  onDelete?: (liftId: string) => void;
  style?: any;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function LiftDataCard({ lift, onPress, onDelete, style, scrollViewRef }: LiftDataCardProps) {
  // Pager translate between 0 (page 1) and -pageWidth (page 2)
  const translateX = useSharedValue(0);
  const pageWidth = useSharedValue(0);
  const loadingProgress = useSharedValue(0);
  const autoResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const { removeLift } = useLiftData();
  
  // Tutorial target for the first lift card
  const { ref: firstLiftCardRef } = useTutorialTarget('home_first_lift_card');

  // Circle sizing to guarantee perfect overlap between base ring and progress ring
  const CIRCLE_SIZE = 44;
  const STROKE = 3;
  const circleBaseStyle = { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, borderWidth: STROKE } as const;
  const progressBaseStyle = { position: 'absolute' as const, top: -STROKE, left: -STROKE, right: -STROKE, bottom: -STROKE, borderRadius: CIRCLE_SIZE / 2 + STROKE, borderWidth: STROKE };

  function handlePress() {
    onPress?.(lift);
  }

  function handleDelete() {
    const liftId = lift.id;
    hapticFeedback.success();
    // Optimistically remove from context
    removeLift(liftId);
    // Fire-and-forget API call
    deleteLiftApi(liftId).catch(() => {});
  }

  function startAutoReset() {
    if (autoResetTimeoutRef.current) clearTimeout(autoResetTimeoutRef.current);
    if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current);
    setRemainingSeconds(2);
    loadingProgress.value = withTiming(100, { duration: 2000, easing: Easing.linear });
    autoResetTimeoutRef.current = setTimeout(() => {
      resetCard();
    }, 2000);
    countdownTimeoutRef.current = setTimeout(() => {
      setRemainingSeconds(1);
    }, 1000);
  }

  function resetCard() {
    hapticFeedback.error();
    translateX.value = withTiming(0, { duration: 0 });
    loadingProgress.value = withTiming(0, { duration: 0 });
    if (autoResetTimeoutRef.current) {
      clearTimeout(autoResetTimeoutRef.current);
      autoResetTimeoutRef.current = null;
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    setRemainingSeconds(null);
  }

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context: any) => {
      const horizontalThreshold = 10;
      const verticalThreshold = 20;
      if (Math.abs(event.translationY) > Math.abs(event.translationX) + verticalThreshold) return;
      if (Math.abs(event.translationX) < horizontalThreshold) return;

      const minX = -pageWidth.value;
      const maxX = 0;
      const next = context.startX + event.translationX;
      translateX.value = Math.max(minX, Math.min(maxX, next));
    },
    onEnd: (event) => {
      const threshold = 50;
      const goLeft = event.translationX < -threshold;
      const goRight = event.translationX > threshold;
      if (goLeft) {
        translateX.value = withSpring(-pageWidth.value);
        runOnJS(hapticFeedback.selection)();
        runOnJS(startAutoReset)();
      } else if (goRight) {
        translateX.value = withSpring(0);
        runOnJS(hapticFeedback.selection)();
      } else {
        // snap to nearest page
        const mid = -pageWidth.value / 2;
        const goDelete = translateX.value < mid;
        translateX.value = withSpring(goDelete ? -pageWidth.value : 0);
        if (goDelete) {
          runOnJS(hapticFeedback.selection)();
          runOnJS(startAutoReset)();
        } else {
          runOnJS(hapticFeedback.selection)();
        }
      }
    },
  });

  useEffect(() => {
    return () => {
      if (autoResetTimeoutRef.current) clearTimeout(autoResetTimeoutRef.current);
      if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current);
    };
  }, []);

  const pagerStyle = useAnimatedStyle(() => ({
    width: pageWidth.value * 2,
    transform: [{ translateX: translateX.value }],
  }));

  const loadingProgressStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(loadingProgress.value / 100) * 360}deg` }],
  }));

  return (
    <View style={[styles.cardWrapper, style]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && w !== pageWidth.value) {
          pageWidth.value = w;
        }
      }}
    >
      <View style={styles.clipper}>
        <PanGestureHandler 
          onGestureEvent={gestureHandler}
          shouldCancelWhenOutside={true}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-5, 5]}
        >
          <Animated.View style={[styles.pager, pagerStyle]}>
            {/* Page 1: Lift Data */}
            <View style={[styles.page, styles.pageLift, { width: '50%' }]} ref={firstLiftCardRef}> 
              <TouchableOpacity 
                onPress={handlePress}
                activeOpacity={0.7}
                style={styles.liftCardContent}
                disabled={!onPress}
              >
                {/* Video Thumbnail - Left 25% */}
                <View style={styles.videoThumbnailContainer}>
                  {(() => {
                    // Handle both local assets (from require) and remote URLs
                    if (lift.thumbnailURL) {
                      if (typeof lift.thumbnailURL === 'number') {
                        // Local asset from require() - use directly
                        return (
                          <Image
                            source={lift.thumbnailURL}
                            style={styles.videoThumbnail}
                            resizeMode="cover"
                          />
                        );
                      } else if (typeof lift.thumbnailURL === 'string' && lift.thumbnailURL.startsWith('http')) {
                        // Remote URL - use as URI
                        return (
                          <Image
                            source={{ uri: lift.thumbnailURL }}
                            style={styles.videoThumbnail}
                            resizeMode="cover"
                            onError={() => {
                              console.warn('Failed to load thumbnail:', lift.thumbnailURL);
                            }}
                          />
                        );
                      }
                    }
                    
                    // Fallback to placeholder
                    return (
                      <Image
                        source={require('../../assets/placeholder-thumbnail.png')}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                      />
                    );
                  })()}
                </View>
                
                {/* Content - Right 75% */}
                <View style={styles.liftContent}>
                  <View style={styles.liftHeader}>
                    <Text style={styles.liftName} numberOfLines={1} ellipsizeMode="tail">
                      {lift.liftType}
                    </Text>
                    <Text style={styles.liftDate}>{lift.liftDate}</Text>
                  </View>
                  <View style={styles.liftAccuracyContainer}>
                    <Text style={styles.accuracyLabel}>{i18n.t('liftCard.accuracy')}</Text>
                    <View style={styles.accuracyPill}>
                      <Text style={styles.accuracyValue}>{lift.analysis.accuracy}%</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Page 2: Delete */}
            <View style={[styles.page, styles.pageDelete, { width: '50%' }]}> 
              <View style={styles.deleteCardContent}>
                <TouchableOpacity 
                  onPress={handleDelete}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Delete lift"
                >
                  <View style={[styles.loadingCircle, circleBaseStyle]}>
                    {/* Animated ring (below icon so icon appears on top) */}
                    <Animated.View style={[styles.loadingProgress, progressBaseStyle, loadingProgressStyle]} />
                    {/* Centered Trash2 icon inside the circle */}
                    <Trash2 size={20} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.loadingText}>{(remainingSeconds ?? 2)}s</Text>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 0,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  clipper: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  pager: {
    flexDirection: 'row',
  },
  page: {
    height: 120,
    justifyContent: 'center',
  },
  pageLift: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  pageDelete: {
    backgroundColor: '#fb2c36',
    alignItems: 'center',
  },
  liftCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -20,
  },
  videoThumbnailContainer: {
    height: 120,
    width: width * 0.25,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    marginVertical: -20,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liftContent: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
  },
  liftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flex: 1,
    marginRight: 8,
  },
  liftDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flexShrink: 0,
  },
  liftAccuracyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  accuracyPill: {
    backgroundColor: '#000',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  loadingCircle: {
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingProgress: {
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  loadingText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 6,
  },
}); 