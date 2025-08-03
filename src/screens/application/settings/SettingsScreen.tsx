import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert, ImageBackground, ScrollView, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as MailComposer from 'expo-mail-composer';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { DeleteAccountModal } from './DeleteAccountModal';
import { LogoutModal } from './LogoutModal';
import { LanguageModal } from './LanguageModal';

interface SettingsScreenProps {
  onPersonalDetailsPress: () => void;
  onSharePress: () => void;
}

interface SettingsOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

function SettingsOption({ icon, title, subtitle, onPress }: SettingsOptionProps) {
  return (
    <TouchableOpacity 
      style={styles.optionRow} 
      onPress={() => {
        hapticFeedback.selection();
        onPress?.();
      }} 
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
}

interface ReferFriendOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onSharePress: () => void;
}

function ReferFriendOption({ icon, title, subtitle, onPress, onSharePress }: ReferFriendOptionProps) {
  // Animation value for pump effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pump animation on mount
  useEffect(() => {
    const pumpAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 } // Repeat 4 times
    );

    // Start animation immediately
    pumpAnimation.start();
  }, []);

  return (
    <View>
      <View style={styles.optionRow}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {/* Nested Card */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <ImageBackground 
          source={require('../../../../assets/refer-friends.jpg')}
          style={styles.nestedCard}
          imageStyle={styles.nestedCardImage}
        >
          <View style={styles.opacityLayer}>
            <Text style={styles.nestedCardTitle}>{i18n.t('settings.growStrongerTogether')}</Text>
            <Text style={styles.nestedCardSubtitle}>{i18n.t('settings.currentBalance')}</Text>
            <Text style={styles.balanceAmount}>$0</Text>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => {
                hapticFeedback.selection();
                onSharePress();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.shareButtonText}>{i18n.t('settings.shareNow')}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

export function SettingsScreen({ onPersonalDetailsPress, onSharePress }: SettingsScreenProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const iconSize = 26;
  const iconColor = '#000000';

  const handleDeleteAccountPress = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteAccount = () => {
    // TODO: Implement actual account deletion logic
    console.log('Account deletion confirmed');
    setShowDeleteModal(false);
    // Here you would typically call an API to delete the account
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Logout confirmed');
    setShowLogoutModal(false);
    // Here you would typically:
    // 1. Clear user session/tokens
    // 2. Clear local storage
    // 3. Navigate to login screen
    // 4. Reset app state
  };

  const handleLanguagePress = () => {
    setShowLanguageModal(true);
  };

  const handleCloseLanguageModal = () => {
    setShowLanguageModal(false);
  };

  const handleReferFriendPress = () => {
  };

  const handlePersonalDetailsPress = () => {
    onPersonalDetailsPress();
  };

  const handleSupportEmailPress = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Email Not Available',
          'No email app is available on this device.',
          [{ text: 'OK' }]
        );
        return;
      }

      await MailComposer.composeAsync({
        recipients: ['support@formai.com'],
        subject: 'FormAI Support Request',
        body: `Hello FormAI Support Team,

I'm reaching out for assistance with the FormAI app.

Issue Description:
[Please describe your issue here]

Device Information:
- Platform: ${Platform.OS}
- Version: ${Platform.Version}

Thank you for your help!

Best regards,
[Your name]`,
      });
    } catch (error) {
      console.error('Error opening email composer:', error);
      Alert.alert(
        'Error',
        'Failed to open email composer. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const icons = {
    personal: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    language: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    referFriend: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    appearance: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    terms: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    privacy: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    email: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    delete: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
    logout: (
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          stroke={iconColor}
          strokeWidth={1.5}
        />
      </Svg>
    ),
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>{i18n.t('tabs.settings')}</Text>
        
        {/* First Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={icons.personal}
            title={i18n.t('settings.personalDetails')}
            onPress={handlePersonalDetailsPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={icons.language}
            title={i18n.t('settings.language')}
            onPress={handleLanguagePress}
          />
          {/* <View style={styles.separator} /> */}
          {/* <SettingsOption
            icon={icons.appearance}
            title={i18n.t('settings.appTheme')}
            onPress={() => {}}
          /> */}
        </View>

        {/* Second Card */}
        <View style={styles.card}>
          <ReferFriendOption
            icon={icons.referFriend}
            title={i18n.t('settings.referFriends')}
            onPress={handleReferFriendPress}
            onSharePress={onSharePress}
          />
        </View>

        {/* Third Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={icons.terms}
            title={i18n.t('settings.termsAndConditions')}
            onPress={() => {}}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={icons.privacy}
            title={i18n.t('settings.privacyPolicy')}
            onPress={() => {}}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={icons.email}
            title={i18n.t('settings.supportEmail')}
            onPress={handleSupportEmailPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={icons.delete}
            title={i18n.t('settings.deleteAccount')}
            onPress={handleDeleteAccountPress}
          />
        </View>

        {/* Forth Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={icons.logout}
            title={i18n.t('settings.logout')}
            onPress={handleLogoutPress}
          />
        </View>
      </View>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isVisible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteAccount}
      />

      {/* Logout Modal */}
      <LogoutModal
        isVisible={showLogoutModal}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
      />

      {/* Language Modal */}
      <LanguageModal
        isVisible={showLanguageModal}
        onClose={handleCloseLanguageModal}
      />

      {/* Personal Details Screen */}
      {/* This component is now rendered by the parent based on the onPersonalDetailsPress prop */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  optionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  nestedCard: {
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nestedCardImage: {
    borderRadius: 12,
    top: -20,
  },
  opacityLayer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  nestedCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 4,
    textAlign: 'left',
  },
  nestedCardSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 4,
    textAlign: 'left',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 8,
    textAlign: 'left',
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    width: '100%',
  },
  shareButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
}); 