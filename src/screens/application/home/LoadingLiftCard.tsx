import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import CircularProgress from 'react-native-circular-progress-indicator';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';

interface LoadingLiftCardProps {
  lift: {
    id: string;
    thumbnailUri: string;
    movementType: string;
    weightValue: number;
    weightUnit: 'kg' | 'lbs';
    reps: number;
    dateToday: string;
    progress: number;
    isComplete: boolean;
  };
}

export function LoadingLiftCard({ lift }: LoadingLiftCardProps) {
  const pulseAnim = useSharedValue(0);
  const line1Anim = useSharedValue(0);
  const line2Anim = useSharedValue(0);
  const line3Anim = useSharedValue(0);

  useEffect(() => {
    // Start pulse animation
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );

    // Stagger the line animations
    line1Anim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );

    line2Anim.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 400 }),
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1,
      true
    );

    line3Anim.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedLine1Style = useAnimatedStyle(() => ({
    opacity: interpolate(line1Anim.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(line1Anim.value, [0, 1], [0.95, 1.05]) }],
  }));

  const animatedLine2Style = useAnimatedStyle(() => ({
    opacity: interpolate(line2Anim.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(line2Anim.value, [0, 1], [0.95, 1.05]) }],
  }));

  const animatedLine3Style = useAnimatedStyle(() => ({
    opacity: interpolate(line3Anim.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(line3Anim.value, [0, 1], [0.95, 1.05]) }],
  }));

  return (
    <View style={styles.liftCard}>
      <View style={styles.liftCardContent}>
        {/* Video Thumbnail - Left 25% */}
        <View style={styles.videoThumbnailContainer}>
          <Image
            source={{ uri: lift.thumbnailUri }}
            style={styles.videoThumbnail}
            resizeMode="cover"
            onError={() => {
              // Handle image loading error silently
              console.warn('Failed to load thumbnail:', lift.thumbnailUri);
            }}
          />
          <BlurView intensity={30} style={styles.blurOverlay}>
            <View style={styles.progressContainer}>
              <CircularProgress
                value={lift.progress}
                radius={32}
                duration={2500}
                progressValueColor={'#000000'}
                activeStrokeColor={'#000000'}
                inActiveStrokeColor={'#E5E5EA'}
                activeStrokeWidth={6}
                inActiveStrokeWidth={6}
                showProgressValue={false}
              />
            </View>
          </BlurView>
        </View>
        
        {/* Content - Right 75% */}
        <View style={styles.liftContent}>
          <View style={styles.liftDetails}>
            <Text style={styles.analyzingText}>Analyzing form...</Text>
            <View style={styles.placeholderLines}>
              <Animated.View style={[styles.placeholderLine, styles.placeholderLine1, animatedLine1Style]} />
              <Animated.View style={[styles.placeholderLine, styles.placeholderLine2, animatedLine2Style]} />
              <Animated.View style={[styles.placeholderLine, styles.placeholderLine3, animatedLine3Style]} />
            </View>
            <Text style={styles.notificationText}>We'll notify you when done!</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowRadius: 8,
    elevation: 3,
  },
  liftCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -20, // Extend beyond card padding
  },
  videoThumbnailContainer: {
    height: 120,
    width: Dimensions.get('window').width * 0.25, // 25% of screen width
    overflow: 'hidden',
    borderTopLeftRadius: 18, // Only left side border radius
    borderBottomLeftRadius: 18, // Only left side border radius
    marginVertical: -20, // Extend beyond card padding
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  liftContent: {
    flex: 1,
    paddingLeft: 16, // Add padding to separate from video
    paddingRight: 16, // Add padding to prevent text from touching right edge
    justifyContent: 'center', // Center the content vertically
  },
  liftDetails: {
    flex: 1,
    justifyContent: 'center', // Center the content vertically
  },
  analyzingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  placeholderLines: {
    marginBottom: 8,
  },
  placeholderLine: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 4,
  },
  placeholderLine1: {
    width: '80%',
  },
  placeholderLine2: {
    width: '60%',
  },
  placeholderLine3: {
    width: '40%',
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 