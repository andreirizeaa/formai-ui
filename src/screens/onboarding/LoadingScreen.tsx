import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      <View style={styles.content}>
        {/* FormAI Icon */}
        <View style={styles.iconContainer}>
          <Image 
            source={isDark 
              ? require('../../../assets/formai-dark-icon.png')
              : require('../../../assets/formai-light-icon.png')
            }
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 260,
    height: 260,
  },
}); 