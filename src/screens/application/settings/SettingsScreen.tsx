import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert, ImageBackground, ScrollView, Animated, Image } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import Constants from 'expo-constants';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { DeleteAccountModal } from './DeleteAccountModal';
import { LogoutModal } from './LogoutModal';
import { LanguageModal } from './LanguageModal';
import {
  PersonIcon,
  LanguageIcon,
  UnitsIcon,
  ReferFriendIcon,
  AppearanceIcon,
  TermsIcon,
  PrivacyIcon,
  EmailIcon,
  DeleteAccountIcon,
  LogoutIcon,
} from '../../../components/icons/icons';

interface SettingsScreenProps {
  onPersonalDetailsPress: () => void;
  onUnitsPress: () => void;
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

export function SettingsScreen({ onPersonalDetailsPress, onUnitsPress, onSharePress }: SettingsScreenProps) {
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

  const handleUnitsPress = () => {
    onUnitsPress();
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>{i18n.t('tabs.settings')}</Text>
        
        {/* First Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={<PersonIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.personalDetails')}
            onPress={handlePersonalDetailsPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<LanguageIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.language')}
            onPress={handleLanguagePress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<UnitsIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.units')}
            onPress={handleUnitsPress}
          />
          {/* <View style={styles.separator} /> */}
          {/* <SettingsOption
            icon={<AppearanceIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.appTheme')}
            onPress={() => {}}
          /> */}
        </View>

        {/* Second Card */}
        <View style={styles.card}>
          <ReferFriendOption
            icon={<ReferFriendIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.referFriends')}
            onPress={handleReferFriendPress}
            onSharePress={onSharePress}
          />
        </View>

        {/* Third Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={<TermsIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.termsAndConditions')}
            onPress={() => {}}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<PrivacyIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.privacyPolicy')}
            onPress={() => {}}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<EmailIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.supportEmail')}
            onPress={handleSupportEmailPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<DeleteAccountIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.deleteAccount')}
            onPress={handleDeleteAccountPress}
          />
        </View>

        {/* Forth Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={<LogoutIcon width={iconSize} height={iconSize} color={iconColor} />}
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
      
      {/* Footer with FormAI Logo and Version */}
      <View style={styles.footer}>
        <Image 
          source={require('../../../../assets/formai-light-icon.png')} 
          style={styles.footerLogo}
          resizeMode="contain"
        />
        <Text style={styles.versionText}>
          Version {Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    marginBottom: -24,
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
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerLogo: {
    width: 100,
    height: 100,
  },
  versionText: {
    marginTop: -26,
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    fontWeight: '400',
  },
}); 