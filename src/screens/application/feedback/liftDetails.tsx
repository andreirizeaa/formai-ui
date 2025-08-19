import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Alert, ActionSheetIOS, Modal, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, MoreHorizontalIcon, ShareIcon, StarIcon, HeartIcon, TrashIcon, CloseIcon, InfoIcon } from '../../../components/icons/icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LineChart } from 'react-native-chart-kit';
import { hapticFeedback } from '../../../utils/haptic';
import { useLiftData, ILiftData } from '../../../context/LiftDataContext';
import { deleteLift as deleteLiftApi, favouriteLift as favouriteLiftApi } from '../../../services/liftService';
import i18n from '../../../utils/i18n';

interface VideoPlayerComponentProps {
  videoUri: string;
  onReady: () => void;
}

function VideoPlayerComponent({ videoUri, onReady }: VideoPlayerComponentProps) {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.showNowPlayingNotification = false;
    player.play();
  });

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onReady();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [onReady]);

  return (
    <VideoView
      player={player}
      style={styles.video}
    />
  );
}

interface LiftDetailsProps {
  onClose: () => void;
  onShowFeedbackSlideshow: () => void;
  liftData: ILiftData;
}

export function LiftDetails({ onClose, onShowFeedbackSlideshow, liftData: initialLiftData }: LiftDetailsProps) {
  const { removeLift, updateLift, refreshLifts, liftData: contextLiftData, favouriteLiftAndRefresh } = useLiftData();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  
  // Simple boolean for favourite state - starts with the initial value
  const [isFavourite, setIsFavourite] = useState(initialLiftData.isFavourite);

  // Get the current lift data from context, falling back to the prop if not found
  const currentLiftData = contextLiftData.find(lift => lift.id === initialLiftData.id) || initialLiftData;

  // Update local state when context data changes
  useEffect(() => {
    const freshData = contextLiftData.find(lift => lift.id === initialLiftData.id);
    if (freshData) {
      setIsFavourite(freshData.isFavourite);
    }
  }, [contextLiftData, initialLiftData.id]);

  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleReviewFeedback = () => {
    hapticFeedback.selection();
    // Navigate to HowItWorks screen instead of directly to FeedbackSlideshow
    // The navigation will be handled by the parent component
    onShowFeedbackSlideshow();
  };

  const handleDeleteLift = () => {
    hapticFeedback.selection();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    hapticFeedback.success();
    const ok = await deleteLiftApi(currentLiftData.id);
    if (ok) {
      removeLift(currentLiftData.id);
      setShowDeleteModal(false);
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    hapticFeedback.selection();
    setShowDeleteModal(false);
  };

  const handleStarPress = async () => {
    hapticFeedback.selection();
    
    // Immediately toggle the favourite state
    setIsFavourite(prev => !prev);
    
    // Make API call in background - no need to wait for response
    favouriteLiftAndRefresh(currentLiftData.id);
  };

  const handleActionSheet = () => {
    hapticFeedback.selection();
    setShowDropdown(!showDropdown);
  };

  const handleFavourite = () => {
    hapticFeedback.success();
    handleStarPress();
    setShowDropdown(false);
  };

  const handleDelete = () => {
    hapticFeedback.selection();
    setShowDropdown(false);
    handleDeleteLift();
  };

  // Form score data using currentLiftData
  const repsCount = Math.max(1, Number(currentLiftData.reps || 0));
  const labels = Array.from({ length: repsCount }, (_, i) => String(i + 1));
  const dataArray = Array.isArray(currentLiftData.analysis.lineGraphValues)
    ? currentLiftData.analysis.lineGraphValues
    : [];
  const paddedData = dataArray.length >= repsCount
    ? dataArray.slice(0, repsCount)
    : [...dataArray, ...Array(repsCount - dataArray.length).fill(0)];

  const formScoreData = {
    labels,
    datasets: [
      {
        data: paddedData,
        color: (opacity = 1) => `#000000`,
        strokeWidth: 2,
      },
    ],
  };

  // Ensure we have valid data for the chart
  const chartData = {
    labels: formScoreData.labels,
    datasets: formScoreData.datasets.map(dataset => ({
      ...dataset,
      data: dataset.data || [0, 0, 0, 0, 0, 0, 0, 0], // Fallback to zeros if data is undefined
    })),
  };
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerCard}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <BackIcon width={20} height={20} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Lift Details</Text>
          <TouchableOpacity 
            style={styles.ellipsisButton} 
            onPress={handleActionSheet}
            activeOpacity={0.7}
          >
            <MoreHorizontalIcon width={20} height={20} color="#000000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {/* Video Player */}
          <View style={styles.videoContainer}>
            {currentLiftData.poseVideoURL ? (
              <>
                <VideoPlayerComponent 
                  videoUri={currentLiftData.poseVideoURL}
                  onReady={() => setIsVideoLoading(false)}
                />
                {isVideoLoading && (
                  <View style={styles.videoLoadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noVideoContainer}>
                <Text style={styles.noVideoText}>No video available</Text>
              </View>
            )}
          </View>

          {/* Pills Row */}
          <View style={styles.pillsRow}>
            <View style={styles.leftPills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{currentLiftData.liftType || 'Bench Press'}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{currentLiftData.liftDate || '4 Sep, 2025'}</Text>
              </View>
            </View>
            <View style={styles.orangePill}>
              <Text style={styles.pillText}>{currentLiftData.analysis.accuracy || 91}%</Text>
            </View>
          </View>

          {/* Form Score Chart Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Form accuracy across your reps</Text>
            <View style={styles.chartContainer}>
              {chartData && chartData.datasets && chartData.datasets[0] && chartData.datasets[0].data && (
                <LineChart
                  data={chartData}
                  width={width - 80} // Reduced width to make chart smaller
                  height={180} // Increased height to show x-axis labels
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '0',
                      strokeWidth: '0',
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withDots={false}
                  withShadow={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLines={false}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  xAxisLabel=""
                />
              )}
            </View>
          </View>

          {/* Weight and Sets/Reps Cards Row */}
          <View style={styles.cardsRow}>
            {/* Weight Card */}
            <View style={styles.halfCard}>
              <Text style={styles.halfCardTitle}>Weight</Text>
              <Text style={styles.halfCardValue}>
                {currentLiftData.weightValue || '--'}
              </Text>
            </View>
            
            {/* Sets/Reps Card */}
            <View style={styles.halfCard}>
              <Text style={styles.halfCardTitle}>Reps</Text>
              <Text style={styles.halfCardValue}>
                {currentLiftData.reps || '--'}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Review Feedback Button - Fixed to Bottom */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomBackground}>
          <TouchableOpacity 
            style={styles.reviewFeedbackButton}
            onPress={handleReviewFeedback}
            activeOpacity={0.7}
          >
            <Text style={styles.reviewFeedbackButtonText}>Review Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Dropdown Modal */}
      {showDropdown && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={handleFavourite}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownOptionText}>Favourite</Text>
              <HeartIcon width={20} height={20} color="#FF3B30" filled={isFavourite} />
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownOptionTextDestructive}>Delete Lift</Text>
              <TrashIcon width={20} height={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Delete Lift Modal */}
      {showDeleteModal && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleDeleteCancel}
        >
          <TouchableOpacity 
            style={styles.modalContainer} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={handleDeleteCancel}
            >
              <CloseIcon width={20} height={20} color="#000000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.modalTitle}>Delete Lift</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>Are you sure you want to delete this lift? This action cannot be undone.</Text>

            {/* Action buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleDeleteCancel}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDelete]} 
                onPress={handleDeleteConfirm}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextDelete]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
  videoContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'black',
    marginBottom: 16,
  },
  video: {
    width: '100%',
    height: 200,
  },
  videoLoadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  noVideoContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000'
  },
  noVideoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  reviewFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewFeedbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginLeft: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  leftPills: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'SF Pro Display',
  },
  orangePill: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  chart: {
    borderRadius: 16,
    marginLeft: -22,
  },
  ellipsisButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  dropdownOptionTextDestructive: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
    fontFamily: 'SF Pro Display',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 200,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'left',
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  modalButtonDelete: {
    backgroundColor: '#FF3B30',
  },
  modalButtonTextDelete: {
    color: '#FFFFFF',
  },
  reviewFeedbackButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 28,
    width: '90%',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  reviewFeedbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bottomBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  halfCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 4,
  },
  halfCardValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
}); 