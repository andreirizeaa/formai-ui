import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { hapticFeedback } from '../../utils/haptic';
import i18n from '../../utils/i18n';

interface StreakModalProps {
  visible: boolean;
  currentStreak: number;
  onClose: () => void;
}

export function StreakModal({ visible, currentStreak, onClose }: StreakModalProps) {
  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleContinue = () => {
    hapticFeedback.success();
    onClose();
  };

  return (
    <Modal
      visible={visible}
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
          {/* Title with FormAI logo */}
          <View style={styles.modalHeader}>
            <Image
              source={require('../../../assets/formai-light-icon.png')}
              style={styles.modalLogo}
              contentFit="contain"
            />
          </View>

          {/* Large centered fire icon */}
          <View style={styles.fireModalContent}>
            <Image
              source={require('../../../assets/icons/fire.png')}
              style={styles.fireModalIcon}
              contentFit="contain"
            />
          </View>

          {/* Streak text */}
          <Text style={styles.streakText}>
            {currentStreak === 0
              ? i18n.t('home.zeroDayStreak')
              : i18n.t('home.dayStreak', { count: currentStreak })}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {currentStreak === 0
              ? i18n.t('home.noStreakMessage')
              : i18n.t('home.onFireMessage')}
          </Text>

          {/* Action button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>{i18n.t('home.continue')}</Text>
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
  modalHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalLogo: {
    width: 100,
    height: 30,
  },
  fireModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fireModalIcon: {
    width: 118,
    height: 118,
  },
  streakText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ed694a',
    fontFamily: 'SF Pro Display',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: -16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ed694a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
});
