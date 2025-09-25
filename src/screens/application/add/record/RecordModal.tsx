import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Keyboard, useColorScheme, Linking, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, type VideoFile, useCameraFormat } from 'react-native-vision-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
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
import { useCameraPermissions } from 'expo-camera';
import { ChevronLeft, CircleQuestionMark, X, Timer, TimerOff } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { checkDuplicateAssetId } from '../../../../services/liftService';
import { showAlert } from '../../../../services/alertService';

interface RecordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RecordModal({ isVisible, onClose }: RecordModalProps) {
  const { addLoadingLift } = useLoadingLifts();
  const { selectedDate } = useSelectedDate();
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
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart>('all');
  const [filteredMovements, setFilteredMovements] = useState<string[]>(gymMovements.map(m => m.name));
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [cameraKey, setCameraKey] = useState(0);
  const cameraRef = useRef<Camera>(null);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const device = useCameraDevice(cameraFacing);
  const [permission, requestPermission] = useCameraPermissions();
  const format = useCameraFormat(device, [
    { videoResolution: { width: 1280, height: 720 } },
    { fps: 30 },
  ]);

  // Screen states
  const [showWeightReps, setShowWeightReps] = useState(false);

  // Countdown state
  const [countdownSetting, setCountdownSetting] = useState<number>(5); // default 5s
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [isPreCountdown, setIsPreCountdown] = useState(false);
  const [preCountdownValue, setPreCountdownValue] = useState<number>(0);
  const preCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animation value for finger icon
  const fingerTranslateY = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (isRecording && recordingTime >= 60) {
      handleStopRecording();
    }
  }, [isRecording, recordingTime]);

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
      setFilteredMovements(gymMovements.map(m => m.name));
      setIsCameraReady(false);
      setShowCamera(true);
      setShowCountdownModal(false);
      // reset any ongoing pre-countdown
      if (preCountdownIntervalRef.current) {
        clearInterval(preCountdownIntervalRef.current);
        preCountdownIntervalRef.current = null;
      }
      setIsPreCountdown(false);
      setPreCountdownValue(0);
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
      setFilteredMovements(gymMovements.map(m => m.name));
      setShowCountdownModal(false);
      if (preCountdownIntervalRef.current) {
        clearInterval(preCountdownIntervalRef.current);
        preCountdownIntervalRef.current = null;
      }
      setIsPreCountdown(false);
      setPreCountdownValue(0);
    }
  }, [isVisible]);

  // keep permission in sync when the hook updates
  useEffect(() => {
    checkCameraPermission();
  }, [permission]);

  // Finger animation effect
  useEffect(() => {
    if (hasPermission === false && isVisible) {
      const startFingerAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(fingerTranslateY, {
              toValue: -15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(fingerTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      
      startFingerAnimation();
    } else {
      // Reset animation when not showing permission screen
      fingerTranslateY.setValue(0);
    }
  }, [hasPermission, isVisible, fingerTranslateY]);

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
    const currentTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    const maxTime = '1:00'; // 60 seconds maximum
    return `${currentTime} / ${maxTime}`;
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
      setHasPermission(false);
    }
  };

  const handleStartRecording = () => {
    if (!cameraRef.current || !isCameraReady) {
      return;
    }

    try {
      hapticFeedback.selection();
      setIsRecording(true);

      cameraRef.current.startRecording({
        fileType: Platform.OS === 'ios' ? 'mov' : 'mp4',
        onRecordingFinished: async(video: VideoFile) => {
          const path = video.path as string;
          const uri = path.startsWith('file://') ? path : `file://${path}`;
          setRecordedVideoUri(uri);
          setShowVideoPreview(true);
          try {
            // Check and request media library permissions
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
              await MediaLibrary.saveToLibraryAsync(uri);
            }
          } catch (err) {
            // Failed to save video to media library
          }
        },
        onRecordingError: error => {
          showAlert(
            i18n.t('upload.error'), 
            i18n.t('upload.recordingFailed'),
            undefined,
            'RECORD_RECORDING_FAILED',
            error
          );
          setIsRecording(false);
        },
      });
    } catch (error) {
      setIsRecording(false);
      showAlert(
        i18n.t('upload.error'), 
        i18n.t('upload.failedToStartRecording'),
        undefined,
        'RECORD_FAILED_TO_START_RECORDING',
        error
      );
    }
  };

  const cancelPreCountdown = () => {
    if (preCountdownIntervalRef.current) {
      clearInterval(preCountdownIntervalRef.current);
      preCountdownIntervalRef.current = null;
    }
    setIsPreCountdown(false);
    setPreCountdownValue(0);
  };

  const startPreCountdown = () => {
    if (isRecording || isPreCountdown) return;
    if (countdownSetting <= 0) {
      handleStartRecording();
      return;
    }

    hapticFeedback.selection();
    setIsPreCountdown(true);
    setPreCountdownValue(countdownSetting);
    preCountdownIntervalRef.current = setInterval(() => {
      setPreCountdownValue(prev => {
        if (prev <= 1) {
          // start recording when about to hit 0
          if (preCountdownIntervalRef.current) {
            clearInterval(preCountdownIntervalRef.current);
            preCountdownIntervalRef.current = null;
          }
          setIsPreCountdown(false);
          setPreCountdownValue(0);
          handleStartRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current || !isRecording) {
      return;
    }

    try {
      cameraRef.current.stopRecording();
      hapticFeedback.success();
    } catch (e) {
      showAlert(
        i18n.t('upload.error'), 
        i18n.t('upload.failedToFinishRecording'),
        undefined,
        'RECORD_FAILED_TO_FINISH_RECORDING',
        e
      );
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
      if (countdownSetting > 0) startPreCountdown();
      else handleStartRecording();
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

  const handleContinue = async () => {
    hapticFeedback.selection();
    
    // Check for duplicate video before proceeding
    if (recordedVideoUri) {
      const uriParts = recordedVideoUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fullAssetId = fileName.split('.')[0];
      const baseAssetId = fullAssetId.split('/')[0]; // Remove /L0/001 suffix if present
      
      const isDuplicate = await checkDuplicateAssetId(baseAssetId);
      
      if (isDuplicate) {
        hapticFeedback.error();
        showAlert(
          i18n.t('upload.duplicateVideo'),
          i18n.t('upload.duplicateVideoMessage'),
          () => {
            // Go back to camera to record new video
            handleSelectNewVideo();
          },
          'RECORD_DUPLICATE_VIDEO'
        );
        return;
      }
    }
    
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
    const videoUri = recordedVideoUri || '';
    const { date, time } = getDateAndTime();

    // Extract assetId from the recorded video URI
    // The assetId is the filename without extension (after the last /)
    const uriParts = videoUri.split('/');
    const fileName = uriParts[uriParts.length - 1]; // Get the last part (filename)
    const recordedAssetId = fileName.split('.')[0]; // Remove file extension

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
        metricWeight: data.weight,
        reps: data.reps,
        assetId: recordedAssetId,
        videoDurationSec: recordingTime,
        pipelineStage: 'upload_video',
      });
      hapticFeedback.success();
    } catch (error) {
      showAlert(
        i18n.t('upload.error'), 
        i18n.t('upload.failedToGenerateThumbnail'),
        undefined,
        'RECORD_FAILED_TO_GENERATE_THUMBNAIL',
        error
      );
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

  const handleClose = () => {
    hapticFeedback.selection();
    if (isRecording) {
      showAlert(
        i18n.t('upload.stopRecording'),
        i18n.t('upload.stopRecordingMessage'),
        () => {
          handleStopRecording();
          setIsRecording(false);
          setShowPractices(true);
          setShowCamera(false);
          onClose();
        },
        'RECORD_STOP_RECORDING_CONFIRMATION'
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
    if (!isVisible) {
      return null;
    }
    
    return (
      <SafeAreaView 
        style={[
          styles.container,
          { backgroundColor: isDark ? '#1d293d' : '#FFFFFF' }
        ]}
      >
        {/* Close Button */}
        <View style={styles.permissionTopControls}>
          <TouchableOpacity onPress={() => {
            hapticFeedback.selection();
            onClose();
          }} style={[styles.closeButton]}>
            <X width={24} height={24} color={'#000000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraPermissionContainer}>
          {/* Dialog container with flex to center dialog */}
          <View style={styles.dialogWrapper}>
            {/* Title above the dialog */}
            <Text style={[
              styles.permissionTitle,
            ]}>
              {i18n.t('onboarding.cameraPermission.title')}
            </Text>
            {/* iOS-style Camera Permission Dialog */}
            <View style={[
              styles.dialog,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                shadowColor: isDark ? '#000000' : '#000000',
              }
            ]}>
              {/* Text Area */}
              <View style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? '#2C2C2E' : '#f3f4f6',
                }
              ]}>
                <Text style={[
                  styles.dialogText,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}>
                  {i18n.t('onboarding.cameraPermission.dialogText')}
                </Text>
              </View>
              
              {/* Buttons Container */}
              <View style={[
                styles.buttonContainer,
                {
                  borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  borderTopWidth: 1,
                }
              ]}>
                <View
                  style={[
                    styles.button,
                    styles.dontAllowButton,
                    {
                      backgroundColor: isDark ? '#2C2C2E' : '#f3f4f6',
                      paddingVertical: 0,
                      marginVertical: 0,
                    }
                  ]}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                    }
                  ]}>
                    {i18n.t('onboarding.cameraPermission.dontAllow')}
                  </Text>
                </View>
                
                <View style={[
                  styles.buttonDivider,
                  {
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  }
                ]} />
                
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.allowButton,
                    {
                      backgroundColor: isDark ? '#FFFFFF' : '#364153',
                      paddingVertical: 0,
                      marginVertical: 0,
                    }
                  ]}
                  onPress={requestCameraPermissionFromUser}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.buttonText,
                    {
                      color: isDark ? '#000000' : '#FFFFFF',
                      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                    }
                  ]}>
                    {i18n.t('onboarding.cameraPermission.allow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Animated upwards pointing finger emoji */}
            <Animated.View style={[
              styles.animatedFingerContainer,
              {
                transform: [{ translateY: fingerTranslateY }]
              }
            ]}>
              <Text style={styles.pointingEmoji}>👆</Text>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {showPractices ? (
        // Practices Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.t('add.recordVideo')}</Text>
            </View>
            <TouchableOpacity onPress={() => {
              hapticFeedback.selection();
              onClose();
            }} style={[styles.closeButton]}>
              <X width={24} height={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <PracticesScreen
              onNext={handleNext}
              buttonText={i18n.t('next')}
              tips={[
                i18n.t('add.recordingTips.0'),
                i18n.t('add.recordingTips.1')
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
              <Text style={styles.title}>{i18n.t('add.recordVideo')}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton]}>
              <X width={24} height={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWithBottomPadding}>
            <VideoPreviewScreen
              videoUri={recordedVideoUri || ''}
              onSelectNewVideo={handleSelectNewVideo}
              onContinue={handleContinue}
              onClose={handleClose}
              selectNewVideoText={i18n.t('add.recordVideo')}
            />
          </View>
        </SafeAreaView>
              ) : showMovementSelection ? (
        // Movement Selection Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.t('add.recordVideo')}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton]}>
              <X width={24} height={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentWithBottomPadding}>
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
          </View>
        </SafeAreaView>
              ) : showWeightReps ? (
        // Weight and Reps Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.t('add.recordVideo')}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={[styles.closeButton]}>
              <X width={24} height={24} color="#000000" />
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
                format={format}
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

              {/* Top Controls */}
              <View style={styles.topControls}>
                <TouchableOpacity onPress={() => {
                  hapticFeedback.selection();
                  cancelPreCountdown();
                  setShowCamera(false);
                  setShowPractices(true);
                }} style={styles.backButtonCamera} disabled={isRecording}>
                  <ChevronLeft size={24} color="#ffffff"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  hapticFeedback.selection();
                  cancelPreCountdown();
                  onClose();
                }} style={styles.closeButtonCamera}>
                  <X width={24} height={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Side Toggles (Vision Camera style) */}
              <View style={styles.sideToggles}>
                <TouchableOpacity
                  accessibilityLabel={i18n.t('upload.accessibility.flipCamera')}
                  onPress={() => {
                    hapticFeedback.selection();
                    setCameraFacing(prev => (prev === 'back' ? 'front' : 'back'));
                  }}
                  style={styles.toggleButton}
                >
                  <Ionicons name="camera-reverse" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel={i18n.t('upload.accessibility.toggleTorch')}
                  onPress={() => {
                    hapticFeedback.selection();
                    setIsTorchOn(v => !v);
                  }}
                  style={styles.toggleButton}
                >
                  <Ionicons name={isTorchOn ? 'flash' : 'flash-off'} size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel={i18n.t('upload.accessibility.toggleMic')}
                  onPress={() => {
                    hapticFeedback.selection();
                    setIsAudioEnabled(v => !v);
                  }}
                  style={styles.toggleButton}
                >
                  <Ionicons name={isAudioEnabled ? 'mic' : 'mic-off'} size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel={i18n.t('upload.accessibility.countdown')}
                  onPress={() => {
                    hapticFeedback.selection();
                    setShowCountdownModal(true);
                  }}
                  style={[
                    countdownSetting > 0 ? styles.countdownButton : styles.toggleButton,
                    countdownSetting > 0 && styles.countdownButtonActive,
                  ]}
                >
                  {countdownSetting > 0 ? (
                    <>
                      <Text style={styles.countdownText}>{countdownSetting}s</Text>
                      <Timer size={24} color="#000000" />
                    </>
                  ) : (
                    <TimerOff size={20} color="#FFFFFF" />
                  )}
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

              {/* Pre-record Countdown Overlay */}
              {isPreCountdown && (
                <View style={styles.preCountdownContainer}>
                  <Text style={styles.preCountdownText}>{preCountdownValue}</Text>
                </View>
              )}

              {/* Countdown Selection Modal */}
              <Modal
                visible={showCountdownModal}
                transparent
                onRequestClose={() => setShowCountdownModal(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowCountdownModal(false)}
                >
                  <TouchableOpacity
                    style={styles.modalContainerSmall}
                    activeOpacity={1}
                    onPress={e => e.stopPropagation()}
                  >
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => {
                        hapticFeedback.selection();
                        setShowCountdownModal(false);
                      }}
                    >
                      <X size={20} color="#000000" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{i18n.t('add.countdown.title')}</Text>
                    <View style={styles.modalButtonsRow}>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          countdownSetting === 0 && styles.modalButtonActive,
                        ]}
                        onPress={() => {
                          hapticFeedback.selection();
                          setCountdownSetting(0);
                          setShowCountdownModal(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.modalButtonText,
                          countdownSetting === 0 && { color: '#FFFFFF' }
                        ]}>{i18n.t('add.countdown.off')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          countdownSetting === 5 && styles.modalButtonActive,
                        ]}
                        onPress={() => {
                          hapticFeedback.selection();
                          setCountdownSetting(5);
                          setShowCountdownModal(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.modalButtonText,
                          countdownSetting === 5 && { color: '#FFFFFF' }
                        ]}>{i18n.t('add.countdown.fiveSeconds')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          countdownSetting === 10 && styles.modalButtonActive,
                        ]}
                        onPress={() => {
                          hapticFeedback.selection();
                          setCountdownSetting(10);
                          setShowCountdownModal(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.modalButtonText,
                          countdownSetting === 10 && { color: '#FFFFFF' }
                        ]}>{i18n.t('add.countdown.tenSeconds')}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>
        </SafeAreaView>
      )}
    </>
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginTop: 6,
  },
  backButtonCamera: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginTop: 6,
  },
  closeButtonCamera: {
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
    fontWeight: '700',
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
  countdownButton: {
    width: 40,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  countdownButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
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
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#000000',
    lineHeight: 38,
    marginBottom: 30,
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
  dialogWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  textArea: {
    padding: 24,
    paddingBottom: 20,
  },
  dialogText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 44,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAllowButton: {
    // Styled above
  },
  allowButton: {
    // Styled above
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDivider: {
    width: 1,
    height: '100%',
  },
  pointingEmoji: {
    fontSize: 40,
    marginRight: 24
  },
  animatedFingerContainer: {
    marginTop: 20,
    marginLeft: '55%',
  },
  cameraPermissionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraSafeArea: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
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
  preCountdownContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preCountdownText: {
    color: '#FFFFFF',
    fontSize: 200,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainerSmall: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 380,
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
    marginBottom: 16,
    textAlign: 'left',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 60,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  modalButtonActive: {
    backgroundColor: '#000000',
},
  modalButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
}); 