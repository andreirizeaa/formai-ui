import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ActionSheetIOS, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';

interface VideoPlayerComponentProps {
  videoUri: string;
}

function VideoPlayerComponent({ videoUri }: VideoPlayerComponentProps) {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
    player.showNowPlayingNotification = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.video}
    />
  );
}

export interface ILiftData {
  id: string;
  isFavourite: boolean;
  liftType: string;
  liftDate: string;
  weightValue: number;
  weightUnit: string;
  reps: number;
  videoURL: any;
  thumbnailURL?: any;
  analysis: {
    accuracy: number;
    lineGraphValues: number[];
    feedback: Array<{
      imageURL: any;
      flaws: string;
      improvement: string;
    }>;
  };
}

interface LiftDetailsProps {
  onClose: () => void;
  onShowFeedbackSlideshow: () => void;
  liftData: ILiftData;
}

export function LiftDetails({ onClose, onShowFeedbackSlideshow, liftData }: LiftDetailsProps) {
  const { removeCompletedLift } = useLoadingLifts();
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteConfirm = () => {
    hapticFeedback.success();
    
    // Remove the lift from completed lifts
    removeCompletedLift(liftData.id);
    setShowDeleteModal(false);
    onClose(); // Close the lift details screen after deletion
  };

  const handleDeleteCancel = () => {
    hapticFeedback.selection();
    setShowDeleteModal(false);
  };

  const handleStarPress = () => {
    hapticFeedback.selection();
    const newFavouriteState = !isStarSelected;
    setIsStarSelected(newFavouriteState);
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

  // Form score data using liftData
  const formScoreData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
    datasets: [
      {
        data: liftData.analysis.lineGraphValues,
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
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
                stroke="#000000"
                strokeWidth={2}
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.title}>Lift Details</Text>
          <TouchableOpacity 
            style={styles.ellipsisButton} 
            onPress={handleActionSheet}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                stroke="#000000"
                strokeWidth={1.5}
              />
            </Svg>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {/* Video Player */}
          <View style={styles.videoContainer}>
            <VideoPlayerComponent videoUri={require('../../../videos/video.mp4')} />
          </View>

          {/* Pills Row */}
          <View style={styles.pillsRow}>
            <View style={styles.leftPills}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{liftData.liftType || 'Bench Press'}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{liftData.liftDate || '4 Sep, 2025'}</Text>
              </View>
            </View>
            <View style={styles.orangePill}>
              <Text style={styles.pillText}>{liftData.analysis.accuracy || 91}%</Text>
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
                {liftData.weightValue || '--'} {liftData.weightUnit || ''}
              </Text>
            </View>
            
            {/* Sets/Reps Card */}
            <View style={styles.halfCard}>
              <Text style={styles.halfCardTitle}>Reps</Text>
              <Text style={styles.halfCardValue}>
                {liftData.reps || '--'}
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
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  stroke={isStarSelected ? "#000000" : "#000000"}
                  fill={isStarSelected ? "#000000" : "none"}
                  strokeWidth={1.5}
                />
              </Svg>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownOptionTextDestructive}>Delete Lift</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  stroke="#FF3B30"
                  strokeWidth={1.5}
                />
              </Svg>
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
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                  stroke="#000000"
                  strokeWidth={2}
                />
              </Svg>
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