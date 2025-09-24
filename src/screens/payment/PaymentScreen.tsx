import { usePlacement, useSuperwall, useSuperwallEvents } from 'expo-superwall';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../utils/haptic';
import { usePurchases } from '../../context/PurchasesContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { AccountLoadingScreen } from '../onboarding/AccountLoadingScreen';
import { track } from '../../services/analytics';
import { getReferralCodeType, getUserReferralCode } from '../../services/referralService';
import { getUserId, setUserJustPaid } from '../../services/storageService';

interface PaymentScreenProps {
  onComplete: () => void;
}

export function PaymentScreen({ onComplete }: PaymentScreenProps) {
  const { registerPlacement } = usePlacement();
  const { dismiss } = useSuperwall();
  const { customerInfo, refreshCustomerInfo } = usePurchases();
  const { onboardingData } = useOnboarding();
  const [ hasSeenDiscountPaywall, setHasSeenDiscountPaywall ] = useState(false);
  const [ showAccountLoading, setShowAccountLoading ] = useState(false);
  const [ referralCodeType, setReferralCodeType ] = useState<'DISCOUNT' | 'SKIP_PAYWALL' | null>(null);
  const [ isReferralCodeProcessed, setIsReferralCodeProcessed ] = useState(false);

  // Listen for transactionAbandon events to show discount paywall
  useSuperwallEvents({
    onCustomPaywallAction: (name: string) => {
      if (name === "hapticSelection") {
        hapticFeedback.selection();
      }
    },
    onSuperwallEvent: async (eventInfo) => {
      if (String(eventInfo.event.event) === "transactionComplete") {
        // Track purchase completion
        track("Purchase Completed", {
          product_id: eventInfo.params?.product_id,
          price: eventInfo.params?.price,
          currency: eventInfo.params?.currency,
        });

        // Set flag that user just completed payment for tutorial failsafe
        await setUserJustPaid();

        // Always show loading screen on transaction complete, regardless of customerInfo state
        setShowAccountLoading(true);
        // Refresh customer info in the background
        await refreshCustomerInfo();
        // Let AccountLoadingScreen handle its own timing - don't set timeout here
      }
      if (String(eventInfo.event.event) === "transactionAbandon" && String(eventInfo.params.abandoned_product_id) === "formai_yearly") {
        // Track purchase abandonment
        track("Purchase Abandoned", {
          product_id: eventInfo.params.abandoned_product_id,
        });

        // Dismiss the current paywall first
        dismiss();
        
        setTimeout(async() => {
          if (customerInfo?.activeSubscriptions?.length === 0 && !hasSeenDiscountPaywall) {
            await registerPlacement({
              placement: "discount_trigger",
            });
            setHasSeenDiscountPaywall(true)
          } else if (customerInfo?.activeSubscriptions?.length === 0 && hasSeenDiscountPaywall) {
            await registerPlacement({
              placement: "default_trigger",
            });
          }
        }, 500);
      }
    },
    onPaywallDismiss: async(info, result) => {
      // Handle referral trigger dismiss - re-show referral trigger if user closes it
      if (referralCodeType === 'DISCOUNT' && String(info.closeReason) === "manualClose") {
        await registerPlacement({
          placement: "referral_trigger",
        });
        return;
      }

      // Also try to show discount paywall on dismiss
      if (String(info.identifier) === "discount-offer-template-a792-2025-08-26" && String(info.closeReason) === "manualClose") {
        await registerPlacement({
          placement: "default_trigger",
        });
      } else {
        if (customerInfo?.activeSubscriptions?.length === 0 && !hasSeenDiscountPaywall) {
          await registerPlacement({
            placement: "discount_trigger",
          });
          setHasSeenDiscountPaywall(true)
        } else if (customerInfo?.activeSubscriptions?.length === 0 && hasSeenDiscountPaywall) {
          await registerPlacement({
            placement: "default_trigger",
          });
        }
      }
    },
  });

  // Handle referral code processing on component mount
  useEffect(() => {
    const processReferralCode = async () => {
      try {
        let referralCode: string | undefined;

        // First try to get referral code from onboarding context
        if (onboardingData.referralCode) {
          referralCode = onboardingData.referralCode;
        } else {
          // If not in context, try to get from user_info table
          const userId = await getUserId();
          if (userId) {
            const result = await getUserReferralCode(userId);
            if (result.referralCode) {
              referralCode = result.referralCode;
            }
          }
        }

        if (referralCode) {
          // Get the referral code type
          const typeResult = await getReferralCodeType(referralCode);
          if (typeResult.type) {
            setReferralCodeType(typeResult.type);
            
            if (typeResult.type === 'SKIP_PAYWALL') {
              // Skip paywall entirely
              onComplete();
              return;
            } else if (typeResult.type === 'DISCOUNT') {
              await registerPlacement({
                placement: "referral_trigger",
              });
          }
          }
        }

        setIsReferralCodeProcessed(true);
      } catch (error) {
        setIsReferralCodeProcessed(true);
      }
    };

    processReferralCode();
  }, [onboardingData.referralCode, onComplete]);

  React.useEffect(() => {
    const handleTriggerPlacement = async () => {
      // Wait for referral code processing to complete
      if (!isReferralCodeProcessed) return;

      // Determine which placement to show
      const placement = referralCodeType === 'DISCOUNT' ? 'referral_trigger' : 'default_trigger';
      
      // Track paywall shown
      track("Paywall Shown", { placement });

      // Add a small delay to ensure event listeners are properly set up
      setTimeout(async () => {
        await registerPlacement({
          placement,
        });
      }, 100);
    };
    handleTriggerPlacement();
  }, [isReferralCodeProcessed, referralCodeType]);



  // Show account loading screen after successful payment
  if (showAccountLoading) {
    return <AccountLoadingScreen onComplete={() => {
      setShowAccountLoading(false);
      onComplete();
    }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d293d',
  },
  content: {
    flex: 1,
  },
}); 

function identify(arg0: {
  userId: string;
  // Add any other properties that might be needed for audience matching
  properties: { isNewUser: boolean; hasCompletedOnboarding: boolean; };
}) {
  throw new Error('Function not implemented.');
}
