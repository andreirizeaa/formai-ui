import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../utils/i18n';

interface CreateAccountScreenProps {
  onNext: () => void;
}

export function CreateAccountScreen({ onNext }: CreateAccountScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Main content */}
      <View style={styles.contentWrapper}>
        {/* Main Title */}
        <Text style={[
          styles.mainTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {i18n.t('createAccount.title')}
        </Text>

        {/* Button container with flex to center buttons */}
        <View style={styles.buttonWrapper}>
          {/* Sign in buttons */}
          <View style={styles.buttonContainer}>
            {/* Sign in with Apple */}
            <TouchableOpacity
              style={[
                styles.appleButton,
                { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
              ]}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Image 
                  source={require('../../../assets/icons/apple.png')}
                  style={[
                    styles.appleIcon,
                    { tintColor: isDark ? '#000000' : '#FFFFFF' }
                  ]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.appleButtonText,
                  { color: isDark ? '#000000' : '#FFFFFF' }
                ]}>
                  {i18n.t('createAccount.signInWithApple')}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Sign in with Google */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                { 
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  borderColor: isDark ? '#FFFFFF' : '#000000'
                }
              ]}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Image 
                  source={require('../../../assets/icons/google.png')}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.googleButtonText,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {i18n.t('createAccount.signInWithGoogle')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 32,
    marginTop: 60,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  appleButton: {
    width: '80%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    width: '80%',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  googleIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  appleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 