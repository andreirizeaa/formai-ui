import React, { useEffect, memo, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Platform, Pressable } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import i18n from '../../../utils/i18n';
import { CircleCheck, Trash2 } from 'lucide-react-native';

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
    pipelineStage?: 'upload_video' | 'upload_thumbnail' | 'analyze';
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
  const [showCheckingVideo, setShowCheckingVideo] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

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

  // Handle "Checking Video" timer for 2 seconds
  useEffect(() => {
    if (lift.status === 'processing' && lift.pipelineStage === 'analyze') {
      setShowCheckingVideo(true);
      const timer = setTimeout(() => {
        setShowCheckingVideo(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      setShowCheckingVideo(false);
    }
  }, [lift.status, lift.pipelineStage]);

  // Calculate and animate progress percentage
  useEffect(() => {
    if (lift.status === 'completed') {
      // When completed, show 100%
      setDisplayProgress(100);
      return;
    }

    if (lift.status === 'error') {
      // When error, keep current progress
      return;
    }

    // Calculate target progress based on status and pipeline stage
    let targetProgress = 0;
    let isSlowPhase = false;
    
    if (lift.status === 'uploading') {
      // Uploading phase: 0-33%
      targetProgress = Math.min(33, lift.progress * 33);
    } else if (lift.status === 'processing') {
      switch (lift.pipelineStage) {
        case 'upload_video':
        case 'upload_thumbnail':
          // Still uploading: 0-33%
          targetProgress = Math.min(33, lift.progress * 33);
          break;
        case 'analyze':
          // Analyzing phase: 33-90% - MUCH SLOWER
          targetProgress = 33 + Math.min(57, lift.progress * 57);
          isSlowPhase = true;
          break;
        default:
          // Default processing: 33-90% - MUCH SLOWER
          targetProgress = 33 + Math.min(57, lift.progress * 57);
          isSlowPhase = true;
      }
    }

    // Animate progress incrementally
    const incrementProgress = () => {
      setDisplayProgress(prev => {
        const diff = targetProgress - prev;
        if (diff <= 0) return prev;
        
        let increment, delay;
        
        if (isSlowPhase) {
          // Much slower for analyzing phases - smaller increments and longer delays
          increment = Math.min(Math.max(0.5, Math.floor(diff / 50)), 2); // 0.5-2% increments
          delay = 800 + Math.random() * 1200; // 800-2000ms delays
        } else {
          // Normal speed for uploading
          increment = Math.min(Math.max(1, Math.floor(diff / 10)), 5); // 1-5% increments
          delay = 200 + Math.random() * 300; // 200-500ms delays
        }
        
        const newProgress = Math.min(prev + increment, targetProgress);
        
        // If we haven't reached target, schedule next update
        if (newProgress < targetProgress) {
          setTimeout(incrementProgress, delay);
        }
        
        return newProgress;
      });
    };

    incrementProgress();
  }, [lift.status, lift.pipelineStage, lift.progress]);

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
    // If uploading, show "Uploading video..."
    if (lift.status === 'uploading') {
      return i18n.t('loadingLift.uploadingVideo');
    }
    
    // If processing, determine message based on pipeline stage
    if (lift.status === 'processing') {
      switch (lift.pipelineStage) {
        case 'upload_video':
        case 'upload_thumbnail':
          return i18n.t('loadingLift.uploadingVideo');
        case 'analyze':
          // Show "Checking video..." for first 2 seconds, then "Analyzing form..."
          return showCheckingVideo ? i18n.t('loadingLift.checkingVideo') : i18n.t('loadingLift.analyzingForm');
        default:
          return i18n.t('loadingLift.analyzingForm');
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
      <View style={styles.errorWrapper}>
        <View style={styles.errorCardShadow}>
          <View style={styles.errorCardInner}>
            <LinearGradient
              colors={['#e2e8f0', '#f5f3ff']}
              locations={[0, 0.3]}
              style={styles.errorCardGradient}
              start={{ x: 0.6, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.errorContentRow}>
                {/* Video Thumbnail - Left 30% */}
                <View style={styles.errorThumbContainer}>
                  <Image
                    source={{ uri: lift.thumbnailUri }}
                    style={styles.errorThumbnail}
                    resizeMode="cover"
                  />
                </View>
                
                {/* Content - Right 70% */}
                <View style={styles.errorLiftContent}>
                  <View style={styles.errorLiftDetails}>
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
            </LinearGradient>
          </View>
        </View>
        
        {/* Close button positioned absolutely */}
        <Pressable 
          style={({ pressed }) => [
            styles.closeButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={handleClose}
        >
          <View style={styles.closeButtonCircle}>
            <Trash2 size={20} color="#000" />
          </View>
        </Pressable>
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
              <CircleCheck size={32} color="#34C759" />
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
                value={displayProgress}
                radius={32}
                progressValueColor={'#000000'}
                activeStrokeColor={'#000000'}
                inActiveStrokeColor={'#E5E5EA'}
                activeStrokeWidth={6}
                inActiveStrokeWidth={6}
                showProgressValue={false}
              />
              <View style={styles.percentageOverlay}>
                <Text style={styles.percentageText}>
                  {Math.round(displayProgress)}%
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
        
        {/* Content - Right 75% */}
        <View style={styles.liftContent}>
          <View style={styles.liftDetails}>
            <Text style={styles.analyzingText}>{getStatusText()}</Text>
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
    position: 'relative',
  },
  percentageOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
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
    color: '#000',
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
  // Error card styles matching LiftDataCard
  errorWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  errorCardShadow: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 18,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  errorCardInner: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  errorCardGradient: {
    flex: 1,
    borderRadius: 18,
  },
  errorContentRow: {
    flexDirection: 'row',
    height: 130,
  },
  errorThumbContainer: {
    width: '30%',
    height: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  errorThumbnail: {
    width: '100%',
    height: '100%',
  },
  errorLiftContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  errorLiftDetails: {
    flex: 1,
    justifyContent: 'center',
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