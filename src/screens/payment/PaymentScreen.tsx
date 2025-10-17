import { SuperwallExpoModule, usePlacement, useSuperwallEvents } from 'expo-superwall';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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

type PlacementKey = 'default_trigger' | 'referral_trigger' | 'transaction_abandons';

export function PaymentScreen({ onComplete }: PaymentScreenProps) {
  const { registerPlacement } = usePlacement();
  const { refreshCustomerInfo } = usePurchases();
  const { onboardingData } = useOnboarding();

  const [showAccountLoading, setShowAccountLoading] = useState(false);
  const [referralCodeType, setReferralCodeType] = useState<'DISCOUNT' | 'SKIP_PAYWALL' | null>(null);
  const [isReferralCodeProcessed, setIsReferralCodeProcessed] = useState(false);

  // Prevent loops: ignore the next paywall dismiss that we know we triggered ourselves
  const ignoreNextDismissRef = useRef(false);
  const lastPlacementRef = useRef<PlacementKey | null>(null);

  const showPlacement = useCallback(
    async (override?: PlacementKey) => {
      if (!isReferralCodeProcessed && !override) return;

      try {
        hapticFeedback.selection();
        const computed: PlacementKey =
          referralCodeType === 'DISCOUNT' ? 'referral_trigger' : 'default_trigger';
        const placement = override ?? computed;

        // Optionally avoid immediate re-opens of the same placement
        // if (lastPlacementRef.current === placement) return;

        track('Paywall Shown', { placement });
        await registerPlacement({ placement });
        lastPlacementRef.current = placement;
      } catch (error) {
        console.error('Error showing paywall:', error);
      }
    },
    [isReferralCodeProcessed, referralCodeType, registerPlacement]
  );

  useSuperwallEvents({
    onCustomPaywallAction: (name: string) => {
      if (name === 'hapticSelection') hapticFeedback.selection();
    },

    onPaywallDismiss: () => {
      // If we dismissed programmatically (e.g., in abandon flow), skip this one
      if (ignoreNextDismissRef.current) {
        ignoreNextDismissRef.current = false;
        return;
      }
      track('Paywall Dismissed');
      showPlacement(); // normal re-open logic
    },

    onSuperwallEvent: async (eventInfo) => {
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

        // We’re about to call dismiss() ourselves — ignore the next dismiss callback
        ignoreNextDismissRef.current = true;

        try {
          await SuperwallExpoModule.dismiss();
        } catch {
          // even if dismiss fails, try to show the abandon placement
        }

        // Now explicitly show the transaction_abandons placement
        await showPlacement('transaction_abandons');
      }
    },
  });

  useEffect(() => {
    const processReferralCode = async () => {
      try {
        let referralCode: string | undefined;

        if (onboardingData.referralCode) {
          referralCode = onboardingData.referralCode;
        } else {
          const userId = await getUserId();
          if (userId) {
            const result = await getUserReferralCode(userId);
            if (result.referralCode) referralCode = result.referralCode;
          }
        }

        if (referralCode) {
          const typeResult = await getReferralCodeType(referralCode);
          if (typeResult.type) {
            setReferralCodeType(typeResult.type);
            if (typeResult.type === 'SKIP_PAYWALL') {
              onComplete();
              return;
            }
          }
        }
      } catch {
        // continue to default placement
      } finally {
        setIsReferralCodeProcessed(true);
      }
    };

    processReferralCode();
  }, [onboardingData.referralCode, onComplete]);

  useEffect(() => {
    if (isReferralCodeProcessed) showPlacement();
  }, [isReferralCodeProcessed, showPlacement]);

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

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
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
