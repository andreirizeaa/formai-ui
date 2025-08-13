import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon } from '../../../components/icons/icons';
import { hapticFeedback } from '../../../utils/haptic';
import i18n from '../../../utils/i18n';

interface HowItWorksModalProps {
  isVisible: boolean;
  onClose: () => void;
  onViewFeedback: () => void;
}

export function HowItWorksModal({ isVisible, onClose, onViewFeedback }: HowItWorksModalProps) {
  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleViewFeedback = () => {
    hapticFeedback.selection();
    onViewFeedback();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('feedback.howItWorks')}</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                hapticFeedback.selection();
                onClose();
              }}
            >
              <CloseIcon width={24} height={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={styles.content}>
            <View style={styles.howItWorksContainer}>
              <View style={styles.howItWorksItems}>
                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>1</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step1')}
                    </Text>
                  </View>
                </View>

                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>2</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step2')}
                    </Text>
                  </View>
                </View>

                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>3</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step3')}
                    </Text>
                  </View>
                </View>

                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>4</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step4')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.viewFeedbackButton}
              onPress={handleViewFeedback}
              activeOpacity={0.7}
            >
              <Text style={styles.viewFeedbackButtonText}>{i18n.t('feedback.viewFeedback')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  viewFeedbackButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  viewFeedbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  howItWorksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  howItWorksItems: {
    width: '100%',
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
  },
  howItWorksIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  howItWorksNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  howItWorksContent: {
    flex: 1,
  },
  howItWorksText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    lineHeight: 24,
  },
}); 