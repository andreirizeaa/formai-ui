import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGetStarted = () => {
    hapticFeedback.next();
    onGetStarted();
  };

  const handleSignIn = () => {
    hapticFeedback.selection();
    onSignIn();
  };

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
        
        <Text 
          style={[
            styles.subtitle,
            { 
              color: isDark ? '#AEAEB2' : '#8E8E93',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
            }
          ]}
        >
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
          <Text 
            style={[
              styles.getStartedText,
              { 
                color: isDark ? '#000000' : '#FFFFFF',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
              }
            ]}
          >
            {i18n.t('getStarted')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
          <Text 
            style={[
              styles.signInText,
              { 
                color: isDark ? '#AEAEB2' : '#8E8E93',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
              }
            ]}
          >
            {i18n.t('signIn')}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    width: 260,
    height: 180,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
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
    marginBottom: 16,
  },
  getStartedText: {
    fontSize: 17,
    fontWeight: '600',
  },
  signInText: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
}); 