import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';

interface HowItWorksScreenProps {
  onClose: () => void;
  onViewFeedback: () => void;
}

export function HowItWorksScreen({ onClose, onViewFeedback }: HowItWorksScreenProps) {
  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleViewFeedback = () => {
    hapticFeedback.selection();
    onViewFeedback();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How it works</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
                stroke="#000000"
                strokeWidth={2}
              />
            </Svg>
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
                    Our AI notices specific moments during your lift where your form can be improved.
                  </Text>
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={styles.howItWorksIcon}>
                  <Text style={styles.howItWorksNumber}>2</Text>
                </View>
                <View style={styles.howItWorksContent}>
                  <Text style={styles.howItWorksText}>
                    It will then explain what was not optimal.
                  </Text>
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={styles.howItWorksIcon}>
                  <Text style={styles.howItWorksNumber}>3</Text>
                </View>
                <View style={styles.howItWorksContent}>
                  <Text style={styles.howItWorksText}>
                    Tips on how to stay safe and improve will be provided!
                  </Text>
                </View>
              </View>

              <View style={styles.howItWorksItem}>
                <View style={styles.howItWorksIcon}>
                  <Text style={styles.howItWorksNumber}>4</Text>
                </View>
                <View style={styles.howItWorksContent}>
                  <Text style={styles.howItWorksText}>
                    Then, it is up to you to improve on your form and then review in a week.
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
            <Text style={styles.viewFeedbackButtonText}>View Feedback</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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