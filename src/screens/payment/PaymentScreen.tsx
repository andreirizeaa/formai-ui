import { usePlacement, useSuperwallEvents } from 'expo-superwall';
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { hapticFeedback } from '../../utils/haptic';
import { usePurchases } from '../../context/PurchasesContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { AccountLoadingScreen } from '../onboarding/AccountLoadingScreen';
import { track } from '../../services/analytics';
import { getReferralCodeType, getUserReferralCode } from '../../services/referralService';
import { getUserId, setUserJustPaid } from '../../services/storageService';
import { appColors } from '../../constants/appColorScheme';

interface PaymentScreenProps {
  onComplete: () => void;
}

export function PaymentScreen({ onComplete }: PaymentScreenProps) {
  const { registerPlacement } = usePlacement();
  const { refreshCustomerInfo } = usePurchases();
  const { onboardingData } = useOnboarding();

  const [showAccountLoading, setShowAccountLoading] = useState(false);
  const [referralCodeType, setReferralCodeType] = useState<'DISCOUNT' | 'SKIP_PAYWALL' | null>(null);
  const [isReferralCodeProcessed, setIsReferralCodeProcessed] = useState(false);

  // Helper to show the correct placement
  const showPlacement = useCallback(async () => {
    if (!isReferralCodeProcessed) return;

    try {
      hapticFeedback.selection();
      const placement = referralCodeType === 'DISCOUNT' ? 'referral_trigger' : 'default_trigger';
      track('Paywall Shown', { placement });
      await registerPlacement({ placement });
    } catch (error) {
      console.error('Error showing paywall:', error);
    }
  }, [isReferralCodeProcessed, referralCodeType, registerPlacement]);

  // Listen for Superwall events
  useSuperwallEvents({
    onCustomPaywallAction: (name: string) => {
      if (name === 'hapticSelection') {
        hapticFeedback.selection();
      }
    },

    // Re-open the same placement if the paywall is dismissed
    onPaywallDismiss: (_info, result) => {
      track('Paywall Dismissed');
      // Immediately re-call the same placement
      showPlacement();
    },

    onSuperwallEvent: async (eventInfo) => {
      // Useful generic events like transactionComplete / restoreComplete / abandon
      const evt = String(eventInfo.event.event);
      if (evt === 'transactionComplete') {
        track('Purchase Completed', {
          product_id: eventInfo.params?.product_id,
          price: eventInfo.params?.price,
          currency: eventInfo.params?.currency,
        });

        await setUserJustPaid();

        setShowAccountLoading(true);
        await refreshCustomerInfo();
      }

      if (evt === 'restoreComplete') {
        track('Purchase Restored', {
          product_id: eventInfo.params?.product_id,
        });

        await setUserJustPaid();

        setShowAccountLoading(true);
        await refreshCustomerInfo();
      }

      if (evt === 'transactionAbandon') {
        track('Purchase Abandoned', {
          product_id: eventInfo.params?.abandoned_product_id,
        });
      }
    },
  });

  // Handle referral code processing on component mount
  useEffect(() => {
    const processReferralCode = async () => {
      try {
        let referralCode: string | undefined;

        // Try onboarding context first
        if (onboardingData.referralCode) {
          referralCode = onboardingData.referralCode;
        } else {
          // Fallback to user_info table
          const userId = await getUserId();
          if (userId) {
            const result = await getUserReferralCode(userId);
            if (result.referralCode) {
              referralCode = result.referralCode;
            }
          }
        }

        if (referralCode) {
          const typeResult = await getReferralCodeType(referralCode);
          if (typeResult.type) {
            setReferralCodeType(typeResult.type);

            if (typeResult.type === 'SKIP_PAYWALL') {
              // Skip paywall entirely
              onComplete();
              return;
            }
          }
        }
      } catch (error) {
        // swallow but proceed to mark processed so we still attempt default placement
      } finally {
        setIsReferralCodeProcessed(true);
      }
    };

    processReferralCode();
  }, [onboardingData.referralCode, onComplete]);

  // As soon as referral code processing is complete, show the correct placement
  useEffect(() => {
    if (isReferralCodeProcessed) {
      showPlacement();
    }
  }, [isReferralCodeProcessed, showPlacement]);

  // Show account loading screen after successful payment/restore
  if (showAccountLoading) {
    return (
      <AccountLoadingScreen
        onComplete={() => {
          setShowAccountLoading(false);
          onComplete();
        }}
      />
    );
  }

  // Blank screen: no content, just the background while paywall handles presentation
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.general.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
