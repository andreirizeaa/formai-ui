import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrangeGradientButton } from '../../components/ui/OrangeGradientButton';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { getUserId } from '../../services/storageService';
import { track } from '../../services/analytics';

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
    // Track home screen view
    track('Welcome Screen shown');

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleGetStarted = () => {
    hapticFeedback.selection();
    track('Welcome Screen CTA Clicked', { cta: 'get_started' });
    onGetStarted();
  };

  const handleSignIn = () => {
    hapticFeedback.selection();
    track('Welcome Screen CTA Clicked', { cta: 'sign_in' });
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
          contentFit="contain"
        />
      </View>

      {/* Content area with text and buttons */}
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {i18n.t('welcome.subtitle')}.
          </Text>
        </View>

        <View style={styles.actions}>
          <OrangeGradientButton
            title={`${i18n.t('getStarted')}!`}
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />

          <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
            <Text style={styles.signInText}>
              {i18n.t('signIn')}
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: -100,
  },
  photo: {
    width: '100%',
    height: '90%',
  },
  contentContainer: {
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  content: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    maxWidth: 340,
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  getStartedButton: {
    marginBottom: 8,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 