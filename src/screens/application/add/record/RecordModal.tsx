import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Path } from 'react-native-svg';
import i18n from '../../../../utils/i18n';
import { hapticFeedback } from '../../../../utils/haptic';

interface RecordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function RecordModal({ isVisible, onClose }: RecordModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (isVisible) {
      checkCameraPermission();
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

  const checkCameraPermission = async () => {
    if (permission?.granted) {
      setHasPermission(true);
    } else {
      const result = await requestPermission();
      setHasPermission(result.granted);
    }
  };

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;

    try {
      hapticFeedback.selection();
      setIsRecording(true);
      
      const video = await cameraRef.current.recordAsync();
      
      if (video) {
        console.log('Video recorded:', video.uri);
        // Here you would typically handle the recorded video
        // For now, we'll just close the modal
        onClose();
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current) return;

    try {
      hapticFeedback.selection();
      await cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleButtonPress = () => {
    if (isRecording) {
      // When recording, clicking the button closes the modal
      setIsRecording(false);
      onClose();
    } else {
      // When not recording, start recording
      handleStartRecording();
    }
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
            onClose();
          }},
        ]
      );
    } else {
      setIsRecording(false);
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
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          {/* Close Button */}
          <View style={styles.permissionTopControls}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white">
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
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
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
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineTop]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineLeft]} />
                </View>
                
                {/* Top Right Corner */}
                <View style={[styles.cornerGuide, styles.cornerTopRight]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineTop]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineRight]} />
                </View>
                
                {/* Bottom Left Corner */}
                <View style={[styles.cornerGuide, styles.cornerBottomLeft]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineBottom]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineLeft]} />
                </View>
                
                {/* Bottom Right Corner */}
                <View style={[styles.cornerGuide, styles.cornerBottomRight]}>
                  <View style={[styles.cornerLine, styles.cornerLineHorizontal, styles.cornerLineBottom]} />
                  <View style={[styles.cornerLine, styles.cornerLineVertical, styles.cornerLineRight]} />
                </View>
              </View>

              {/* Top Controls */}
              <View style={styles.topControls}>
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
                    {!isRecording && (
                      <View style={styles.recordIcon} />
                    )}
                    {isRecording && (
                      <View style={styles.recordSquare} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </CameraView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  cornerGuide: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  cornerLine: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 1,
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
    paddingHorizontal: 12,
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
}); 