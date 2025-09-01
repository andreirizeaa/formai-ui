import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Animated } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { getUserId } from '../../services/storageService';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [userId, setUserId] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setUserId(userId);
    };
    fetchUserId();
  }, []);

  // Fade in animation when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGetStarted = () => {
    hapticFeedback.selection();
    onGetStarted();
  };

  const handleSignIn = () => {
    hapticFeedback.selection();
    onSignIn();
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
        ]}
      >
      {/* App overview photo */}
      <View style={styles.photoContainer}>
        <Image 
          source={require('../../../assets/app-overview-photo.png')}
          style={styles.photo}
          resizeMode="contain"
        />
      </View>

      {/* Content area with text and buttons */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {i18n.t('welcome.subtitle')}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[
            styles.getStartedButton,
            { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
          ]}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.getStartedText,
            { color: isDark ? '#000000' : '#FFFFFF' }
          ]}>
            {i18n.t('getStarted')}
          </Text>
        </TouchableOpacity>

        {!userId && (
        <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
          <Text style={styles.signInText}>
            {i18n.t('signIn')}
          </Text>
        </TouchableOpacity>
        )}
      </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  photo: {
    width: '100%',
    height: '90%',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  getStartedButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  getStartedButtonTheme: {
    backgroundColor: '#000000',
  },
  getStartedText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  signInText: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 