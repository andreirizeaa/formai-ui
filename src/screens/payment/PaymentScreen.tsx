import { usePlacement, useSuperwallEvents } from 'expo-superwall';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { Image } from 'expo-image';
import { hapticFeedback } from '../../utils/haptic';
import { usePurchases } from '../../context/PurchasesContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { AccountLoadingScreen } from '../onboarding/AccountLoadingScreen';
import { track } from '../../services/analytics';
import { getReferralCodeType, getUserReferralCode } from '../../services/referralService';
import { getUserId, setUserJustPaid } from '../../services/storageService';
import { appColors } from '../../constants/appColorScheme';
import i18n from '../../utils/i18n';

interface PaymentScreenProps {
  onComplete: () => void;
}

export function PaymentScreen({ onComplete }: PaymentScreenProps) {
  const { registerPlacement } = usePlacement();
  const { customerInfo, refreshCustomerInfo } = usePurchases();
  const { onboardingData } = useOnboarding();
  const [ showAccountLoading, setShowAccountLoading ] = useState(false);
  const [ referralCodeType, setReferralCodeType ] = useState<'DISCOUNT' | 'SKIP_PAYWALL' | null>(null);
  const [ isReferralCodeProcessed, setIsReferralCodeProcessed ] = useState(false);
  const [ isButtonLoading, setIsButtonLoading ] = useState(false);

  // Listen for Superwall events
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
      if (String(eventInfo.event.event) === "transactionAbandon") {
        // Track purchase abandonment
        track("Purchase Abandoned", {
          product_id: eventInfo.params.abandoned_product_id,
        });
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
            }
            // For DISCOUNT type, just set the type - placement will be shown on button click
          }
        }

        setIsReferralCodeProcessed(true);
      } catch (error) {

        setIsReferralCodeProcessed(true);
      }
    };

    processReferralCode();
  }, [onboardingData.referralCode, onComplete]);

  // Button click handler to show paywall
  async function handleShowPaywall() {
    if (!isReferralCodeProcessed) return;
    
    hapticFeedback.selection();
    setIsButtonLoading(true);

    try {
      // Determine which placement to show
      const placement = referralCodeType === 'DISCOUNT' ? 'referral_trigger' : 'default_trigger';
      
      // Track paywall shown
      track("Paywall Shown", { placement });

      await registerPlacement({
        placement,
      });
    } catch (error) {
      console.error('Error showing paywall:', error);
    } finally {
      setIsButtonLoading(false);
    }
  }



  // Show account loading screen after successful payment
  if (showAccountLoading) {
    return <AccountLoadingScreen onComplete={() => {
      setShowAccountLoading(false);
      onComplete();
    }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Icon in white container with shadow */}
        <View style={styles.iconCard}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../../assets/appIcons/formai-ios-icon.png')}
              style={styles.appIcon}
              contentFit="cover"
            />
          </View>
        </View>
        
        {/* Title */}
        <Text style={styles.paymentTitle}>{i18n.t('neverInjureYourselfAgain')}</Text>
        
        {/* Payment Screen Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../assets/formai-payment-screen.png')}
            style={styles.paymentImage}
            contentFit="contain"
            priority="high"
          />
        </View>
      </View>
      
      {/* Bottom button - styled like NextButton */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.button,
            (!isReferralCodeProcessed || isButtonLoading) && styles.buttonDisabled
          ]}
          onPress={handleShowPaywall}
          disabled={!isReferralCodeProcessed || isButtonLoading}
          activeOpacity={0.8}
        >
          {isButtonLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{i18n.t('trainSaferForFree')}</Text>
          )}
        </TouchableOpacity>
        
        {/* No commitment text */}
        <Text style={styles.noCommitmentText}>{i18n.t('noCommitmentCancelAnytime')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.general.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  iconCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    borderRadius: 18,
    padding: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 60,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    color: appColors.general.title,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 70,
    height: 70,
    borderRadius: 70 * 0.22,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  paymentImage: {
    width: '100%',
    height: 400,
    maxWidth: 400,
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#000000',
    borderRadius: 28,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  noCommitmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 40,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});