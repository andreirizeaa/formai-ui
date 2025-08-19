import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Alert, Image, TextInput, ScrollView, Keyboard, useColorScheme, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, type VideoFile } from 'react-native-vision-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';
import { generateVideoThumbnail } from '../../../../utils/generateVideoThumbnail';
import { VideoPreviewScreen } from '../common/VideoPreviewScreen';
import { MovementSelectionScreen } from '../common/MovementSelectionScreen';
import { PracticesScreen } from '../common/PracticesScreen';
import { WeightRepsScreen } from '../common/WeightRepsScreen';
import { LoadingLiftData, useLoadingLifts } from '../../../../context/LoadingLiftsContext';
import { gymMovements } from '../../../../constants/gymMovements';
import { CloseIcon } from '../../../../components/icons/icons';
import { useCameraPermissions } from 'expo-camera';

interface RecordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RecordModal({ isVisible, onClose }: RecordModalProps) {
  const { addLoadingLift } = useLoadingLifts();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPractices, setShowPractices] = useState(true);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [showMovementSelection, setShowMovementSelection] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredMovements, setFilteredMovements] = useState<string[]>([...gymMovements]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [cameraKey, setCameraKey] = useState(0);
  const cameraRef = useRef<Camera>(null);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const device = useCameraDevice(cameraFacing);
  const [permission, requestPermission] = useCameraPermissions();


  // Screen states
  const [showWeightReps, setShowWeightReps] = useState(false);

  // Weight and reps state
  const [weightData, setWeightData] = useState<{ weight: number; unit: 'kg' | 'lbs'; reps: number } | null>(null);

  // Combined state object for logging
  const [uploadData, setUploadData] = useState<{
    videoLink: string;
    thumbnailUri: string;
    dateToday: string;
    movementType: string;
    weightValue: number;
    reps: number;
  } | null>(null);

  useEffect(() => {
    if (isVisible) {
      // reflect current permission state, don't request automatically
      checkCameraPermission();
      setShowPractices(true);
      setShowVideoPreview(false);
      setShowMovementSelection(false);
      setIsRecording(false);
      setRecordingTime(0);
      setRecordedVideoUri(null);
      setSelectedMovement('');
      setSearchQuery('');
      setFilteredMovements([...gymMovements]);
      setIsCameraReady(false);
      setShowCamera(true);
      setUploadData(null);
    } else {
      // Reset states when modal becomes invisible
      setIsRecording(false);
      setShowPractices(true);
      setShowVideoPreview(false);
      setShowMovementSelection(false);
      setShowWeightReps(false);
      setShowCamera(false);
      setRecordedVideoUri(null);
      setSelectedMovement('');
      setSearchQuery('');
      setFilteredMovements([...gymMovements]);
      setUploadData(null);
    }
  }, [isVisible]);

  // keep permission in sync when the hook updates
  useEffect(() => {
    checkCameraPermission();
  }, [permission]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    hapticFeedback.selection();
    setShowPractices(false);
    setShowCamera(true);
  };

  const checkCameraPermission = () => {
    try {
      if (permission == null) return;
      setHasPermission(permission.granted);
    } catch (e) {
      console.error('Permission check failed:', e);
      setHasPermission(false);
    }
  };

  const requestCameraPermissionFromUser = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted && result.canAskAgain === false) {
        Linking.openSettings();
        setHasPermission(false);
        return;
      }
      setHasPermission(result.granted);
    } catch (e) {
      console.error('Permission request failed:', e);
      setHasPermission(false);
    }
  };

  const handleStartRecording = () => {
    if (!cameraRef.current || !isCameraReady) {
      console.log('Camera not ready or ref not available');
      return;
    }

    try {
      hapticFeedback.selection();
      setIsRecording(true);

      cameraRef.current.startRecording({
        fileType: Platform.OS === 'ios' ? 'mov' : 'mp4',
        onRecordingFinished: (video: VideoFile) => {
          const path = video.path as string;
          const uri = path.startsWith('file://') ? path : `file://${path}`;
          setRecordedVideoUri(uri);
          setShowVideoPreview(true);
        },
        onRecordingError: error => {
          console.error('Recording error:', error);
          Alert.alert('Error', 'Recording failed. Please try again.');
          setIsRecording(false);
        },
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current || !isRecording) {
      console.log('Camera not ready or no recording in progress');
      return;
    }

    try {
      hapticFeedback.selection();
      cameraRef.current.stopRecording();
    } catch (e) {
      console.error('Failed to finish recording:', e);
      Alert.alert('Error', 'Recording failed to finish. Please try again.');
    } finally {
      setIsRecording(false);
      setRecordingTime(0);
      setIsCameraReady(false);
      setCameraKey(prevKey => prevKey + 1);
    }
  };

  const handleButtonPress = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleSelectNewVideo = async () => {
    hapticFeedback.selection();
    
    // Reset all recording-related state
    setShowVideoPreview(false);
    setRecordedVideoUri(null);
  
    // 1) unmount camera
    setShowCamera(false);

    // 2) on next tick, bump key & remount
    setTimeout(() => {
      setCameraKey(k => k + 1);
      setShowCamera(true);
    }, 50);
  };

  const handleContinue = () => {
    hapticFeedback.selection();
    setShowVideoPreview(false);
    setShowMovementSelection(true);
  };

  const handleBack = () => {
    hapticFeedback.selection();
    setShowMovementSelection(false);
    setShowCamera(false);
    setShowVideoPreview(true);
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
    const videoUri = recordedVideoUri || '';
    const today = new Date().toISOString().split('T')[0];

    // Close the modal immediately
    onClose();

    try {
      const thumbnailUri = await generateVideoThumbnail(videoUri);
      // Enqueue the loading lift without awaiting
      void addLoadingLift({
        videoLink: videoUri,
        thumbnailUri,
        dateToday: today,
        movementType: selectedMovement,
        weightValue: data.weight,
        reps: data.reps,
      });
      hapticFeedback.success();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      Alert.alert('Error', 'Failed to generate video thumbnail. Please try again.');
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    const filtered = [...gymMovements].filter(movement =>
      movement.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMovements(filtered);
  };

  const handleClose = () => {
    hapticFeedback.selection();
    if (isRecording) {
      Alert.alert(
        'Stop Recording?',
        'Are you sure you want to stop recording?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Stop', style: 'destructive', onPress: () => {
            handleStopRecording();
            setIsRecording(false);
            setShowPractices(true);
            setShowCamera(false);
            onClose();
          }},
        ]
      );
    } else {
      setIsRecording(false);
      setShowPractices(true);
      setShowVideoPreview(false);
      setShowMovementSelection(false);
      setShowWeightReps(false);
      setShowCamera(false);
      onClose();
    }
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCamera(false);
          onClose();
        }}
      >
        <SafeAreaView 
          style={[
            styles.container,
            { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
          ]}
        >
          {/* Close Button */}
          <View style={styles.permissionTopControls}>
            <TouchableOpacity onPress={() => {
              hapticFeedback.selection();
              onClose();
            }} style={[styles.closeButton]}>
              <CloseIcon width={24} height={24} color={isDark ? '#8E8E93' : '#8E8E93'} />
            </TouchableOpacity>
          </View>

          {/* Main content */}
          <View style={styles.permissionContentWrapper}>
            {/* Title */}
            <Text style={[styles.permissionMainTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              {i18n.t('onboarding.cameraPermission.title')}
            </Text>

            {/* Subtitle */}
            <Text style={[styles.permissionSubtitle, { color: '#8E8E93' }]}>
              {i18n.t('onboarding.cameraPermission.subtitle')}
            </Text>

            {/* Dialog */}
            <View style={styles.permissionDialogWrapper}>
              <View style={[
                styles.permissionDialog,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  shadowColor: '#000000',
                }
              ]}>
                <View style={[
                  styles.permissionTextArea,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                ]}>
                  <Text style={[
                    styles.permissionDialogText,
                    { color: isDark ? '#FFFFFF' : '#000000', fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto' }
                  ]}>
                    {i18n.t('onboarding.cameraPermission.dialogText')}
                  </Text>
                </View>

                <View style={[
                  styles.permissionButtonContainer,
                  { borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA', borderTopWidth: 1 }
                ]}>
                  <TouchableOpacity
                    style={[styles.permissionButtonCommon, styles.permissionDontAllowButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
                    onPress={() => hapticFeedback.selection()}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.permissionButtonText, { color: isDark ? '#FFFFFF' : '#000000', fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto' }]}>
                      {i18n.t('onboarding.cameraPermission.dontAllow')}
                    </Text>
                  </TouchableOpacity>

                  <View style={[styles.permissionButtonDivider, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]} />

                  <TouchableOpacity
                    style={[styles.permissionButtonCommon, styles.permissionAllowButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
                    onPress={requestCameraPermissionFromUser}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.permissionButtonText, { color: isDark ? '#000000' : '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto' }]}>
                      {i18n.t('onboarding.cameraPermission.allow')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.permissionPointingEmoji}>👆</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={showPractices || showVideoPreview || showMovementSelection ? () => {
        onClose();
      } : handleClose}
    >
      {showPractices ? (
        // Practices Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Record Video</Text>
            </View>
            <TouchableOpacity onPress={() => {
              hapticFeedback.selection();
              onClose();
            }} style={[styles.closeButton]}>
              <CloseIcon width={24} height={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <PracticesScreen
              onNext={handleNext}
              buttonText="Next"
              tips={[
                "Ensure good lighting and a stable camera",
                "Try to record yourself from the side"
              ]}
            />
          </View>
        </SafeAreaView>
      ) : showVideoPreview ? (
        // Video Preview Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Record Video</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton]}>
              <CloseIcon width={24} height={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWithBottomPadding}>
            <VideoPreviewScreen
              videoUri={recordedVideoUri || ''}
              onSelectNewVideo={handleSelectNewVideo}
              onContinue={handleContinue}
              onClose={handleClose}
              selectNewVideoText="Record New Video"
            />
          </View>
        </SafeAreaView>
      ) : showMovementSelection ? (
        // Movement Selection Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Record Video</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton]}>
              <CloseIcon width={24} height={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWithBottomPadding}>
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
          </View>
        </SafeAreaView>
      ) : showWeightReps ? (
        // Weight and Reps Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Record Video</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton]}>
              <CloseIcon width={24} height={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWithBottomPadding}>
            <WeightRepsScreen
              onBack={handleWeightRepsBack}
              onUpload={handleFinalCompleteClicked}
            />
          </View>
        </SafeAreaView>
      ) : (
        // Camera Content
        <SafeAreaView style={styles.cameraSafeArea}>
          <View style={styles.cameraContainer}>
            {showCamera && device && (
              <Camera
                key={cameraKey}
                ref={cameraRef}
                style={styles.camera}
                device={device}
                isActive={showCamera}
                video={true}
                audio={isAudioEnabled}
                torch={isTorchOn ? 'on' : 'off'}
                onInitialized={() => setIsCameraReady(true)}
              />
            )}
            
            {/* Camera Overlay - positioned absolutely on top */}
            <View style={styles.cameraOverlay}>
              {/* Timer Pill */}
              <View style={styles.timerContainer}>
                <View style={[
                  styles.timerPill,
                  isRecording && styles.timerPillRecording
                ]}>
                  <Text style={[
                    styles.timerText,
                    isRecording && styles.timerTextRecording
                  ]}>{formatTime(recordingTime)}</Text>
                </View>
              </View>

              {/* Corner Guides
              <View style={styles.cornerGuides}>
                {/* Top Left Corner */}
                {/* <View style={[styles.cornerGuide, styles.cornerTopLeft]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineTop, { borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineLeft, { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                </View> */}
                
                {/* Top Right Corner */}
                {/* <View style={[styles.cornerGuide, styles.cornerTopRight]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineTop, { borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineRight, { borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                </View> */}
                
                {/* Bottom Left Corner */}
                {/* <View style={[styles.cornerGuide, styles.cornerBottomLeft]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineBottom, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineLeft, { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                </View>
                 */}
                {/* Bottom Right Corner */}
                {/* <View style={[styles.cornerGuide, styles.cornerBottomRight]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineBottom, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineRight, { borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                </View> */}
              {/* </View> */}

              {/* Top Controls */}
              <View style={styles.topControls}>
                <View style={styles.topControlsSpacer} />
                <TouchableOpacity onPress={() => {
                  hapticFeedback.selection();
                  onClose();
                }} style={styles.closeButton}>
                  <CloseIcon width={24} height={24} color="white" />
                </TouchableOpacity>
              </View>

              {/* Side Toggles (Vision Camera style) */}
              <View style={styles.sideToggles}>
                <TouchableOpacity
                  accessibilityLabel="Flip camera"
                  onPress={() => {
                    hapticFeedback.selection();
                    setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'));
                  }}
                  style={styles.toggleButton}
                >
                  <Ionicons name="camera-reverse" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Toggle torch"
                  onPress={() => {
                    hapticFeedback.selection();
                    setIsTorchOn(v => !v);
                  }}
                  style={styles.toggleButton}
                >
                  <Ionicons name={isTorchOn ? 'flash' : 'flash-off'} size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel="Toggle mic"
                  onPress={() => {
                    hapticFeedback.selection();
                    setIsAudioEnabled(v => !v);
                  }}
                  style={styles.toggleButton}
                >
                  <Ionicons name={isAudioEnabled ? 'mic' : 'mic-off'} size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.controlsContainer}>
                  {/* Record/Stop Button */}
                  <TouchableOpacity
                    style={[
                      styles.recordButton,
                      isRecording && styles.stopButton
                    ]}
                    onPress={handleButtonPress}
                    activeOpacity={0.8}
                  >
                    {isRecording ? (
                      <View style={styles.recordSquare} />
                    ) : (
                      <View style={styles.recordIcon} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginTop: 6,
  },
  bottomControls: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
    
  },
  controlsContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30',
  },
  recordSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  timerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  timerPill: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 6,
    marginTop: 20,
  },
  timerText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
  timerPillRecording: {
    backgroundColor: '#FF3B30',
  },
  timerTextRecording: {
    color: 'white',
  },
  cornerGuides: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  cornerGuide: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  cornerLine: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  cornerLineHorizontal: {
    width: 30,
    height: 3,
  },
  cornerLineVertical: {
    width: 3,
    height: 30,
  },
  cornerLineTop: {
    top: 0,
  },
  cornerLineBottom: {
    bottom: 30,
  },
  cornerLineLeft: {
    left: 0,
  },
  cornerLineRight: {
    right: 30,
  },
  cornerTopLeft: {
    top: 80,
    left: 60,
  },
  cornerTopRight: {
    top: 80,
    right: 30,
  },
  cornerBottomLeft: {
    bottom: 120,
    left: 60,
  },
  cornerBottomRight: {
    bottom: 120,
    right: 30,
  },
  sideToggles: {
    position: 'absolute',
    right: 20,
    top: 80,
    display: 'flex',
    gap: 12,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDisabled: {
    opacity: 0.4,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  permissionContentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  permissionMainTitle: {
    fontSize: 32,
    marginTop: 60,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  permissionSubtitle: {
    fontSize: 17,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  permissionDialogWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionDialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  permissionTextArea: {
    padding: 24,
    paddingBottom: 20,
  },
  permissionDialogText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButtonContainer: {
    flexDirection: 'row',
    height: 44,
  },
  permissionButtonCommon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionDontAllowButton: {},
  permissionAllowButton: {},
  permissionButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  permissionButtonDivider: {
    width: 1,
    height: '100%',
  },
  permissionPointingEmoji: {
    fontSize: 40,
    marginTop: 20,
    marginLeft: '55%',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  permissionDescription: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  permissionButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  permissionButtonTextAlt: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  permissionTopControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topControlsSpacer: {
    width: 40, // Adjust as needed to balance the close button
  },
  cameraSafeArea: {
    flex: 1,
    backgroundColor: '#000000',
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
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentWithBottomPadding: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
}); 