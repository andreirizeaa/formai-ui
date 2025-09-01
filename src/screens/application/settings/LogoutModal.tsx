import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { X } from 'lucide-react-native';

interface LogoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isVisible, onClose, onConfirm }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (!isVisible) {
      setIsLoggingOut(false);
    }
  }, [isVisible]);

  const handleLogout = async () => {
    hapticFeedback.success();
    setIsLoggingOut(true);
    try {
      await onConfirm();
      // Modal will be closed by parent component after successful logout
    } catch (error) {
      // If logout fails, reset the loading state
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              hapticFeedback.selection();
              onClose();
            }}
          >
            <X size={20} color="#000000" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{i18n.t('settings.logoutTitle')}</Text>

          {/* Message */}
          <Text style={styles.message}>{i18n.t('settings.logoutMessage')}</Text>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonOutlined]} 
              onPress={() => {
                hapticFeedback.selection();
                onClose();
              }}
              disabled={isLoggingOut}
            >
              <Text style={styles.buttonOutlinedText}>{i18n.t('settings.no')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]} 
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonPrimaryText}>{i18n.t('settings.yes')}</Text>
              )}
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
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
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutlined: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  buttonPrimary: {
    backgroundColor: '#000000',
  },
  buttonOutlinedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 