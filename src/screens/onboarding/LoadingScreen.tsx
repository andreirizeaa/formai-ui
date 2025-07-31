import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../utils/i18n';

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
    }, 2000);

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
      
      <View style={styles.bottomContainer}>
        <Text 
          style={[
            styles.loadingText,
            { 
              color: isDark ? '#AEAEB2' : '#8E8E93',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
            }
          ]}
        >
          {i18n.t('loading')}
        </Text>
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
  bottomContainer: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
  },
}); 