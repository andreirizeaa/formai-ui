import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { X } from 'lucide-react-native';

interface VideoTooLongModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectNewVideo: () => Promise<void> | void;
}

export function VideoTooLongModal({ 
  isVisible, 
  onClose, 
  onSelectNewVideo 
}: VideoTooLongModalProps) {

  const handleSelectNewVideo = () => {
    hapticFeedback.selection();
    onClose();
    setTimeout(() => {
      try { onSelectNewVideo(); } catch (_) {}
    }, 100);
  };

  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
          >
            <X size={20} color="#000000" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>
            {i18n.t('upload.videoTooLong')}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {i18n.t('upload.videoTooLongMessage')}
          </Text>

          {/* Action button */}
          <TouchableOpacity 
            style={[styles.button, styles.buttonPrimary]} 
            onPress={handleSelectNewVideo}
          >
            <Text style={styles.buttonPrimaryText}>
              {i18n.t('upload.selectNewVideo')}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  closeButton: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'left',
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'left',
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#000000',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
