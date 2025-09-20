import { usePlacement, useSuperwall, useSuperwallEvents } from 'expo-superwall';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../utils/haptic';
import { usePurchases } from '../../context/PurchasesContext';
import { AccountLoadingScreen } from '../onboarding/AccountLoadingScreen';
import { track } from '../../services/analytics';

interface PaymentScreenProps {
  onComplete: () => void;
}

export function PaymentScreen({ onComplete }: PaymentScreenProps) {
  const { registerPlacement } = usePlacement();
  const { dismiss } = useSuperwall();
  const { customerInfo, refreshCustomerInfo } = usePurchases();
  const [ hasSeenDiscountPaywall, setHasSeenDiscountPaywall ] = useState(false);
  const [ showAccountLoading, setShowAccountLoading ] = useState(false);

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

        // Always show loading screen on transaction complete, regardless of customerInfo state
        setShowAccountLoading(true);
        // Refresh customer info in the background
        await refreshCustomerInfo();
        // After refreshing, wait 2 seconds then trigger completion
        setTimeout(() => {
          setShowAccountLoading(false);
          onComplete();
        }, 2000);
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

  React.useEffect(() => {
    const handleTriggerPlacement = async () => {
      // Track paywall shown
      track("Paywall Shown", { placement: "default_trigger" });

      // Add a small delay to ensure event listeners are properly set up
      setTimeout(async () => {
        await registerPlacement({
          placement: "default_trigger",
        });
      }, 100);
    };
    handleTriggerPlacement();
  }, []);



  // Show account loading screen after successful payment
  if (showAccountLoading) {
    return <AccountLoadingScreen onComplete={() => {}} />;
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
