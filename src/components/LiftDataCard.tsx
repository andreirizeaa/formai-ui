import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { ILiftData } from '../screens/application/feedback/liftDetails';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface LiftDataCardProps {
  lift: ILiftData;
  onPress?: (lift: ILiftData) => void;
  onDelete?: (liftId: string) => void;
  style?: any;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function LiftDataCard({ lift, onPress, onDelete, style, scrollViewRef }: LiftDataCardProps) {
  const translateX = useSharedValue(0);
  const deleteButtonOpacity = useSharedValue(0);

  const handlePress = () => {
    if (onPress) {
      onPress(lift);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(lift.id);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context: any) => {
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
      
      const newTranslateX = context.startX + event.translationX;
      translateX.value = Math.min(0, Math.max(-100, newTranslateX));
      
      // Show delete button when swiping left
      if (translateX.value < -20) {
        deleteButtonOpacity.value = withTiming(1, { duration: 200 });
      } else {
        deleteButtonOpacity.value = withTiming(0, { duration: 200 });
      }
    },
    onEnd: (event) => {
      // If swiped far enough, delete the item
      if (translateX.value < -80) {
        translateX.value = withTiming(-100, { duration: 200 });
        runOnJS(handleDelete)();
      } else {
        // Snap back to original position
        translateX.value = withSpring(0);
        deleteButtonOpacity.value = withTiming(0, { duration: 200 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: deleteButtonOpacity.value,
      transform: [{ translateX: translateX.value }],
    };
  });

  const cardStyle = [
    styles.liftCard,
    style,
  ];

  return (
    <View style={styles.container}>
      {/* Delete Button Background */}
      <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
        <TouchableOpacity 
          style={styles.deleteButtonContent}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          </Svg>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Card */}
      <PanGestureHandler 
        onGestureEvent={gestureHandler}
        shouldCancelWhenOutside={true}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <Animated.View style={[cardStyle, animatedStyle]}>
          <TouchableOpacity 
            onPress={handlePress}
            activeOpacity={0.7}
            style={styles.liftCardContent}
            disabled={!onPress}
          >
            {/* Video Thumbnail - Left 25% */}
            <View style={styles.videoThumbnailContainer}>
              {lift.thumbnailURL ? (
                <Image
                  source={{ uri: lift.thumbnailURL }}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                  onError={() => {
                    console.warn('Failed to load thumbnail:', lift.thumbnailURL);
                  }}
                />
              ) : (
                <Image
                  source={require('../../assets/placeholder-thumbnail.png')}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                />
              )}
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
                <Text style={styles.accuracyLabel}>Accuracy</Text>
                <View style={styles.accuracyPill}>
                  <Text style={styles.accuracyValue}>{lift.analysis.accuracy}%</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // Reduced height to be smaller than the card
    backgroundColor: '#000000', // Black background for delete button
    borderRadius: 18, // Match card border radius
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonContent: {
    padding: 10,
  },
  liftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  liftCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -20, // Extend beyond card padding
  },
  videoThumbnailContainer: {
    height: 120,
    width: width * 0.25, // 25% of screen width
    overflow: 'hidden',
    borderTopLeftRadius: 18, // Only left side border radius
    borderBottomLeftRadius: 18, // Only left side border radius
    marginVertical: -20, // Extend beyond card padding
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liftContent: {
    flex: 1,
    paddingLeft: 16, // Add padding to separate from video
    paddingRight: 16, // Add padding to prevent text from touching right edge
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
}); 