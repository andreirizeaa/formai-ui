import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';

interface LiftDetailsProps {
  onClose: () => void;
  onShowFeedbackSlideshow: () => void;
  liftData?: {
    liftName: string;
    liftDate: string;
    liftAccuracy: number;
  };
}

export function LiftDetails({ onClose, onShowFeedbackSlideshow, liftData }: LiftDetailsProps) {
  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleReviewFeedback = () => {
    hapticFeedback.selection();
    onShowFeedbackSlideshow();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerCard}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
                stroke="#000000"
                strokeWidth={2}
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.title}>Lift Details</Text>
        </View>
        
        <View style={styles.content}>
          {/* First Card */}
          <View style={styles.card}>
          </View>

          {/* Second Card */}
          <View style={styles.card}>
          </View>

          {/* Third Card - Review Feedback */}
          <TouchableOpacity 
            style={styles.card}
            onPress={handleReviewFeedback}
            activeOpacity={0.7}
          >
            <View style={styles.reviewFeedbackRow}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  stroke="#000000"
                  strokeWidth={1.5}
                />
              </Svg>
              <Text style={styles.reviewFeedbackText}>Review Feedback</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  reviewFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewFeedbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginLeft: 12,
  },
}); 