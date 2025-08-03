import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Svg, { Path } from 'react-native-svg';

interface VideoPreviewScreenProps {
  videoUri: string;
  onSelectNewVideo: () => void;
  onContinue: () => void;
  onClose: () => void;
  title?: string;
  selectNewVideoText?: string;
}

interface VideoPlayerComponentProps {
  videoUri: string;
}

function VideoPlayerComponent({ videoUri }: VideoPlayerComponentProps) {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.showNowPlayingNotification = false;
    player.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.videoPreview}
    />
  );
}

export function VideoPreviewScreen({ 
  videoUri, 
  onSelectNewVideo, 
  onContinue, 
  onClose,
  title = "Video Preview",
  selectNewVideoText = "Select New Video"
}: VideoPreviewScreenProps) {
  return (
    <>
      {/* Content */}
      <View style={styles.content}>
        {/* Video Preview */}
        <View style={styles.videoPreviewWrapper}>
          <View style={styles.videoPreviewContainer}>
            {videoUri ? (
              <VideoPlayerComponent videoUri={videoUri} />
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
        <View style={styles.buttonStack}>
          <TouchableOpacity style={styles.selectNewVideoButton} onPress={onSelectNewVideo}>
            <Text style={styles.selectNewVideoButtonText}>{selectNewVideoText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  videoPreviewWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
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
  bottomControls: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 4,
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
}); 