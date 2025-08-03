import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PracticesScreenProps {
  onNext?: () => void;
  onUpload?: () => void;
  title?: string;
  buttonText?: string;
  tips?: string[];
}

export function PracticesScreen({
  onNext,
  onUpload,
  title = "Best recording practices",
  buttonText,
  tips = [
    "Ensure good lighting and a stable camera",
    "Try to record yourself from the side"
  ]
}: PracticesScreenProps) {
  const handleButtonPress = () => {
    if (onNext) {
      onNext();
    } else if (onUpload) {
      onUpload();
    }
  };

  return (
    <>
      {/* Content */}
      <View style={styles.content}>
        {/* Spacer to push content to bottom */}
        <View style={styles.spacer} />

        {/* Recording Tip Image */}
        <View style={styles.tipImageWrapper}>
          {/* Checkmark Icon */}
          <View style={styles.simpleIconContainer}>
            <Svg width={48} height={48} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#000000">
              <Path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </Svg>
          </View>
          <View style={styles.tipImageContainer}>
            <Image
              source={require('../../../../../assets/recording-tip.jpg')}
              style={styles.tipImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>General tips</Text>
          <View style={styles.tipsList}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      {buttonText && (
        <View style={styles.bottomControls}>
          <View style={styles.buttonStack}>
            <TouchableOpacity style={styles.nextButton} onPress={handleButtonPress}>
              <Text style={styles.nextButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  tipImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  simpleIconContainer: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    zIndex: 10,
  },
  tipImageContainer: {
    width: '60%',
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  tipsCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  tipsList: {
    //
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333333',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  bottomControls: {
    justifyContent: 'flex-end',
    width: '100%',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  buttonStack: {
    width: '100%',
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 