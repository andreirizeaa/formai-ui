import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import * as Notifications from 'expo-notifications';

interface NotificationPermissionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function NotificationPermissionScreen({ onNext, onBack }: NotificationPermissionScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAllowNotifications = async () => {
    hapticFeedback.selection();
    try {
      await Notifications.requestPermissionsAsync();
      onNext();
    } catch (error) {
      onNext();
    }
  };

  const handleDontAllow = async () => {
    hapticFeedback.selection();
    try {
      await Notifications.requestPermissionsAsync();
      onNext();
    } catch (error) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('notificationPermission.title')}
      subtitle=""
      currentStep={14}
      totalSteps={16}
      onBack={onBack}
      onNext={() => {}} // No next button, handled by dialog buttons
      nextTitle=""
      nextDisabled={true}
      hideNextButton={true}
    >
      <View style={styles.container}>
        {/* iOS-style Notification Permission Dialog */}
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
              {i18n.t('notificationPermission.dialogText')}
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
                {i18n.t('notificationPermission.dontAllow')}
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
              onPress={handleAllowNotifications}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                {
                  color: isDark ? '#000000' : '#FFFFFF',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}>
                {i18n.t('notificationPermission.allow')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Upwards pointing finger emoji */}
        <Text style={styles.pointingEmoji}>👆</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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