import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';

interface AddOptionsProps {
  isVisible: boolean;
  onUploadPress: () => void;
  onRecordPress: () => void;
  onClose: () => void;
}

export function AddOptions({ isVisible, onUploadPress, onRecordPress, onClose }: AddOptionsProps) {
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
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.cardsContainer}>
          {/* Upload Video Card */}
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => {
              hapticFeedback.selection();
              onUploadPress();
            }}
          >
            <View style={styles.iconContainer}>
              <Svg width={32} height={32} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <Path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
              </Svg>
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
              <Svg width={32} height={32} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <Path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </Svg>
            </View>
            <Text style={styles.cardTitle}>{i18n.t('add.recordVideo')}</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
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
  blurContainer: {
    flex: 1,
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