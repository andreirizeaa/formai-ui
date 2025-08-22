import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import LottieView from 'lottie-react-native';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';

interface WelcomeModalProps {
  isVisible: boolean;
  onGetStarted: () => void;
}

export function WelcomeModal({ isVisible, onGetStarted }: WelcomeModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGetStarted = () => {
    hapticFeedback.success();
    onGetStarted();
  };

  return (
    <Modal visible={isVisible} transparent>
      <View style={styles.overlay}>
        <View style={[
          styles.modalContainer,
          { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          {/* Confetti animation behind the modal content */}
          <View style={styles.confettiContainer}>
            <LottieView
              source={require('../../../../assets/animations/confetti.json')}
              autoPlay
              loop={false}
              style={styles.confetti}
            />
          </View>
          
          <Text style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>Welcome</Text>
          <Text style={[
            styles.message,
            { color: isDark ? '#AEAEB2' : '#000000' }
          ]}>Thank you for trusting Form AI. We're excited to help you achieve your goals.</Text>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.ctaButton, 
                { 
                  backgroundColor: isDark ? '#FFFFFF' : '#000000'
                }
              ]} 
              onPress={handleGetStarted} 
              activeOpacity={0.8}
            >
              <Text style={[
                styles.ctaText,
                { 
                  color: isDark ? '#000000' : '#FFFFFF',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
                }
              ]}>Let's show you around</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    borderRadius: 18,
    padding: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
  },
  subMessage: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'left',
  },
  footer: {
    marginTop: 8,
  },
  ctaButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0, // Behind the text and button content
  },
  confetti: {
    width: '150%',
    height: '150%',
  },
});


