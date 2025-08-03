import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../../utils/haptic';

interface FavouritesScreenProps {
  onBack: () => void;
  onTriggerAddOptions: () => void;
}

export function FavouritesScreen({ onBack, onTriggerAddOptions }: FavouritesScreenProps) {
  // Dummy empty list for now
  const favouriteVideos: any[] = [];

  const handleEmptyCardPress = () => {
    hapticFeedback.selection();
    onBack(); // Close favourites screen
    // Small delay to ensure navigation completes before triggering add options
    setTimeout(() => {
      onTriggerAddOptions();
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            hapticFeedback.selection();
            onBack();
          }}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
              stroke="#000000"
              strokeWidth={2}
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {favouriteVideos.length > 0 ? (
          // TODO: Add favourite videos list rendering here when we have data
          <View />
        ) : (
          <TouchableOpacity 
            style={styles.noFavouritesCard}
            onPress={handleEmptyCardPress}
            activeOpacity={0.7}
          >
            <View style={styles.noFavouritesContent}>
              <Text style={styles.noFavouritesTitle}>No favourite videos</Text>
              <Text style={styles.noFavouritesSubtitle}>Start analysing today's workout by taking a quick video</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  noFavouritesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noFavouritesContent: {
    alignItems: 'center',
  },
  noFavouritesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'SF Pro Display',
  },
  noFavouritesSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
    textAlign: 'center',
  },
}); 