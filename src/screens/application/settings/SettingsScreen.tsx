import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ImageBackground, ScrollView, Animated, Image } from 'react-native';
import showAlert from '../../../services/alertService';
import * as MailComposer from 'expo-mail-composer';
import Constants from 'expo-constants';
import { User, Languages, Ruler, FileText, ShieldCheck, MailPlus, UserMinus, LogOut } from 'lucide-react-native';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { DeleteAccountModal } from './DeleteAccountModal';
import { LogoutModal } from './LogoutModal';
import { LanguageModal } from './LanguageModal';
import { removeUserId, getUserId } from '../../../services/storageService';
import { deleteUserAccount } from '../../../services/authService';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { supabase } from '../../../lib/supabase';

interface SettingsScreenProps {
  onPersonalDetailsPress: () => void;
  onUnitsPress: () => void;
  onSharePress: () => void;
  onLogout?: () => void;
}

interface SettingsOptionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  ref?: any;
}

function SettingsOption({ icon, title, subtitle, onPress, ref }: SettingsOptionProps) {
  return (
    <TouchableOpacity 
      ref={ref}
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

  // Pump animation on mount - only run once
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

    // Cleanup function to stop animation if component unmounts
    return () => {
      pumpAnimation.stop();
    };
  }, []); // Empty dependency array - only run once

  // Memoize the animated view to prevent unnecessary re-renders
  const animatedView = useMemo(() => (
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
  ), [scaleAnim, onSharePress]);

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
      {animatedView}
    </View>
  );
}

export function SettingsScreen({ onPersonalDetailsPress, onUnitsPress, onSharePress, onLogout }: SettingsScreenProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const iconSize = 26;
  const iconColor = '#000000';
  const [userId, setUserId] = useState<string | null>(null);
  
  // Tutorial target registration
  const { ref: settingsFirstCardRef } = useTutorialTarget('settings_first_card');
  const { ref: settingsSupportEmailRef } = useTutorialTarget('settings_support_email');

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setUserId(userId);
    };
    fetchUserId();
  }, []);

  const handleDeleteAccountPress = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return; // prevent closing while deleting
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      hapticFeedback.selection();
      setIsDeleting(true);
      const userId = await getUserId();
      if (!userId) {
        setIsDeleting(false);
        hapticFeedback.error();
        return;
      }

      const res = await deleteUserAccount(userId);
      if (!res?.success) throw new Error(res?.message || 'Delete failed');
      await supabase.auth.signOut();
      await removeUserId();
      setShowDeleteModal(false);
      if (onLogout) onLogout();
    } catch (e: any) {
      showAlert('Delete failed', 'Please try again later', () => {
        hapticFeedback.selection();
        handleCloseDeleteModal();
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
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

  const handlePersonalDetailsPress = () => {
    onPersonalDetailsPress();
  };

  const handleSupportEmailPress = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        showAlert('Email Not Available', 'No email app is available on this device.');
        return;
      }

      await MailComposer.composeAsync({
        recipients: ['support@formai.com'],
        subject: 'FormAI Support Request',
        body: `Hello FormAI Support Team,


        



              Meta data (Please do not remove this as it will help us identify your account)

              - Platform: ${Platform.OS}
              - Device Version: ${Platform.Version}
              - User ID: ${userId}
          `,
      });
    } catch (error) {
      console.error('Error opening email composer:', error);
      showAlert('Error', 'Failed to open email composer. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>{i18n.t('tabs.settings')}</Text>
        
        {/* First Card */}
        <View style={styles.card} ref={settingsFirstCardRef}>
          <SettingsOption
            icon={<User size={iconSize} color={iconColor} />}
            title={i18n.t('settings.personalDetails')}
            onPress={handlePersonalDetailsPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<Languages size={iconSize} color={iconColor} />}
            title={i18n.t('settings.language')}
            onPress={handleLanguagePress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<Ruler size={iconSize} color={iconColor} />}
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
        {/* <View style={styles.card}>
          <MemoizedReferFriendOption
            icon={<ReferFriendIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.referFriends')}
            onPress={handleReferFriendPress}
            onSharePress={handleSharePress}
          />
        </View> */}

        {/* Third Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={<FileText size={iconSize} color={iconColor} />}
            title={i18n.t('settings.termsAndConditions')}
            onPress={() => {}}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<ShieldCheck size={iconSize} color={iconColor} />}
            title={i18n.t('settings.privacyPolicy')}
            onPress={() => {}}
          />
          <View style={styles.separator} />
          <SettingsOption
            ref={settingsSupportEmailRef}
            icon={<MailPlus size={iconSize} color={iconColor} />}
            title={i18n.t('settings.supportEmail')}
            onPress={handleSupportEmailPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<UserMinus size={iconSize} color={iconColor} />}
            title={i18n.t('settings.deleteAccount')}
            onPress={handleDeleteAccountPress}
          />
        </View>

        {/* Forth Card */}
        <View style={styles.card}>
          <SettingsOption
            icon={<LogOut size={iconSize} color={iconColor} />}
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
    marginBottom: -30,
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
    shadowOpacity: 0.2,
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
    marginTop: -30,
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
    marginTop: -36,
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    fontWeight: '400',
  },
}); 
