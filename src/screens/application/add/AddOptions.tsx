import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { UploadIcon, VideoIcon } from '../../../components/icons/icons';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { useTutorialTarget } from '../../../context/TutorialContext';

interface AddOptionsProps {
  isVisible: boolean;
  onUploadPress: () => void;
  onRecordPress: () => void;
  onClose: () => void;
}

export function AddOptions({ isVisible, onUploadPress, onRecordPress, onClose }: AddOptionsProps) {
  const { ref: uploadButtonRef } = useTutorialTarget('add_options_upload');
  
  if (!isVisible) return null;

  return (
    <TouchableOpacity 
      style={styles.overlay} 
      onPress={() => {
        hapticFeedback.selection();
        onClose();
      }} 
      activeOpacity={1}
    >
      <View style={styles.darkOverlay}>
        <View style={styles.cardsContainer}>
          {/* Upload Video Card */}
          <TouchableOpacity 
            ref={uploadButtonRef}
            style={styles.card} 
            onPress={() => {
              hapticFeedback.selection();
              onUploadPress();
            }}
          >
            <View style={styles.iconContainer}>
              <UploadIcon width={32} height={32} color="currentColor" />
            </View>
            <Text style={styles.cardTitle}>{i18n.t('add.uploadVideo')}</Text>
          </TouchableOpacity>

          {/* Record Video Card */}
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => {
              hapticFeedback.selection();
              onRecordPress();
            }}
          >
            <View style={styles.iconContainer}>
              <VideoIcon width={32} height={32} color="currentColor" />
            </View>
            <Text style={styles.cardTitle}>{i18n.t('add.recordVideo')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 120,
    paddingRight: 40,
  },
  cardsContainer: {
    alignItems: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 