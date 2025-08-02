import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Alert, Image, TextInput, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType, VideoQuality } from 'expo-camera';
import { VideoView, useVideoPlayer } from 'expo-video';
import Svg, { Path } from 'react-native-svg';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';

interface RecordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

// Gym movements data (same as UploadModal)
const gymMovements = [
  'Flat Barbell Bench Press',
  'Incline Barbell Bench Press',
  'Decline Barbell Bench Press',
  'Flat Dumbbell Chest Press',
  'Incline Dumbbell Chest Press',
  'Decline Dumbbell Chest Press',
  'Flat Cable Chest Press',
  'Incline Cable Chest Press',
  'Decline Cable Chest Press',
  'Chest Fly (Dumbbell)',
  'Incline Chest Fly (Dumbbell)',
  'Cable Chest Fly',
  'Pec Deck Machine',
  'Push-Up',
  'Resistance Band Chest Press',

  'Deadlift',
  'Rack Pull',
  'Barbell Row',
  'Pendlay Row',
  'T-Bar Row',
  'Dumbbell Row',
  'Single Arm Dumbbell Row',
  'Seal Row',
  'Cable Row',
  'Lat Pulldown',
  'Pull-Up',
  'Chin-Up',
  'Straight Arm Cable Pulldown',
  'Resistance Band Row',
  'Machine Row',
  'Machine Pulldown',

  'Overhead Barbell Press',
  'Seated Dumbbell Shoulder Press',
  'Arnold Press',
  'Lateral Raise (Dumbbell)',
  'Lateral Raise (Cable)',
  'Front Raise (Dumbbell)',
  'Front Raise (Cable)',
  'Rear Delt Fly (Dumbbell)',
  'Rear Delt Fly (Cable)',
  'Face Pull',
  'Upright Row',
  'Machine Shoulder Press',
  'Resistance Band Shoulder Press',
  
  'Barbell Curl',
  'EZ-Bar Curl',
  'Dumbbell Curl',
  'Hammer Curl',
  'Incline Dumbbell Curl',
  'Cable Curl',
  'Preacher Curl',
  'Concentration Curl',
  'Machine Curl',
  'Resistance Band Curl',

  'Close Grip Bench Press',
  'Skullcrusher (Barbell or EZ-Bar)',
  'Dumbbell Overhead Triceps Extension',
  'Cable Triceps Pushdown',
  'Cable Overhead Triceps Extension',
  'Triceps Kickback',
  'Dips (Parallel Bars)',
  'Machine Triceps Extension',
  'Resistance Band Triceps Extension',

  'Barbell Back Squat',
  'Barbell Front Squat',
  'Goblet Squat',
  'Dumbbell Squat',
  'Leg Press',
  'Bulgarian Split Squat',
  'Walking Lunge',
  'Step-Up',
  'Machine Leg Extension',
  'Resistance Band Squat',

  'Romanian Deadlift (Barbell or Dumbbell)',
  'Stiff-Leg Deadlift',
  'Good Morning',
  'Glute Ham Raise',
  'Seated Leg Curl Machine',
  'Lying Leg Curl Machine',
  'Cable Leg Curl',
  'Resistance Band Leg Curl',

  'Hip Thrust (Barbell)',
  'Glute Bridge (Bodyweight or Dumbbell)',
  'Cable Kickback',
  'Banded Glute Bridge',
  'Donkey Kick (Cable or Band)',
  'Step-Up with Knee Raise',
  
  'Standing Calf Raise',
  'Seated Calf Raise',
  'Leg Press Calf Raise',
  'Smith Machine Calf Raise',
  'Resistance Band Calf Raise',

  'Plank',
  'Crunch',
  'Cable Crunch',
  'Hanging Leg Raise',
  'Toes to Bar',
  'Ab Wheel Rollout',
  'Russian Twist (Bodyweight or Weighted)',
  'Sit-Up',
  'Bicycle Crunch',
  'Machine Crunch',
  'Resistance Band Woodchopper',

  'Power Clean',
  'Clean and Press',
  'Snatch',
  'Thruster',
  'Kettlebell Swing',
  'Turkish Get-Up',
  'Farmer\'s Carry',
  'Medicine Ball Slam',
];

function VideoPlayerComponent({ videoUri }: { videoUri: string }) {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.showNowPlayingNotification = false;
    player.play();
  });

  return (
    <View style={styles.videoPreview}>
      <VideoView
        player={player}
        style={styles.videoPreview}
      />
    </View>
  );
}

export function RecordModal({ isVisible, onClose }: RecordModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPractices, setShowPractices] = useState(true);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [showMovementSelection, setShowMovementSelection] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredMovements, setFilteredMovements] = useState<string[]>(gymMovements);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [cameraKey, setCameraKey] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const recordingPromise = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (isVisible) {
      checkCameraPermission();
      setShowPractices(true);
      setShowVideoPreview(false);
      setShowMovementSelection(false);
      setIsRecording(false);
      setRecordingTime(0);
      setRecordedVideoUri(null);
      setSelectedMovement('');
      setSearchQuery('');
      setFilteredMovements(gymMovements);
      setIsCameraReady(false);
      setShowCamera(true);
      recordingPromise.current = null;
    }
  }, [isVisible]);

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

  const checkCameraPermission = async () => {
    if (permission?.granted) {
      setHasPermission(true);
    } else {
      const result = await requestPermission();
      setHasPermission(result.granted);
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

      // Kick off recordAsync, but DON'T await it here:
      recordingPromise.current = cameraRef.current.recordAsync({
        maxDuration: 60,
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current || !recordingPromise.current) {
      console.log('Camera not ready or no recording in progress');
      return;
    }

    try {
      hapticFeedback.selection();
      // Tell the Camera to stop
      cameraRef.current.stopRecording();
      setIsRecording(false);

      // Now await the same promise you saved
      const video = await recordingPromise.current;
      setRecordedVideoUri(video.uri);
      setShowVideoPreview(true);
    } catch (e) {
      console.error('Failed to finish recording:', e);
      Alert.alert('Error', 'Recording failed to finish. Please try again.');
    } finally {
      setIsRecording(false);
      setRecordingTime(0);
      setIsCameraReady(false);
      recordingPromise.current = null;
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

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    const filtered = gymMovements.filter(movement =>
      movement.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredMovements(filtered);
  };

  const handleFinalUpload = () => {
    if (!selectedMovement) {
      Alert.alert('Selection Required', 'Please select a movement before uploading.');
      return;
    }
    
    // Triple important haptic feedback for distinct feedback
    hapticFeedback.important();
    setTimeout(() => {
      hapticFeedback.important();
    }, 100);
    setTimeout(() => {
      hapticFeedback.important();
    }, 200);
    
    
    // Here you would typically upload the video to your server
    // For now, we'll just close the modal
    onClose();
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
        <SafeAreaView style={styles.container}>
          {/* Close Button */}
          <View style={styles.permissionTopControls}>
            <TouchableOpacity onPress={() => {
              setShowCamera(false);
              onClose();
            }} style={styles.closeButton}>
              <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8E8E93">
                <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </Svg>
            </TouchableOpacity>
          </View>
          
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionDescription}>
              Please grant camera permission to record videos.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={checkCameraPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle={showPractices || showVideoPreview || showMovementSelection ? "pageSheet" : "fullScreen"}
      onRequestClose={showPractices || showVideoPreview || showMovementSelection ? () => {
        setShowCamera(false);
        onClose();
      } : handleClose}
      statusBarTranslucent={true}
    >
      {showPractices ? (
        // Practices Content
        <SafeAreaView style={styles.practicesContainer}>
          {/* Close Button and Title */}
          <View style={styles.practicesTopControls}>
            <Text style={styles.practicesTitle}>Best recording practices</Text>
            <TouchableOpacity onPress={() => {
              setShowCamera(false);
              onClose();
            }} style={styles.practicesCloseButton}>
              <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8E8E93">
                <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Spacer to push content to bottom */}
          <View style={styles.practicesSpacer} />

          {/* Recording Tip Image */}
          <View style={styles.tipImageWrapper}>
            {/* Checkmark Icon */}
            <View style={styles.simpleIconContainer}>
              <Svg width={48} height={48} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000">
                <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </Svg>
            </View>
            <View style={styles.tipImageContainer}>
              <Image
                source={require('../../../../../assets/recording-tip.jpg')}
                style={styles.tipImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>General tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>1</Text>
                </View>
                <Text style={styles.tipText}>Ensure good lighting and a stable camera</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>2</Text>
                </View>
                <Text style={styles.tipText}>Try to record yourself from the side</Text>
              </View>
            </View>
          </View>

          {/* Next Button */}
          <View style={styles.practicesBottomControls}>
            <TouchableOpacity style={styles.practicesNextButton} onPress={handleNext}>
              <Text style={styles.practicesNextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : showVideoPreview ? (
        // Video Preview Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Video Preview</Text>
            </View>
            <TouchableOpacity onPress={() => {
              setShowCamera(false);
              onClose();
            }} style={styles.closeButton}>
              <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000">
                <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={[styles.content, { paddingHorizontal: 20 }]}>
            {/* Video Preview */}
            <View style={styles.videoPreviewWrapper}>
              <View style={styles.videoPreviewContainer}>
                {recordedVideoUri ? (
                  <VideoPlayerComponent videoUri={recordedVideoUri} />
                ) : (
                  <View style={styles.noVideoContainer}>
                    <Text style={styles.noVideoText}>No video available</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomControls}>
            <View style={[styles.buttonStack, { paddingHorizontal: 20 }]}>
              <TouchableOpacity style={styles.selectNewVideoButton} onPress={handleSelectNewVideo}>
                <Text style={styles.selectNewVideoButtonText}>Record New Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      ) : showMovementSelection ? (
        // Movement Selection Content
        <SafeAreaView style={styles.container}>
          {/* Close Button and Title */}
          <View style={styles.topControls}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Upload Video</Text>
            </View>
            <TouchableOpacity onPress={() => {
              setShowCamera(false);
              onClose();
            }} style={styles.closeButton}>
              <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#8E8E93">
                <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.movementSelectionContainer}>
              <Text style={styles.movementSelectionTitle}>What exercise were you doing?</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search movements..."
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholderTextColor="#8E8E93"
              />
              
              <ScrollView style={styles.movementsList} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
                {filteredMovements.map((movement, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.movementItem,
                      selectedMovement === movement && styles.movementItemSelected
                    ]}
                    onPress={() => handleMovementSelect(movement)}
                    activeOpacity={0.7}
                    delayPressIn={0}
                  >
                    <Text style={[
                      styles.movementItemText,
                      selectedMovement === movement && styles.movementItemTextSelected
                    ]}>
                      {movement}
                    </Text>
                    {selectedMovement === movement && (
                      <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000000">
                        <Path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </Svg>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomControls}>
            <View style={[styles.buttonStack, { paddingHorizontal: 20 }]}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.uploadButton, !selectedMovement && styles.uploadButtonDisabled]} 
                onPress={handleFinalUpload}
                disabled={!selectedMovement}
              >
                <Text style={[styles.uploadButtonText, !selectedMovement && styles.uploadButtonTextDisabled]}>
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      ) : (
        // Camera Content
        <SafeAreaView style={styles.cameraSafeArea}>
          <View style={styles.cameraContainer}>
            {showCamera && (
              <CameraView
                key={cameraKey}
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                mode='video'
                onCameraReady={() => setIsCameraReady(true)}
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

              {/* Corner Guides */}
              <View style={styles.cornerGuides}>
                {/* Top Left Corner */}
                <View style={[styles.cornerGuide, styles.cornerTopLeft]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineTop, { borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineLeft, { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                </View>
                
                {/* Top Right Corner */}
                <View style={[styles.cornerGuide, styles.cornerTopRight]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineTop, { borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineRight, { borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                </View>
                
                {/* Bottom Left Corner */}
                <View style={[styles.cornerGuide, styles.cornerBottomLeft]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineBottom, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineLeft, { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                </View>
                
                {/* Bottom Right Corner */}
                <View style={[styles.cornerGuide, styles.cornerBottomRight]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineBottom, { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineRight, { borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
                </View>
              </View>

              {/* Top Controls */}
              <View style={styles.topControls}>
                <View style={styles.topControlsSpacer} />
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </Svg>
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
  safeArea: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    zIndex: 10,
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
  buttonStack: {
    width: '100%',
  },
  selectNewVideoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectNewVideoButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  continueButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  backButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
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
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 0,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#000000',
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
    fontSize: 17,
    fontWeight: '400',
    color: '#8E8E93',
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
  },
  permissionButtonText: {
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
  practicesContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  practicesTopControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: -6,
    position: 'relative',
  },
  practicesCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  practicesTitle: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    position: 'absolute',
    top: 24,
    left: 20,
    width: '60%',
  },
  practicesSpacer: {
    flex: 1,
  },
  practicesBottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  practicesNextButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  practicesNextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  tipsCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  tipsList: {
    //
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  tipImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tipImageContainer: {
    width: '60%',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  iconContainer: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleIconContainer: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    zIndex: 10,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoPreviewWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  spacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  movementSelectionContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingBottom: 20,
    width: '100%',
  },
  movementSelectionTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  searchInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E93',
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginBottom: 20,
  },
  movementsList: {
    width: '100%',
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  movementItemSelected: {
    backgroundColor: '#E0E0E0',
  },
  movementItemText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  movementItemTextSelected: {
    fontWeight: '600',
  },
  topControlsSpacer: {
    width: 40, // Adjust as needed to balance the close button
  },
  cameraSafeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  noVideoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  noVideoSubtext: {
    color: '#8E8E93',
    fontSize: 14,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
}); 