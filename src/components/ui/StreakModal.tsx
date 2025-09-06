import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { hapticFeedback } from '../../utils/haptic';
import i18n from '../../utils/i18n';
import { StreakCalendar } from './StreakCalendar';

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
    hapticFeedback.selection();
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
          {/* Header with FormAI logo and streak pill */}
          <View style={styles.modalHeader}>
            <Image
              source={require('../../../assets/formai-light-icon.png')}
              style={styles.modalLogo}
              contentFit="contain"
            />
            <View style={styles.streakBadge}>
              <Image
                source={require('../../../assets/icons/fire.png')}
                style={styles.streakBadgeIcon}
                contentFit="contain"
              />
              <Text style={styles.streakBadgeText}>{currentStreak}</Text>
            </View>
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

          {/* Streak Calendar */}
          <StreakCalendar />

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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalLogo: {
    width: 100,
    height: 30,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  streakBadgeIcon: {
    width: 18,
    height: 18,
  },
  streakBadgeText: {
    marginLeft: 2,
    marginTop: 4,
    fontSize: 17,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  fireModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 32,
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
    marginBottom: 40,
    marginTop: -16,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    height: 60,
    borderRadius: 28,
    marginBottom: 6,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
  },
});
