import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormAILogo } from '../../components/ui/FormAILogo';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Simulate loading time with 2 second delay for consistent startup experience
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadComplete, fadeAnim]);

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      <View style={styles.content}>
        {/* FormAI Icon */}
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
          <FormAILogo 
            iconSize={60}
            containerStyle={styles.logoContainer}
            textStyle={styles.logoText}
          />
        </Animated.View>
        
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 200,
    height: 200,
  },
  logoContainer: {
    marginBottom: 0,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 0,
  },
}); 