import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Image, ImageBackground } from 'expo-image';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import { User, Languages, Ruler, FileText, ShieldCheck, MailPlus, UserMinus, LogOut, TvMinimalPlay, Star, FileVideoCamera } from 'lucide-react-native';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { DeleteAccountModal } from './DeleteAccountModal';
import { LogoutModal } from './LogoutModal';
import { LanguageModal } from './LanguageModal';
import { removeUserId, getUserId } from '../../../services/storageService';
import { deleteUserAccount } from '../../../services/authService';
import { useTutorialTarget, useTutorial } from '../../../context/TutorialContext';
import { usePurchases } from '../../../context/PurchasesContext';
import { usePlacement } from 'expo-superwall';
import { supabase } from '../../../lib/supabase';
import { openSupportEmail } from '../../../services/emailService';
import { showAlert } from '../../../services/alertService';
import { FormAILogo } from '../../../components/FormAILogo';

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
  const { hasHdVideos } = usePurchases();
  const [isDeleting, setIsDeleting] = useState(false);
  const iconSize = 26;
  const iconColor = '#000000';
  
  // Tutorial target registration
  const { ref: settingsFirstCardRef } = useTutorialTarget('settings_first_card');
  const { ref: settingsSupportEmailRef } = useTutorialTarget('settings_support_email');
  
  // Tutorial context
  const { start: startTutorial } = useTutorial();
  
  // Superwall placement
  const { registerPlacement } = usePlacement();

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
    await openSupportEmail();
  };

  const handleShowTutorialPress = async () => {
    hapticFeedback.selection();
    // First navigate to home screen, then start tutorial
    if ((global as any).navigateToHome) {
      (global as any).navigateToHome();
    }
    // Small delay to ensure navigation completes before starting tutorial
    setTimeout(async () => {
      await startTutorial();
    }, 300);
  };

  const handleLeaveRatingPress = async () => {
    hapticFeedback.selection();
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback: open app store page
        await StoreReview.requestReview();
      }
    } catch (error) {
      console.error('Error requesting review:', error);
      // Still try to open the store as fallback
      try {
        await StoreReview.requestReview();
      } catch (fallbackError) {
        console.error('Fallback review request failed:', fallbackError);
      }
    }
  };

  const handleHdVideoPress = async () => {
    try {
      await registerPlacement({
        placement: 'hd_video_trigger',
      });
    } catch (error) {
      console.error('Error showing HD video paywall:', error);
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

        {/* Second Card - Video Quality (only show if user doesn't have HD videos) */}
        {!hasHdVideos && (
          <View style={styles.card}>
            <SettingsOption
              icon={<FileVideoCamera size={iconSize} color={iconColor} />}
              title={i18n.t('settings.whyLowQualityVideos')}
              onPress={handleHdVideoPress}
            />
          </View>
        )}

        {/* Third Card */}
        {/* <View style={styles.card}>
          <MemoizedReferFriendOption
            icon={<ReferFriendIcon width={iconSize} height={iconSize} color={iconColor} />}
            title={i18n.t('settings.referFriends')}
            onPress={handleReferFriendPress}
            onSharePress={handleSharePress}
          />
        </View> */}

        {/* Fourth Card */}
        <View style={styles.card}>
          <SettingsOption
            ref={settingsSupportEmailRef}
            icon={<MailPlus size={iconSize} color={iconColor} />}
            title={i18n.t('settings.supportEmail')}
            onPress={handleSupportEmailPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<TvMinimalPlay size={iconSize} color={iconColor} />}
            title={i18n.t('settings.replayTutorial')}
            onPress={handleShowTutorialPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<Star size={iconSize} color={iconColor} />}
            title={i18n.t('settings.leaveRating')}
            onPress={handleLeaveRatingPress}
          />
          <View style={styles.separator} />
          <SettingsOption
            icon={<UserMinus size={iconSize} color={iconColor} />}
            title={i18n.t('settings.deleteAccount')}
            onPress={handleDeleteAccountPress}
          />
        </View>

        {/* Fifth Card - Legal */}
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
        </View>

        {/* Sixth Card - Logout */}
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
      <View style={styles.footerCard}>
        <FormAILogo 
          iconSize={32}
          containerStyle={styles.footerLogoContainer}
          textStyle={styles.footerLogoText}
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
    fontWeight: '800',
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
    fontSize: 17,
    fontWeight: '700',
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
  footerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  footer: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  footerLogoContainer: {
    marginBottom: 0,
  },
  footerLogoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 0,
  },
  versionText: {
    marginTop: 4,
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    fontWeight: '400',
  },
}); 
