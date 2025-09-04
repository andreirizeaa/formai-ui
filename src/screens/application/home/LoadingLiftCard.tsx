import React, { useEffect, memo, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, Pressable, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { Target, Weight, ChartNoAxesCombined } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  useDerivedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate
} from 'react-native-reanimated';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { LinearGradient } from 'expo-linear-gradient';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { deleteUserStorage } from '../../../services/liftService';
import i18n from '../../../utils/i18n';
import { Trash2 } from 'lucide-react-native';
import { LoadingLiftCardProps } from '../../../types/Lifts.d';

// Constants for progress circle
const R = 36;
const CIRC = 2 * Math.PI * R;

function LoadingLiftCardComponent({ lift }: LoadingLiftCardProps) {
  const { retryLift, removeLift, updateLiftProgress, isLiftAutoDeleted } = useLoadingLifts();
  const pulseAnim = useSharedValue(0);
  const line1Anim = useSharedValue(0);
  const line2Anim = useSharedValue(0);
  const line3Anim = useSharedValue(0);
  const fadeAnim = useSharedValue(1);
  
  // For new lifts, always start at 0.02 (2%), for resumed lifts use stored progress
  const initialProgress = (lift.uiProgress && lift.uiProgress > 0) ? lift.uiProgress : 0.02;
  const targetProgress = useSharedValue(initialProgress);
  const progressRender = useSharedValue(initialProgress);

  const [isDeleting, setIsDeleting] = useState(false);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef(initialProgress);

  // Helper function to ensure progress only moves forward
  const setMonotonicProgress = (p: number, animate = true) => {
    // Allow completion to hit 1.0, otherwise cap at 0.97 as you do
    const cap = p >= 1 ? 1 : 0.97;
    const next = Math.max(lastProgressRef.current, Math.min(cap, p));

    if (next !== lastProgressRef.current) {
      lastProgressRef.current = next;
      targetProgress.value = next;
      // Keep the label monotonic too - ensure it's specific to this lift
      const newPercentage = Math.round(next * 100);
      setProgressPercentage(prev => Math.max(prev, newPercentage));
      if (!animate) {
        // Immediate jump forward (never backwards) on UI value too
        progressRender.value = Math.max(progressRender.value, next);
      }
    }
  };

  // Derive the animated UI value (no JS retargeting jitter)
  const progressDerived = useDerivedValue(() => withTiming(targetProgress.value, { duration: 100 }));

  // Ensure UI-thread monotonic clamp
  useDerivedValue(() => {
    if (progressDerived.value > progressRender.value) {
      progressRender.value = progressDerived.value;
    }
  });

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

  }, [lift.status]);



  // Progress simulation hook
  useEffect(() => {
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    // Only start progress simulation for uploading or processing states
    if (lift.status === 'uploading' || lift.status === 'processing') {
      // Ensure we start with the correct initial progress for this specific lift
      const storedProgress = lift.uiProgress || 0;
      const initialProgress = storedProgress > 0 ? storedProgress : 0.02;
      
      // Reset progress tracking to ensure clean start
      lastProgressRef.current = initialProgress;
      targetProgress.value = initialProgress;
      progressRender.value = initialProgress;
      setProgressPercentage(Math.round(initialProgress * 100));
      
      console.log(`LoadingLiftCard ${lift.id}: Starting progress simulation with ${initialProgress} (${Math.round(initialProgress * 100)}%)`);
      const videoDuration = lift.videoDurationSec || 10; // Default to 10 seconds if not provided
      let targetDuration = ((videoDuration * 2 ) + 20 )* 1000; // Convert to milliseconds
      
      // Adjust target duration if this is a retry - reduce by the retry stage percentage
      if (lift.retryStage) {
        const retryStagePercentage = getRetryProgressForStage(lift.retryStage);
        targetDuration = targetDuration * (1 - retryStagePercentage);
      }
      
      const tickInterval = 50; // Update every 50ms for smoother animation
      
      // Determine starting progress based on retry stage or stored progress
      let currentProgress: number;
      if (lift.retryStage) {
        // If this is a retry, start from the appropriate stage percentage
        currentProgress = getRetryProgressForStage(lift.retryStage);
        // Update the progress tracking for retry
        lastProgressRef.current = currentProgress;
        targetProgress.value = currentProgress;
        progressRender.value = currentProgress;
        setProgressPercentage(Math.round(currentProgress * 100));
      } else {
        // Use the initial progress we already set above
        currentProgress = initialProgress;
      }
      
      // Calculate how much time has already passed based on current progress
      // If we're starting from 0, no time has passed. If we're at 50%, half the time has passed.
      const elapsedTime = currentProgress * targetDuration;
      
      let tickCount = 0;
      let lastStoredProgress = currentProgress;
      
      progressTimerRef.current = setInterval(() => {
        tickCount++;
        
        // Calculate progress based on elapsed time from the start of the simulation
        const totalElapsedTime = elapsedTime + (tickCount * tickInterval);
        const progressFromStart = Math.min(totalElapsedTime / targetDuration, 0.95);
        
        // Only positive noise so it never goes backwards
        const fluctuation = Math.random() * 0.003; // 0% to 0.3%
        const candidate = progressFromStart + fluctuation;
        
        // Use monotonic helper to ensure progress only moves forward
        setMonotonicProgress(candidate);
        currentProgress = lastProgressRef.current;
        
        // Only update storage and percentage display every 5 ticks (250ms) to avoid excessive updates
        if (tickCount % 5 === 0 && Math.abs(currentProgress - lastStoredProgress) > 0.02) {
          lastStoredProgress = currentProgress;
          // Update progress in context and AsyncStorage
          updateLiftProgress(lift.id, currentProgress);
        }
        
        // Stop if we've reached the cap and analysis hasn't returned
        if (currentProgress >= 0.93 && lift.status === 'processing' && lift.pipelineStage === 'analyze') {
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
        }
      }, tickInterval);
    }
    
    // Handle completion
    if (lift.status === 'completed') {
      setMonotonicProgress(1, true);
      updateLiftProgress(lift.id, 1);
    }
    
    // Handle error - freeze progress
    if (lift.status === 'error') {
      // Keep current progress, don't animate
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [lift.status, lift.pipelineStage, lift.videoDurationSec, lift.uiProgress, lift.id]);



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

  const animatedProgressProps = useAnimatedProps(() => {
    const progress = progressRender.value;
    return {
      strokeDashoffset: CIRC * (1 - progress),
    };
  });

  const [progressPercentage, setProgressPercentage] = useState(() => {
    // For new lifts (no stored progress), always start at 0
    // For resumed lifts, use the stored progress
    const initialProgress = lift.uiProgress || 0;
    return Math.round(initialProgress * 100);
  });


  // Sync progress state when lift.uiProgress changes (e.g., from AsyncStorage)
  useEffect(() => {
    const newProgress = lift.uiProgress || 0;
    const newPercentage = Math.round(newProgress * 100);
    setProgressPercentage(prev => Math.max(prev, newPercentage));
    setMonotonicProgress(newProgress, false); // Only apply if higher
  }, [lift.uiProgress, lift.id]);

  // Reset animated values when a new lift is added (lift.id changes)
  useEffect(() => {
    // Clear any existing timer for this lift
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    // For new lifts, always start at 0.02 (2%)
    // For resumed lifts, use stored progress
    const storedProgress = lift.uiProgress || 0;
    const initialProgress = storedProgress > 0 ? storedProgress : 0.02;
    const initialPercentage = Math.round(initialProgress * 100);
    
    // Reset all progress tracking for this specific lift
    lastProgressRef.current = initialProgress;
    targetProgress.value = initialProgress;
    progressRender.value = initialProgress;
    setProgressPercentage(initialPercentage);
    
    console.log(`LoadingLiftCard ${lift.id}: Reset progress to ${initialProgress} (${initialPercentage}%)`);
  }, [lift.id]); // Only run when lift.id changes (new lift added)

  const getRetryProgressForStage = (retryStage?: string): number => {
    switch (retryStage) {
      case 'VIDEO_VALIDATION':
        return 0.20; // 20%
      case 'POSE_ESTIMATION':
        return 0.35; // 35%
      case 'AI_ANALYSIS':
        return 0.55; // 55%
      default:
        return 0.02;
    }
  };

  const handleRetry = async () => {
    hapticFeedback.selection();
    try {
      // Get the appropriate progress percentage based on retry stage
      const retryProgress = getRetryProgressForStage(lift.retryStage);
      
      // Reset progress tracking for this specific lift
      lastProgressRef.current = retryProgress;
      targetProgress.value = retryProgress;
      progressRender.value = retryProgress;
      setProgressPercentage(Math.round(retryProgress * 100));
      
      // Also update the stored progress in AsyncStorage
      updateLiftProgress(lift.id, retryProgress);
      await retryLift(lift.id);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleClose = async () => {
    if (isDeleting) return; // Prevent multiple clicks during deletion
    
    hapticFeedback.selection();
    
    // If this is an error card, check if it was already auto-deleted
    if (lift.status === 'error') {
      setIsDeleting(true);
      try {
        // Check if this lift was already auto-deleted
        const isAutoDeleted = isLiftAutoDeleted(lift.id);
        
        if (isAutoDeleted) {
          // Lift was already deleted in the background, just remove from UI instantly
          hapticFeedback.success();
          removeLift(lift.id);
        } else {
          // Call the storage delete API for lifts that haven't been auto-deleted
          const success = await deleteUserStorage(lift.id);
          if (success) {
            hapticFeedback.success();
            removeLift(lift.id); // Only remove card if API succeeds
          } else {
            hapticFeedback.error();
          }
        }
      } catch (error) {
        console.error('Failed to delete user storage:', error);
        hapticFeedback.error();
      } finally {
        setIsDeleting(false);
      }
    } else {
      // For non-error cards, just remove them directly
      removeLift(lift.id);
    }
  };

  const getStatusText = () => {
    // If uploading, show "Uploading video..."
    if (lift.status === 'uploading') {
      return i18n.t('loadingLift.uploadingVideo');
    }
    
    // If processing, determine message based on progress percentage
    if (lift.status === 'processing') {
      const currentProgress = progressPercentage;
      
      if (currentProgress < 20) {
        return i18n.t('loadingLift.uploadingVideo');
      } else if (currentProgress < 40) {
        return i18n.t('loadingLift.estimatingPose');
      } else {
        return i18n.t('loadingLift.analyzingVideo');
      }
    }
    
    // If completed, show analyzing form
    if (lift.status === 'completed') {
      return i18n.t('loadingLift.analyzingForm');
    }
    
    // If error, show error message
    if (lift.status === 'error') {
      return i18n.t('loadingLift.analysisFailed');
    }
    
    return i18n.t('loadingLift.processing');
  };

  if (lift.status === 'error') {
    return (
      <View style={styles.liftCard}>
        <LinearGradient
          colors={['#e2e8f0', '#f5f3ff']}
          locations={[0, 0.3]}
          style={styles.cardGradient}
          start={{ x: 0.6, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.liftCardContent}>
            {/* Video Thumbnail - Left 30% */}
            <View style={styles.videoThumbnailContainer}>
              <Image
                source={{ uri: lift.thumbnailUri }}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />
            </View>
            
            {/* Content - Right 70% */}
            <View style={styles.liftContent}>
              {/* Top row: Error message */}
              <View style={styles.topRow}>
                <View style={styles.errorMessageContainer}>
                  <Text style={styles.errorTitle} numberOfLines={1}>
                    {lift.errorMessage === 'No lift found' 
                      ? i18n.t('loadingLift.noLiftFound.title')
                      : lift.errorMessage === 'Lift mismatch'
                      ? i18n.t('loadingLift.liftMismatch.title')
                      : i18n.t('loadingLift.errorOccurred')
                    }
                  </Text>
                  {lift.errorMessage === 'No lift found' && (
                    <Text style={styles.errorSubtitle} numberOfLines={2}>
                      {i18n.t('loadingLift.noLiftFound.subtitle')}
                    </Text>
                  )}
                  {lift.errorMessage === 'Lift mismatch' && lift.movementType && (
                    <Text style={styles.errorSubtitle} numberOfLines={2}>
                      {i18n.t('loadingLift.liftMismatch.detectedMovement', { movement: lift.movementType })}
                    </Text>
                  )}
                </View>
                {lift.errorMessage !== 'No lift found' && lift.errorMessage !== 'Lift mismatch' && (
                  <Pressable 
                    style={({ pressed }) => [
                      styles.deleteButton,
                      { opacity: (pressed || isDeleting) ? 0.7 : 1 }
                    ]}
                    onPress={handleClose}
                    disabled={isDeleting}
                  >
                    <View style={styles.deleteButtonCircle}>
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#D70015" />
                      ) : (
                        <Trash2 size={16} color="#D70015" />
                      )}
                    </View>
                  </Pressable>
                )}
              </View>

              {/* Middle row: Action button */}
              <View style={styles.middleRow}>
                {lift.errorMessage === 'No lift found' || lift.errorMessage === 'Lift mismatch' ? (
                  <Pressable 
                    style={({ pressed }) => [
                      styles.deleteErrorButton,
                      { opacity: (pressed || isDeleting) ? 0.7 : 1 }
                    ]}
                    onPress={handleClose}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#D70015" />
                    ) : (
                      <Text style={styles.deleteErrorButtonText}>Delete</Text>
                    )}
                  </Pressable>
                ) : (
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

              {/* Bottom row: Empty */}
              <View style={styles.bottomRow}>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }


  return (
    <View style={styles.liftCard}>
      <LinearGradient
        colors={['#e2e8f0', '#f5f3ff']}
        locations={[0, 0.3]}
        style={styles.cardGradient}
        start={{ x: 0.6, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.liftCardContent}>
          {/* Video Thumbnail - Left 30% */}
          <View style={styles.videoThumbnailContainer}>
            <Image
              source={{ uri: lift.thumbnailUri }}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
            <BlurView intensity={30} style={styles.blurOverlay}>
              <View style={styles.progressContainer}>
                <Svg width={80} height={80} style={styles.progressSvg}>
                  {/* Background circle */}
                  <Circle
                    cx={40}
                    cy={40}
                    r={R}
                    stroke="#E5E5EA"
                    strokeWidth={7}
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <AnimatedCircle
                    cx={40}
                    cy={40}
                    r={R}
                    stroke="#000000"
                    strokeWidth={7}
                    fill="transparent"
                    strokeLinecap="butt"
                    strokeDasharray={[CIRC]}
                    animatedProps={animatedProgressProps}
                    transform="rotate(-90 40 40)"
                  />
                </Svg>
                {/* Percentage text overlay */}
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressText}>{progressPercentage}%</Text>
                </View>
              </View>
            </BlurView>
          </View>
          
          {/* Content - Right 70% */}
          <View style={styles.liftContent}>
            {/* Top row: Title */}
            <View style={styles.topRow}>
              <Text style={styles.liftName} numberOfLines={1}>
                {getStatusText()}
              </Text>
            </View>

            {/* Middle row: Animated lines */}
            <View style={styles.placeholderLines}>
              <Animated.View style={[styles.placeholderLine, styles.placeholderLine1, animatedLine1Style]} />
              <Animated.View style={[styles.placeholderLine, styles.placeholderLine2, animatedLine2Style]} />
              <Animated.View style={[styles.placeholderLine, styles.placeholderLine3, animatedLine3Style]} />
            </View>

            {/* Bottom row: Notification message */}
            <View style={styles.bottomRow}>
              <Text style={styles.notificationText}>{i18n.t('loadingLift.notifyWhenDone')}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  liftCard: {
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 18,
  },
  liftCardContent: {
    flexDirection: 'row',
    height: 130,
  },
  videoThumbnailContainer: {
    width: '30%',
    height: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
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
    position: 'relative',
  },
  progressSvg: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  progressTextContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
  },
  baseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 8,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
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
    padding: 16,
    justifyContent: 'space-between',
  },
  liftDetails: {
    flex: 1,
    justifyContent: 'flex-start', // Keep content at the top
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  liftName: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flex: 1,
    marginRight: 8,
  },
  middleRow: {
    marginTop: -4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
  },

  placeholderLines: {
    marginBottom: 8,
    marginTop: 8,
    width: '100%',
  },
  placeholderLine: {
    height: 6,
    backgroundColor: '#71717b',
    borderRadius: 3,
    marginBottom: 6,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  errorMessageContainer: {
    flex: 1,
    marginRight: 8,
    flexShrink: 1,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#D70015',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 0,
    marginBottom: 0,
  },
  errorSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 2,
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D70015',
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
  deleteErrorButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D70015',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteErrorButtonText: {
    color: '#D70015',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  timePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  bottomRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomRowText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },

});

// Memoized component for performance
export const LoadingLiftCard = memo(LoadingLiftCardComponent, (prevProps, nextProps) => {
  // Return true if props are the same (no re-render needed)
  // Return false if props are different (re-render needed)
  return (
    prevProps.lift.id === nextProps.lift.id &&
    prevProps.lift.status === nextProps.lift.status &&
    prevProps.lift.uiProgress === nextProps.lift.uiProgress &&
    prevProps.lift.errorMessage === nextProps.lift.errorMessage
  );
}); 