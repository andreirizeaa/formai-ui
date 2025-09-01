import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat,
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import i18n from '../../../utils/i18n';

interface LoadingLiftCardProps {
  lift: {
    id: string;
    thumbnailUri: string;
    movementType: string;
    weightValue: number;
    weightUnit?: 'kg' | 'lbs';
    reps: number;
    dateToday: string;
    progress: number;
    isComplete: boolean;
    status: 'uploading' | 'processing' | 'completed' | 'error';
    errorMessage?: string;
    finalData?: {
      id: string;
      isFavourite: boolean;
      liftType: string;
      liftDate: string;
      weightValue: number;
      reps: number;
      thumbnailURL?: string;
      analysis: { accuracy: number };
    };
  };
}

function LoadingLiftCardComponent({ lift }: LoadingLiftCardProps) {
  const { retryLift, removeLift } = useLoadingLifts();
  const pulseAnim = useSharedValue(0);
  const line1Anim = useSharedValue(0);
  const line2Anim = useSharedValue(0);
  const line3Anim = useSharedValue(0);
  const fadeAnim = useSharedValue(1);

  useEffect(() => {
    // Only animate if not in error state
    if (lift.status !== 'error') {
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
    }

    // Add fade transition when status changes to completed
    if (lift.status === 'completed') {
      fadeAnim.value = withTiming(0.8, { duration: 300 });
    }
  }, [lift.status]);

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

  const handleRetry = async () => {
    hapticFeedback.selection();
    try {
      await retryLift(lift.id);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleClose = () => {
    hapticFeedback.selection();
    removeLift(lift.id);
  };

  const getStatusText = () => {
    switch (lift.status) {
      case 'uploading':
        return i18n.t('loadingLift.uploadingVideo');
      case 'processing':
        return i18n.t('loadingLift.analyzingForm');
      case 'completed':
        return i18n.t('loadingLift.analyzingForm');
      case 'error':
        return i18n.t('loadingLift.analysisFailed');
      default:
        return i18n.t('loadingLift.processing');
    }
  };

  if (lift.status === 'error') {
    return (
      <View style={styles.liftCard}>
        <Pressable 
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={handleClose}
        >
          <View style={styles.closeButtonCircle}>
            <Ionicons name="trash-outline" size={20} color="#8E8E93" />
          </View>
        </Pressable>
        <View style={styles.liftCardContent}>
          {/* Video Thumbnail - Left 25% */}
          <View style={styles.videoThumbnailContainer}>
            <Image
              source={{ uri: lift.thumbnailUri }}
              style={styles.videoThumbnail}
              resizeMode="cover"
              onError={() => {
                console.warn('Failed to load thumbnail:', lift.thumbnailUri);
              }}
            />
          </View>
          
          {/* Content - Right 75% */}
          <View style={styles.liftContent}>
            <View style={styles.liftDetails}>
              <Text style={styles.errorTitle}>
                {lift.errorMessage === 'No lift found' 
                  ? i18n.t('loadingLift.noLiftFound.title')
                  : i18n.t('loadingLift.errorOccurred')
                }
              </Text>
              <Text style={styles.errorSubtitle}>
                {lift.errorMessage === 'No lift found'
                  ? i18n.t('loadingLift.noLiftFound.subtitle')
                  : i18n.t('loadingLift.pleaseTryAgain')
                }
              </Text>
              {lift.errorMessage !== 'No lift found' && (
                <Pressable 
                  style={({ pressed }) => [
                    styles.retryButton,
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>{i18n.t('loadingLift.tapToRetry')}</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Show completed state with final data if available
  if (lift.status === 'completed' && lift.finalData && lift.finalData.id) {
    const finalData = lift.finalData;
    const fadeStyle = useAnimatedStyle(() => ({
      opacity: fadeAnim.value,
    }));
    
    return (
      <Animated.View style={[styles.liftCard, fadeStyle]}>
        <View style={styles.liftCardContent}>
          {/* Video Thumbnail - Left 25% */}
          <View style={styles.videoThumbnailContainer}>
            <Image
              source={{ uri: finalData.thumbnailURL || lift.thumbnailUri }}
              style={styles.videoThumbnail}
              resizeMode="cover"
              onError={() => {
                console.warn('Failed to load thumbnail:', finalData.thumbnailURL || lift.thumbnailUri);
              }}
            />
            {/* Success overlay */}
            <View style={styles.successOverlay}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
            </View>
          </View>
          
          {/* Content - Right 75% */}
          <View style={styles.liftContent}>
            <View style={styles.liftDetails}>
              <Text style={styles.completedTitle}>
                {finalData.liftType}
              </Text>
              <Text style={styles.completedSubtitle}>
                {finalData.weightValue} {lift.weightUnit || 'kg'} × {finalData.reps} reps
              </Text>
              <Text style={styles.accuracyText}>
                Accuracy: {finalData.analysis.accuracy}%
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

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
              console.warn('Failed to load thumbnail:', lift.thumbnailUri);
            }}
          />
          <BlurView intensity={30} style={styles.blurOverlay}>
            <View style={styles.progressContainer}>
              <CircularProgress
                value={lift.progress}
                radius={32}
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
            <Text style={styles.analyzingText}>{i18n.t('loadingLift.analyzingForm')}</Text>
              <View style={styles.placeholderLines}>
                <Animated.View style={[styles.placeholderLine, styles.placeholderLine1, animatedLine1Style]} />
                <Animated.View style={[styles.placeholderLine, styles.placeholderLine2, animatedLine2Style]} />
                <Animated.View style={[styles.placeholderLine, styles.placeholderLine3, animatedLine3Style]} />
              </View>
            <Text style={styles.notificationText}>{i18n.t('loadingLift.notifyWhenDone')}</Text>
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
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
  },
  liftContent: {
    flex: 1,
    paddingLeft: 16, // Add padding to separate from video
    paddingRight: 16, // Add padding to prevent text from touching right edge
    justifyContent: 'center', // Center the content vertically
  },
  liftDetails: {
    flex: 1,
    justifyContent: 'flex-start', // Keep content at the top
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
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FF3B30',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 28,
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D70015',
    marginTop: -8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  errorSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 8,
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  completedSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});

// Memoized component for performance
export const LoadingLiftCard = memo(LoadingLiftCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.lift.id === nextProps.lift.id &&
    prevProps.lift.status === nextProps.lift.status &&
    prevProps.lift.progress === nextProps.lift.progress &&
    prevProps.lift.thumbnailUri === nextProps.lift.thumbnailUri &&
    prevProps.lift.movementType === nextProps.lift.movementType &&
    prevProps.lift.weightValue === nextProps.lift.weightValue &&
    prevProps.lift.errorMessage === nextProps.lift.errorMessage
  );
}); 