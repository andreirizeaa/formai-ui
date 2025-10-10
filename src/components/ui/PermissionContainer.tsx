import React from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, StyleSheet } from 'react-native';
import { hapticFeedback } from '../../utils/haptic';
import i18n from '../../utils/i18n';
import { appColors } from '../../constants/appColorScheme';

interface PermissionContainerProps {
  title: string;
  dialogText: string;
  onAllow: () => void;
  onDontAllow: () => void;
  fingerTranslateY: Animated.Value;
  allowButtonText?: string;
  dontAllowButtonText?: string;
  disableDontAllowButton?: boolean;
}

export function PermissionContainer({
  title,
  dialogText,
  onAllow,
  onDontAllow,
  fingerTranslateY,
  allowButtonText,
  dontAllowButtonText,
  disableDontAllowButton = false,
}: PermissionContainerProps) {
  return (
    <View style={styles.permissionContainer}>
      {/* Dialog container with flex to center dialog */}
      <View style={styles.dialogWrapper}>
        {/* Title above the dialog */}
        <Text style={[
          styles.permissionTitle,
          { color: appColors.onboarding.permission.title }
        ]}>
          {title}
        </Text>
        {/* iOS-style Permission Dialog */}
        <View style={[
          styles.dialog,
          {
            backgroundColor: appColors.onboarding.permission.dialog.background,
            shadowColor: appColors.onboarding.permission.dialog.shadow,
          }
        ]}>
          {/* Text Area */}
          <View style={[
            styles.textArea,
            {
              backgroundColor: appColors.onboarding.permission.textArea.background,
            }
          ]}>
            <Text style={[
              styles.dialogText,
              {
                color: appColors.onboarding.permission.textArea.text,
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
              }
            ]}>
              {dialogText}
            </Text>
          </View>

          {/* Buttons Container */}
          <View style={[
            styles.buttonContainer,
            {
              borderTopColor: appColors.onboarding.permission.buttonContainer.border,
              borderTopWidth: 1,
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.dontAllowButton,
                {
                  backgroundColor: appColors.onboarding.permission.button.dontAllow.background,
                }
              ]}
              onPress={disableDontAllowButton ? undefined : () => {
                hapticFeedback.selection();
                onDontAllow();
              }}
              activeOpacity={0.7}
              disabled={disableDontAllowButton}
            >
              <Text style={[
                styles.buttonText,
                {
                  color: appColors.onboarding.permission.button.dontAllow.text,
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}>
                {dontAllowButtonText || i18n.t('onboarding.notificationPermission.dontAllow')}
              </Text>
            </TouchableOpacity>

            <View style={[
              styles.buttonDivider,
              {
                backgroundColor: appColors.onboarding.permission.button.divider,
              }
            ]} />

            <TouchableOpacity
              style={[
                styles.button,
                styles.allowButton,
                {
                  backgroundColor: appColors.onboarding.permission.button.allow.background,
                }
              ]}
              onPress={() => {
                hapticFeedback.selection();
                onAllow();
              }}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                {
                  color: appColors.onboarding.permission.button.allow.text,
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}>
                {allowButtonText || i18n.t('onboarding.notificationPermission.allow')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Animated upwards pointing finger emoji */}
        <Animated.View style={[
          styles.animatedFingerContainer,
          {
            transform: [{ translateY: fingerTranslateY }]
          }
        ]}>
          <Text style={styles.pointingEmoji}>👆</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 40,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    pointerEvents: 'auto',
  },
  textArea: {
    padding: 24,
    paddingBottom: 20,
    height: 100,
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
    zIndex: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  dontAllowButton: {},
  allowButton: {},
  buttonDivider: {
    width: 1,
    height: '100%',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  animatedFingerContainer: {
    marginTop: 20,
    marginLeft: '53%',
    pointerEvents: 'none',
  },
  pointingEmoji: {
    fontSize: 40,
  },
});