import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
        {/* Logo placeholder - will be replaced with actual logo images */}
        <View style={[
          styles.logoPlaceholder,
          { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
        ]}>
          <Text 
            style={[
              styles.logoText,
              { 
                color: isDark ? '#FFFFFF' : '#000000',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
              }
            ]}
          >
            FormAI
          </Text>
        </View>
        
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
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '400',
  },
}); 