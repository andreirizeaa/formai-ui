import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Alert, Image, TextInput, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { generateVideoThumbnail } from '../../../../utils/generateVideoThumbnail';
import { VideoPreviewScreen } from '../common/VideoPreviewScreen';
import { MovementSelectionScreen } from '../common/MovementSelectionScreen';
import { PracticesScreen } from '../common/PracticesScreen';
import { WeightRepsScreen } from '../common/WeightRepsScreen';
import { useLoadingLifts } from '../../../../context/LoadingLiftsContext';
import { gymMovements } from '../../../../constants/gymMovements';
import { CloseIcon } from '../../../../components/icons/icons';

interface UploadModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function UploadModal({ isVisible, onClose }: UploadModalProps) {
  const { addLoadingLift } = useLoadingLifts();
  const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showMovementSelection, setShowMovementSelection] = useState(false);
  const [showWeightReps, setShowWeightReps] = useState(false);

  // Movement selection state
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovements, setFilteredMovements] = useState([...gymMovements]);

  // Weight and reps state
  const [weightData, setWeightData] = useState<{ weight: number; unit: 'kg' | 'lbs'; reps: number } | null>(null);

  // Combined state object for logging
  const [uploadData, setUploadData] = useState<{
    videoLink: string;
    thumbnailUri: string;
    dateToday: string;
    movementType: string;
    weightValue: number;
    weightUnit: 'kg' | 'lbs';
    reps: number;
  } | null>(null);

  // Reset states when modal becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setSelectedVideo(null);
      setShowMovementSelection(false);
      setShowWeightReps(false);
      setSelectedMovement('');
      setSearchQuery('');
      setFilteredMovements([...gymMovements]);
      setWeightData(null);
    }
  }, [isVisible]);

  const handleUploadPress = async () => {
    // Selection haptic feedback
    hapticFeedback.selection();
    
    try {
      // Request permission first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(i18n.t('upload.permissionRequired'), i18n.t('upload.permissionMessage'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      
      if (asset) {
        // Check if video duration is available and under 1 minute
        let durationInSeconds = asset.duration;
        
        // Handle different duration formats
        if (typeof asset.duration === 'number') {
          // If duration is in milliseconds, convert to seconds
          if (asset.duration > 1000) {
            durationInSeconds = asset.duration / 1000;
          }
        }
        
        if (durationInSeconds !== undefined && durationInSeconds !== null && durationInSeconds > 60) {
          Alert.alert(
            i18n.t('upload.videoTooLong'),
            i18n.t('upload.videoTooLongMessage'),
            [
              { text: 'OK', onPress: () => {
                // Reopen the picker to let user select another video
                handleUploadPress();
              }},
            ]
          );
          return;
        }

        // Video is valid, set it as selected
        setSelectedVideo(asset);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert(i18n.t('upload.error'), i18n.t('upload.failedToSelectVideo'));
    }
  };

  const handleSelectNewVideo = () => {
    // Selection haptic feedback
    hapticFeedback.selection();
    
    setSelectedVideo(null);
    setShowMovementSelection(false);
    setSelectedMovement('');
    setSearchQuery('');
  };

  const handleBack = () => {
    // Selection haptic feedback
    hapticFeedback.selection();
    
    setShowMovementSelection(false);
  };

  const handleContinue = () => {
    // Selection haptic feedback
    hapticFeedback.selection();
    
    setShowMovementSelection(true);
  };

  const handleMovementSelect = (movement: string) => {
    hapticFeedback.selection();
    setSelectedMovement(movement);
    Keyboard.dismiss();
  };

  const handleContinueFromMovementSelection = () => {
    hapticFeedback.selection();
    setShowMovementSelection(false);
    setShowWeightReps(true);
  };

  const handleWeightRepsBack = () => {
    hapticFeedback.selection();
    setShowWeightReps(false);
    setShowMovementSelection(true);
  };

  const handleFinalCompleteClicked = async (data: { weight: number; unit: 'kg' | 'lbs'; reps: number }) => {
    setWeightData(data);
    try {
      // Generate thumbnail from the video URI
      const thumbnailUri = await generateVideoThumbnail(selectedVideo?.uri || '');

      // Create the upload data object with thumbnail
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const uploadDataObj = {
        videoLink: selectedVideo?.uri || '',
        thumbnailUri: thumbnailUri,
        dateToday: today,
        movementType: selectedMovement,
        weightValue: data.weight,
        weightUnit: data.unit,
        reps: data.reps,
      };
      setUploadData(uploadDataObj);
      
      // Add to loading lifts
      addLoadingLift({
        thumbnailUri: thumbnailUri,
        movementType: selectedMovement,
        weightValue: data.weight,
        weightUnit: data.unit,
        reps: data.reps,
        dateToday: today,
      });
      
      // Triple important haptic feedback for distinct feedback
      hapticFeedback.success();
      
      // Here you would typically upload the video to your server
      // For now, we'll just close the modal
      onClose();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      Alert.alert(i18n.t('upload.error'), i18n.t('upload.failedToGenerateThumbnail'));
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    const filtered = [...gymMovements].filter(movement =>
      movement.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMovements(filtered);
  };

  const resetModal = () => {
    setSelectedVideo(null);
    setShowMovementSelection(false);
    setShowWeightReps(false);
    setSelectedMovement('');
    setSearchQuery('');
    setFilteredMovements([...gymMovements]);
    setWeightData(null);
    setUploadData(null);
  };

  const handleClose = () => {
    hapticFeedback.selection();
    resetModal();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Close Button and Title */}
        <View style={styles.topControls}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Upload Video</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CloseIcon width={24} height={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!selectedVideo ? (
            // Tips Card - shown when no video is selected
            <PracticesScreen
              onUpload={handleUploadPress}
              buttonText={i18n.t('upload.uploadVideo')}
              tips={[
                i18n.t('upload.tips.goodLighting'),
                i18n.t('upload.tips.stableVideo'),
                i18n.t('upload.tips.sideView')
              ]}
            />
          ) : showMovementSelection ? (
            // Movement Selection - shown when video is selected and user clicked continue
            <MovementSelectionScreen
              searchQuery={searchQuery}
              filteredMovements={filteredMovements}
              selectedMovement={selectedMovement}
              onMovementSelect={handleMovementSelect}
              onSearchChange={handleSearchChange}
              onBack={handleBack}
              onUpload={handleContinueFromMovementSelection}
              onClose={handleClose}
            />
          ) : showWeightReps ? (
            // Weight and Reps - shown after movement selection
            <WeightRepsScreen
              onBack={handleWeightRepsBack}
              onUpload={handleFinalCompleteClicked}
            />
          ) : (
            // Video Preview - shown when video is selected but movement not yet selected
            <VideoPreviewScreen
              videoUri={selectedVideo?.uri || ''}
              onSelectNewVideo={handleSelectNewVideo}
              onContinue={handleContinue}
              onClose={handleClose}
              selectNewVideoText={i18n.t('upload.selectNewVideo')}
            />
          )}
        </View>

        {/* Bottom Buttons */}
        {selectedVideo && (
          <View style={styles.bottomControls}>
            <View style={styles.buttonStack}>
              {/* No button needed here since PracticesScreen handles the upload button */}
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  bottomControls: {
    justifyContent: 'flex-end',
    width: '100%',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  buttonStack: {
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  uploadButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.7,
  },
  uploadButtonTextDisabled: {
    color: '#C7C7CC',
  },
}); 