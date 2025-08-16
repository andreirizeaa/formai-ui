import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraPermissions } from 'expo-camera';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface CameraPermissionScreenProps {
  onNext: () => void;
}

export function CameraPermissionScreen({ onNext }: CameraPermissionScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [permission, requestPermission] = useCameraPermissions();

  const handleAllowCamera = async () => {
    hapticFeedback.selection();
    try {
      const result = await requestPermission();
      if (result.granted) {
        onNext();
      } else {
        console.log('Camera permission denied');
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };

  const handleDontAllow = async () => {
    hapticFeedback.selection();
  };

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
          {i18n.t('onboarding.cameraPermission.title')}
        </Text>

        {/* Subtitle */}
        <Text style={[
          styles.subtitle,
          { color: isDark ? '#8E8E93' : '#8E8E93' }
        ]}>
          {i18n.t('onboarding.cameraPermission.subtitle')}
        </Text>

        {/* Dialog container with flex to center dialog */}
        <View style={styles.dialogWrapper}>
          {/* iOS-style Camera Permission Dialog */}
          <View style={[
            styles.dialog,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              shadowColor: isDark ? '#000000' : '#000000',
            }
          ]}>
            {/* Text Area */}
            <View style={[
              styles.textArea,
              {
                backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
              }
            ]}>
              <Text style={[
                styles.dialogText,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}>
                {i18n.t('onboarding.cameraPermission.dialogText')}
              </Text>
            </View>
            
            {/* Buttons Container */}
            <View style={[
              styles.buttonContainer,
              {
                borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA',
                borderTopWidth: 1,
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.dontAllowButton,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  }
                ]}
                onPress={handleDontAllow}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.buttonText,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}>
                  {i18n.t('onboarding.cameraPermission.dontAllow')}
                </Text>
              </TouchableOpacity>
              
              <View style={[
                styles.buttonDivider,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                }
              ]} />
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.allowButton,
                  {
                    backgroundColor: isDark ? '#FFFFFF' : '#000000',
                  }
                ]}
                onPress={handleAllowCamera}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.buttonText,
                  {
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                  }
                ]}>
                  {i18n.t('onboarding.cameraPermission.allow')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Upwards pointing finger emoji */}
          <Text style={styles.pointingEmoji}>👆</Text>
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
  subtitle: {
    fontSize: 17,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  dialogWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  textArea: {
    padding: 24,
    paddingBottom: 20,
  },
  dialogText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 44,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontAllowButton: {
    // Styled above
  },
  allowButton: {
    // Styled above
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDivider: {
    width: 1,
    height: '100%',
  },
  pointingEmoji: {
    fontSize: 40,
    marginTop: 20,
    marginLeft: '55%',
  },
}); 