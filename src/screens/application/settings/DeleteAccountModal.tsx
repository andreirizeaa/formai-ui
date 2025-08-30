import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { X } from 'lucide-react-native';

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({ isVisible, onClose, onConfirm }: DeleteAccountModalProps) {
  const [isAcknowledgementStep, setIsAcknowledgementStep] = React.useState(false);
  const [hasAcknowledged, setHasAcknowledged] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!isVisible) {
      setIsAcknowledgementStep(false);
      setHasAcknowledged(false);
      setIsDeleting(false);
    }
  }, [isVisible]);

  const handleAcknowledge = () => {
    hapticFeedback.selection();
    setHasAcknowledged(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      hapticFeedback.success();
    } catch {
      hapticFeedback.error();
    } 
    finally {
      setIsDeleting(false);
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
          <Text style={styles.title}>{i18n.t('settings.deleteAccountTitle')}</Text>

          {/* Message */}
          {isAcknowledgementStep ? (
            <Text style={styles.message}>
              Deleting your Form AI account through the app does not cancel your subscription. Please remember to cancel your subscription separately in your device's subscription settings so you aren't charged again.
            </Text>
          ) : (
            <Text style={styles.message}>{i18n.t('settings.deleteAccountMessage')}</Text>
          )}

          {/* Action buttons */}
          {isAcknowledgementStep ? (
            <View style={styles.acknowledgeContainer}>
              <TouchableOpacity 
                style={[
                  styles.acknowledgeButton,
                  hasAcknowledged && styles.deleteButton
                ]}
                onPress={hasAcknowledged ? handleDelete : handleAcknowledge}
                activeOpacity={0.8}
                disabled={isDeleting}
              >
                {hasAcknowledged && isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[
                    styles.acknowledgeButtonText,
                    hasAcknowledged && styles.deleteButtonText
                  ]}>
                    {hasAcknowledged ? 'Delete account' : 'I acknowledge'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => {
                  hapticFeedback.selection();
                  onClose();
                }}
              >
                <Text style={styles.buttonText}>{i18n.t('settings.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => {
                  hapticFeedback.selection();
                  setIsAcknowledgementStep(true);
                }}
              >
                <Text style={styles.buttonText}>{i18n.t('settings.yes')}</Text>
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: 8,
    textAlign: 'left',
  },
  message: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginHorizontal: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  acknowledgeContainer: {
    marginTop: 4,
  },
  acknowledgeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fb2c36',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
}); 