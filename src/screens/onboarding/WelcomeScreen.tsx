import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, Modal, Pressable, ScrollView } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrangeGradientButton } from '../../components/ui/OrangeGradientButton';
import { AnimatedOptionButton } from '../../components/onboarding/AnimatedOptionButton';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../constants/languages';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { getUserId } from '../../services/storageService';
import { track } from '../../services/analytics';
import { X } from 'lucide-react-native';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [userId, setUserId] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { currentLanguage, setLanguage } = useLanguage();

  // Animation values for video container
  const videoTranslateY = React.useRef(new Animated.Value(500)).current; // Start below screen
  const videoTranslateX = React.useRef(new Animated.Value(400)).current; // Start way far right (like x=40)
  const videoRotation = React.useRef(new Animated.Value(30)).current; // Start rotated 30° right
  
  // Create video player with stable reference
  const playerRef = React.useRef<any>(null);
  const [videoReady, setVideoReady] = useState(false);
  const player = useVideoPlayer(require('../../../assets/formai-homescreen.mp4'), player => {
    player.loop = true;
    player.muted = true;
    playerRef.current = player;
  });

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

  // Video animation sequence - N shape movement with manual video control
  useEffect(() => {
    if (!videoReady) return;

    let cancelled = false;

    const startAnimation = () => {
      // Restart video from beginning - use safe reference
      if (playerRef.current && !cancelled) {
        try {
          playerRef.current.currentTime = 0;
          playerRef.current.play();
        } catch (error) {
          console.warn('Video restart failed:', error);
        }
      }

      // Phase 1: Enter from bottom right, rotate to portrait (1 second)
      const enterAnimation = Animated.parallel([
        Animated.timing(videoTranslateY, {
          toValue: 0,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(videoTranslateX, {
          toValue: 0,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(videoRotation, {
          toValue: 0,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]);

      // Phase 2: Stay in center for 13.5 seconds (after 1s entry = 14.5s total display)
      const stayAnimation = Animated.delay(13500);

      // Phase 3: Exit to bottom left, rotate -30° (1 second)
      const exitAnimation = Animated.parallel([
        Animated.timing(videoTranslateY, {
          toValue: 500,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(videoTranslateX, {
          toValue: -400, // Exit way far left (like x=-40)
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(videoRotation, {
          toValue: -30,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]);

      // Chain the animations and loop
      Animated.sequence([
        enterAnimation,
        stayAnimation,
      ]).start(() => {
        // Video continues playing during exit animation
        // (removed pause call to keep video playing)

        // Start exit animation with all transforms together
        exitAnimation.start(() => {
          if (cancelled) return;
          // Reset and restart immediately
          videoTranslateY.setValue(500);
          videoTranslateX.setValue(400);
          videoRotation.setValue(30);
          startAnimation();
        });
      });
    };

    // Start animation immediately when component mounts
    startAnimation();

    // Cleanup function to prevent memory leaks
    return () => {
      cancelled = true;
    };
  }, [videoReady, videoTranslateY, videoTranslateX, videoRotation]);

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

  const handleLanguagePress = () => {
    hapticFeedback.selection();
    track('Welcome Screen Language Pill Clicked');
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (languageCode: string) => {
    hapticFeedback.selection();
    track('Welcome Screen Language Selected', { language: languageCode });
    setLanguage(languageCode);
    setShowLanguageModal(false);
  };

  const handleCloseLanguageModal = () => {
    hapticFeedback.selection();
    setShowLanguageModal(false);
  };

  // Get current language info
  const currentLangInfo = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
        ]}
      >
      {/* Absolutely positioned language pill */}
      <Pressable
        style={({ pressed }) => [
          styles.languagePill,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={handleLanguagePress}
      >
        <Text style={styles.languageFlag}>{currentLangInfo.flag}</Text>
        <Text style={styles.languageCode}>{currentLangInfo.code.toUpperCase()}</Text>
      </Pressable>

      {/* App overview video */}
      <View style={styles.photoContainer}>
        <Animated.View
          style={[
            styles.videoContainer,
            {
              transform: [
                { translateY: videoTranslateY },
                { translateX: videoTranslateX },
                {
                  rotate: videoRotation.interpolate({
                    inputRange: [-30, 0, 30],
                    outputRange: ['-30deg', '0deg', '30deg'],
                  })
                },
              ],
            },
          ]}
        >
          <VideoView
            player={player}
            style={styles.photo}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="contain"
            nativeControls={false}
            onFirstFrameRender={() => setVideoReady(true)}
          />
        </Animated.View>
      </View>

      {/* Content area with text and buttons */}
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            {i18n.t('perfectFormAlways')}
          </Text>
        </View>

        <View style={styles.actions}>
          <OrangeGradientButton
            title={i18n.t('getStartedButton')}
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />

          <View style={styles.haveAccountContainer}>
            <Text style={styles.haveAccountText}>
              {i18n.t('alreadyHaveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <Text style={styles.signInLink}>
                {i18n.t('signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseLanguageModal}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleCloseLanguageModal}
        >
          <TouchableOpacity
            style={styles.popupContainer}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when clicking inside the modal
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Language</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseLanguageModal}>
                <X width={20} height={20} color="#000000" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalContent}>
              <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
                {LANGUAGES.map((item, index) => (
                  <AnimatedOptionButton
                    key={item.code}
                    onPress={() => handleLanguageSelect(item.code)}
                    isSelected={currentLanguage === item.code}
                    isDark={false}
                    delay={index * 50} // Stagger animation
                    style={[
                      styles.languageButton,
                      currentLanguage === item.code ? styles.selectedLanguageButton : styles.unselectedLanguageButton
                    ]}
                  >
                    <View style={styles.languageOptionContent}>
                      <Text style={[
                        styles.languageOptionText,
                        { color: currentLanguage === item.code ? '#FFFFFF' : '#000000' }
                      ]}>
                        {item.nativeName}
                      </Text>
                      <Text style={styles.languageOptionFlag}>{item.flag}</Text>
                    </View>
                  </AnimatedOptionButton>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languagePill: {
    position: 'absolute',
    top: 60, // Position from top of safe area
    right: 20, // Position from right edge
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Same as active option button background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  languageCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000', // Black text on white background
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    overflow: 'hidden', // Hide video when it's outside bounds
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  photo: {
    width: '100%',
    height: '100%',
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
  haveAccountContainer: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haveAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  signInLink: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textDecorationLine: 'underline',
  },
  // Modal styles - similar to FilterModal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: '85%',
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    flex: 1,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 0,
  },
  languageList: {
    width: '100%',
    paddingVertical: 10,
  },
  languageButton: {
    marginBottom: 16,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 14, // Reduced from default to make buttons shorter
    justifyContent: 'center',
  },
  selectedLanguageButton: {
    backgroundColor: '#000000', // Black for selected
  },
  unselectedLanguageButton: {
    backgroundColor: '#f3f4f6', // Gray for unselected
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  languageOptionText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  languageOptionFlag: {
    fontSize: 24,
  },
}); 