import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image, TextInput, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { generateVideoThumbnail } from '../../../../utils/generateVideoThumbnail';
import { VideoPreviewScreen } from '../common/VideoPreviewScreen';
import { MovementSelectionScreen } from '../common/MovementSelectionScreen';
import { PracticesScreen } from '../common/PracticesScreen';
import { WeightRepsScreen } from '../common/WeightRepsScreen';
import { useLoadingLifts } from '../../../../context/LoadingLiftsContext';
import { useSelectedDate } from '../../../../context/SelectedDateContext';
import { gymMovements, BodyPart } from '../../../../constants/gymMovements';
import { X } from 'lucide-react-native';
import { listUserVideoPaths } from '../../../../services/VideoUploadService';
import { getUserId } from '../../../../services/storageService';

interface UploadModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function UploadModal({ isVisible, onClose }: UploadModalProps) {
  const { addLoadingLift } = useLoadingLifts();
  const { selectedDate } = useSelectedDate();
  const [selectedVideo, setSelectedVideo] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [showMovementSelection, setShowMovementSelection] = useState(false);
  const [showWeightReps, setShowWeightReps] = useState(false);
  
  // Tutorial global functions
  React.useEffect(() => {
    global.tutorialUpload = {
      skipToPreviewWithDemo: () => {
        // Skip to demo video for tutorial (bypass duplicate check for demo)
        setSelectedVideo({
          uri: require('../../../../../assets/tutorial/formai-example-video.mp4'),
          width: 1920,
          height: 1080,
          duration: 30,
          type: 'video',
          fileName: 'demo-video.mp4',
          fileSize: 1000000,
        } as any);
        setShowMovementSelection(false);
        setShowWeightReps(false);
      },
      goToMovementSelection: () => {
        setShowMovementSelection(true);
        setShowWeightReps(false);
      },
      goToPractices: () => {
        setSelectedVideo(null);
        setShowMovementSelection(false);
        setShowWeightReps(false);
      },
      selectMovement: (movement: string) => {
        setSelectedMovement(movement);
      },
      goToWeightReps: () => {
        setShowMovementSelection(false);
        setShowWeightReps(true);
      },
      goToVideoPreview: () => {
        setShowMovementSelection(false);
        setShowWeightReps(false);
      },
      close: () => {
        onClose();
      },
    };
    
    return () => {
      if (global.tutorialUpload) {
        delete global.tutorialUpload;
      }
    };
  }, [onClose]);

  // Movement selection state
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>('all');
  const [filteredMovements, setFilteredMovements] = useState(gymMovements.map(m => m.name));


  // Reset states when modal becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setSelectedVideo(null);
      setShowMovementSelection(false);
      setShowWeightReps(false);
      setSelectedMovement('');
      setSearchQuery('');
      setFilteredMovements(gymMovements.map(m => m.name));
    }
  }, [isVisible]);



  const checkForDuplicateVideo = async (assetId: string): Promise<boolean> => {
    try {
      const userId = await getUserId();
      if (!userId) {
        return false;
      }

      const existingVideoPaths = await listUserVideoPaths(userId);
      
      // Extract the base asset ID (remove /L0/001 suffix if present)
      const baseAssetId = assetId.split('/')[0];
      
      // Check if any existing video has the same base assetId
      return existingVideoPaths.includes(baseAssetId);
    } catch (error) {
      return false;
    }
  };

  const handleUploadPress = async () => {
    // Selection haptic feedback
    hapticFeedback.selection();
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      
      if (asset) {
        // Check if video duration is available and under 90 seconds
        let durationInSeconds = asset.duration;
        
        // Handle different duration formats
        if (typeof asset.duration === 'number') {
          // If duration is in milliseconds, convert to seconds
          if (asset.duration > 1000) {
            durationInSeconds = asset.duration / 1000;
          }
        }

        // Check for duplicate video before setting as selected
        const isDuplicate = await checkForDuplicateVideo(asset.assetId || '');
        
        // Check if video duration is under 90 seconds
        if (durationInSeconds !== undefined && durationInSeconds !== null && durationInSeconds > 90) {
          hapticFeedback.error();
          Alert.alert(
            i18n.t('upload.videoTooLong'),
            i18n.t('upload.videoTooLongMessage'),
            [
              { 
                text: 'OK', 
                onPress: () => {
                  // Go back and open media library again
                  handleUploadPress();
                }
              },
            ]
          );
          return;
        }
        
        if (isDuplicate) {
          hapticFeedback.error();
          Alert.alert(
            i18n.t('upload.duplicateVideo'),
            i18n.t('upload.duplicateVideoMessage'),
            [
              { 
                text: i18n.t('upload.selectDifferentVideo'), 
                onPress: () => {
                  // Open media library again
                  handleUploadPress();
                }
              },
            ]
          );
          return;
        }

        // Video is valid, not a duplicate, and within duration limit, set it as selected
        setSelectedVideo(asset);
      }
    } catch (error) {
      // Handle permission errors specifically
      if (error instanceof Error && error.message.includes('permission')) {
        Alert.alert(
          i18n.t('upload.permissionRequired'),
          i18n.t('upload.permissionMessage'),
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(i18n.t('upload.error'), i18n.t('upload.failedToSelectVideo'));
      }
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

  const getDateAndTime = () => {
    const now = new Date();
  
    // 📅 Date (YYYY-MM-DD) - Use selected date from calendar
    const date = selectedDate.toISOString().split("T")[0];
  
    // ⏰ Time (hh:mm AM/PM) - Use current time
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
  
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 -> 12
  
    const time = `${hours}:${minutes} ${ampm}`;
  
    return { date, time };
  };

  const handleFinalCompleteClicked = async (data: { weight: number; unit: 'kg' | 'lbs'; reps: number }) => {
    const videoUri = selectedVideo?.uri || '';
    const fullAssetId = selectedVideo?.assetId || '';
    // Extract the base asset ID (remove /L0/001 suffix if present)
    const baseAssetId = fullAssetId.split('/')[0];
    const { date, time } = getDateAndTime();

    // Close the modal immediately
    onClose();

    try {
      const thumbnailUri = await generateVideoThumbnail(videoUri);
      
      // Enqueue the loading lift without awaiting
      void addLoadingLift({
        videoLink: videoUri,
        thumbnailUri,
        dateToday: date,
        timeToday: time,
        movementType: selectedMovement,
        weightValue: data.weight,
        reps: data.reps,
        assetId: baseAssetId,
      });
      
      hapticFeedback.success();
    } catch (error) {
      Alert.alert(i18n.t('upload.error'), i18n.t('upload.failedToGenerateThumbnail'));
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    filterMovements(text, selectedBodyPart);
  };

  const handleBodyPartChange = (bodyPart: BodyPart) => {
    setSelectedBodyPart(bodyPart);
    filterMovements(searchQuery, bodyPart);
  };

  const filterMovements = (searchText: string, bodyPart: BodyPart) => {
    let filtered = [...gymMovements];
    
    // Filter by body part
    if (bodyPart !== 'all') {
      filtered = filtered.filter(movement => movement.bodyPart === bodyPart);
    }
    
    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(movement =>
        movement.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredMovements(filtered.map(m => m.name));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedMovement(''); // Clear the selected movement
    filterMovements('', selectedBodyPart); // Reset search but keep body part filter
  };

  const resetModal = () => {
    setSelectedVideo(null);
    setShowMovementSelection(false);
    setShowWeightReps(false);
    setSelectedMovement('');
    setSearchQuery('');
    setSelectedBodyPart('all');
    setFilteredMovements(gymMovements.map(m => m.name));
  };

  const handleClose = () => {
    hapticFeedback.selection();
    resetModal();
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button and Title */}
      <View style={styles.topControls}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Upload Video</Text>
        </View>
        <TouchableOpacity onPress={() => {
          hapticFeedback.selection();
          onClose();
        }} style={styles.closeButton}>
          <X width={24} height={24} color="#000000" />
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
              i18n.t('upload.tips.sideView')
            ]}
          />
        ) : showMovementSelection ? (
          // Movement Selection - shown when video is selected and user clicked continue
          <MovementSelectionScreen
            searchQuery={searchQuery}
            filteredMovements={filteredMovements}
            selectedMovement={selectedMovement}
            selectedBodyPart={selectedBodyPart}
            onMovementSelect={handleMovementSelect}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onBodyPartChange={handleBodyPartChange}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    backgroundColor: '#f3f4f6',
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