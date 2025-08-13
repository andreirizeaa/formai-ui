import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../../components/ui/BackButton';
import { TrendingUpwardsIcon, CheckmarkSmallIcon, UnlockIcon, BellIcon } from '../../components/icons/icons';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { useOnboarding } from '../../context/OnboardingContext';
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

interface SubscriptionSelectionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function SubscriptionSelectionScreen({ onNext, onBack }: SubscriptionSelectionScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedPlan, setSelectedPlan] = useState<PurchasesPackage | null>(null);
  const { preferences, updatePreference, getOnboardingDataForAPI } = useOnboarding();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  useEffect(() => {
    getRevenueCatOfferings();
  }, []);

  // Calculate billing date (today + 3 days)
  const getBillingDate = () => {
    const today = new Date();
    const billingDate = new Date(today);
    billingDate.setDate(today.getDate() + 3);
    
    // Format as "Mar 9, 2025" style
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return billingDate.toLocaleDateString('en-US', options);
  };

  const billingDate = getBillingDate();

  // Handle payment completion and log user data
  const handlePaymentComplete = async () => {
    if (selectedPlan) {
      try {
        const {customerInfo} = await Purchases.purchasePackage(selectedPlan);
        if (
          typeof customerInfo.entitlements.active[selectedPlan.identifier] !== 'undefined'
        ) {
          // Purchase successful - update subscription preferences
          const subscriptionType = selectedPlan.packageType === 'ANNUAL' ? 'yearly' : 'monthly';
          const now = new Date();
          
          // Set subscription preferences
          updatePreference('subscriptionPlan', subscriptionType);
          updatePreference('subscriptionCost', selectedPlan.product.price);
          updatePreference('subscriptionActive', true);
          updatePreference('subscriptionStartDate', now.toISOString());
          
          // Calculate renewal date
          const renewalDate = new Date(now);
          if (subscriptionType === 'yearly') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
            // For yearly plans, set free trial info if it's a 3-day trial
            updatePreference('freeTrialActive', true);
            updatePreference('freeTrialStartDate', now.toISOString());
            const trialEndDate = new Date(now);
            trialEndDate.setDate(trialEndDate.getDate() + 3);
            updatePreference('freeTrialEndDate', trialEndDate.toISOString());
          } else {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
            // Monthly plans don't have free trials
            updatePreference('freeTrialActive', false);
            updatePreference('freeTrialStartDate', null);
            updatePreference('freeTrialEndDate', null);
          }
          updatePreference('subscriptionRenewalDate', renewalDate.toISOString());
          
          console.log('Purchase successful, subscription preferences updated');
          onNext();
        } else {
          // Purchase failed or entitlement not found
          console.error('Purchase completed but entitlement not found');
          onNext(); // Still proceed with onboarding
        }
      } catch (error) {
        console.error('Error purchasing package:', error);
        onNext(); // Proceed with onboarding even if purchase fails
      }
    } else {
      // No package selected, just proceed
      onNext();
    }
  };

  const getRevenueCatOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        setPackages(offerings.current.availablePackages);
        // Set default selection to yearly if available, otherwise first package
        const yearlyPackage = offerings.current.availablePackages.find(
          pkg => pkg.packageType === 'ANNUAL'
        );
        if (yearlyPackage) {
          setSelectedPlan(yearlyPackage);
        }
      }
    } catch (error) {
      console.error('Error fetching RevenueCat offerings:', error);
    }
  };

  // Helper function to get package type display name
  const getPackageDisplayName = (packageType: string) => {
    switch (packageType) {
      case 'ANNUAL':
        return i18n.t('onboarding.subscriptionSelection.yearly');
      case 'MONTHLY':
        return i18n.t('onboarding.subscriptionSelection.monthly');
      default:
        return packageType;
    }
  };

  // Helper function to format package price
  const getPackagePriceDisplay = (pkg: PurchasesPackage) => {
    if (pkg.packageType === 'ANNUAL') {
      // For yearly: (price/12)/mo
      const monthlyPrice = (pkg.product.price / 12).toFixed(2);
      // Use the currency code from the product to format properly
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: pkg.product.currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${formatter.format(parseFloat(monthlyPrice))}/mo`;
    } else {
      // For monthly: price/mo - use the existing priceString and add /mo
      return `${pkg.product.priceString}/mo`;
    }
  };

  // Sort packages to ensure monthly is first, yearly is second
  const sortedPackages = packages.sort((a, b) => {
    if (a.packageType === 'MONTHLY' && b.packageType === 'ANNUAL') return -1;
    if (a.packageType === 'ANNUAL' && b.packageType === 'MONTHLY') return 1;
    return 0;
  });

  // Helper function to generate dynamic pricing text
  const getPricingText = () => {
    const selectedPackage = packages.find(pkg => pkg.identifier === selectedPlan?.identifier);
    if (!selectedPackage) return '';

    if (selectedPackage.packageType === 'ANNUAL') {
      // For yearly: "3 days free, then $39.99 per year ($3.33/mo)"
      const monthlyEquivalent = (selectedPackage.product.price / 12).toFixed(2);
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedPackage.product.currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `3 days free, then ${selectedPackage.product.priceString} per year (${formatter.format(parseFloat(monthlyEquivalent))}/mo)`;
    } else {
      // For monthly: "Just $9.99/mo ($120/year)"
      const yearlyEquivalent = (selectedPackage.product.price * 12).toFixed(2);
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedPackage.product.currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `Just ${selectedPackage.product.priceString}/mo (${formatter.format(parseFloat(yearlyEquivalent))}/year)`;
    }
  };

  // Check if selected plan is yearly for timeline display
  const isYearlySelected = packages.find(pkg => pkg.identifier === selectedPlan?.identifier)?.packageType === 'ANNUAL';
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Header with back button */}
      <View style={styles.header}>
        <BackButton onPress={onBack} />
      </View>

      {/* Main content */}
      <View style={styles.contentWrapper}>
        {/* Main Title */}
        <Text style={[
          styles.mainTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {isYearlySelected 
            ? i18n.t('onboarding.subscriptionSelection.title')
            : i18n.t('onboarding.subscriptionSelection.titleMonthly')
          }
        </Text>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {/* Timeline Items */}
          <View style={styles.timelineItems}>
            {isYearlySelected ? (
              // Yearly timeline (trial period)
              <>
                {/* Today */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#FF9500' : '#FF9500' }
                  ]}>
                    <UnlockIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.today')}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.todayDescription')}
                    </Text>
                  </View>
                </View>

                {/* In 2 Days */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#FF9500' : '#FF9500' }
                  ]}>
                    <BellIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.reminder')}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.reminderDescription')}
                    </Text>
                  </View>
                </View>

                {/* In 3 Days */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#000000' : '#000000' }
                  ]}>
                    <TrendingUpwardsIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.billing')}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.billingDescription', { billingDate })}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              // Monthly timeline (features)
              <>
                {/* Feature 1 */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#FF9500' : '#FF9500' }
                  ]}>
                    <CheckmarkSmallIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature1')}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature1Description')}
                    </Text>
                  </View>
                </View>

                {/* Feature 2 */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#FF9500' : '#FF9500' }
                  ]}>
                    <CheckmarkSmallIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature2')}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature2Description')}
                    </Text>
                  </View>
                </View>

                {/* Feature 3 */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#FF9500' : '#FF9500' }
                  ]}>
                    <CheckmarkSmallIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineTitle,
                      { color: isDark ? '#FFFFFF' : '#000000' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature3')}
                    </Text>
                    <Text style={[
                      styles.timelineDescription,
                      { color: isDark ? '#8E8E93' : '#8E8E93' }
                    ]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature3Description')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.buttonContainer}>
        {/* Subscription Options */}
        <View style={styles.subscriptionContainer}>
          {sortedPackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.subscriptionButton,
                selectedPlan?.identifier === pkg.identifier && styles.selectedButton,
                { borderColor: isDark ? '#FFFFFF' : '#000000' }
              ]}
              onPress={() => {
                hapticFeedback.selection();
                setSelectedPlan(pkg);
              }}
              activeOpacity={0.8}
            >
              {/* 3 Days Free Tag for yearly */}
              {pkg.packageType === 'ANNUAL' && (
                <View style={[
                  styles.freeTag,
                  { backgroundColor: isDark ? '#000000' : '#000000' }
                ]}>
                  <Text style={styles.freeTagText}>
                    {i18n.t('onboarding.subscriptionSelection.freeTag')}
                  </Text>
                </View>
              )}

              <View style={styles.subscriptionContent}>
                <View style={styles.subscriptionTextContainer}>
                  <Text style={[
                    styles.subscriptionTitle,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    {getPackageDisplayName(pkg.packageType)}
                  </Text>
                  <Text style={[
                    styles.subscriptionPrice,
                    { color: isDark ? '#FFFFFF' : '#000000' }
                  ]}>
                    {getPackagePriceDisplay(pkg)}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPlan?.identifier === pkg.identifier && styles.selectedRadio
                ]}>
                  {selectedPlan?.identifier === pkg.identifier && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Text (shows for both plans) */}
        <View style={styles.noPaymentContainer}>
          <Text style={[
            styles.checkmark,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            ✓
          </Text>
          <Text style={[
            styles.noPaymentText,
            { color: isDark ? '#FFFFFF' : '#000000' }
          ]}>
            {isYearlySelected 
              ? i18n.t('onboarding.subscriptionSelection.noPaymentDue')
              : i18n.t('onboarding.subscriptionSelection.cancelAnytime')
            }
          </Text>
        </View>

        {/* Start Trial Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
          ]}
          onPress={() => {
            hapticFeedback.selection();
            handlePaymentComplete();
          }}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.startButtonText,
            { color: isDark ? '#000000' : '#FFFFFF' }
          ]}>
            {isYearlySelected 
              ? i18n.t('onboarding.subscriptionSelection.startTrial')
              : i18n.t('onboarding.subscriptionSelection.startToday')
            }
          </Text>
        </TouchableOpacity>

        {/* Pricing Text */}
        <Text style={[
          styles.pricingText,
          { color: isDark ? '#8E8E93' : '#8E8E93' }
        ]}>
          {getPricingText()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 20,
    paddingBottom: 20,
    height: 64,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 34,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  timelineContainer: {
    marginRight: 20,
    position: 'relative',
  },
  timelineItems: {
    paddingLeft: 45,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    position: 'relative',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -20,
    marginTop: -10,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  timelineDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  subscriptionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  subscriptionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  selectedButton: {
    borderWidth: 2,
  },
  freeTag: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  subscriptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  subscriptionTextContainer: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  subscriptionPrice: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  radioButton: {
    width: 34,
    height: 34,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  noPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  noPaymentText: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  startButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  pricingText: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});