import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { ILiftData } from '../screens/application/feedback/liftDetails';

interface LiftDataCardProps {
  lift: ILiftData;
  onPress?: (lift: ILiftData) => void;
  style?: any;
  translateY?: Animated.Value | Animated.AnimatedInterpolation<string | number>;
  opacity?: Animated.Value;
}

export function LiftDataCard({ lift, onPress, style, translateY, opacity }: LiftDataCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(lift);
    }
  };

  const cardStyle = [
    styles.liftCard,
    style,
    translateY && {
      transform: [{ translateY }],
    },
    opacity && {
      opacity,
    },
  ];

  return (
    <Animated.View style={cardStyle}>
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.liftCardContent}
        disabled={!onPress}
      >
        {/* Video Thumbnail - Left 25% */}
        <View style={styles.videoThumbnailContainer}>
          {lift.thumbnailURL ? (
            <Image
              source={{ uri: lift.thumbnailURL }}
              style={styles.videoThumbnail}
              resizeMode="cover"
              onError={() => {
                console.warn('Failed to load thumbnail:', lift.thumbnailURL);
              }}
            />
          ) : (
            <Image
              source={require('../../assets/placeholder-thumbnail.png')}
              style={styles.videoThumbnail}
              resizeMode="cover"
            />
          )}
        </View>
        
        {/* Content - Right 75% */}
        <View style={styles.liftContent}>
          <View style={styles.liftHeader}>
            <Text style={styles.liftName} numberOfLines={1} ellipsizeMode="tail">
              {lift.liftType}
            </Text>
            <Text style={styles.liftDate}>{lift.liftDate}</Text>
          </View>
          <View style={styles.liftAccuracyContainer}>
            <Text style={styles.accuracyLabel}>Accuracy</Text>
            <View style={styles.accuracyPill}>
              <Text style={styles.accuracyValue}>{lift.analysis.accuracy}%</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  liftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  liftCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -20, // Extend beyond card padding
  },
  videoThumbnailContainer: {
    height: 120,
    width: width * 0.25, // 25% of screen width
    overflow: 'hidden',
    borderTopLeftRadius: 18, // Only left side border radius
    borderBottomLeftRadius: 18, // Only left side border radius
    marginVertical: -20, // Extend beyond card padding
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liftContent: {
    flex: 1,
    paddingLeft: 16, // Add padding to separate from video
    paddingRight: 16, // Add padding to prevent text from touching right edge
  },
  liftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flex: 1,
    marginRight: 8,
  },
  liftDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flexShrink: 0,
  },
  liftAccuracyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  accuracyPill: {
    backgroundColor: '#000',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
}); 