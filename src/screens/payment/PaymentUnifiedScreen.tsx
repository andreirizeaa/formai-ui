import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { BackButton } from '../../components/ui/BackButton';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { TrendingUpwardsIcon, CheckmarkSmallIcon, UnlockIcon, BellIcon } from '../../components/icons/icons';
import { usePurchases } from '../../context/PurchasesContext';
import type { PurchasesPackage, PurchasesError } from 'react-native-purchases';
import { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import LottieView from 'lottie-react-native';

interface PaymentUnifiedScreenProps {
  onComplete: () => void;
}

type PaymentStep = 'freeTrial' | 'notificationReminder' | 'subscriptionSelection';

export function PaymentUnifiedScreen({ onComplete }: PaymentUnifiedScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentStep, setCurrentStep] = useState<PaymentStep>('freeTrial');
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Notification animation now uses Lottie bell

  // Purchases state
  const { packages, purchasePackage, restorePurchases } = usePurchases();

  // Select monthly and yearly packages explicitly
  const monthlyPackage: PurchasesPackage | null = useMemo(() => {
    const byId = packages.find(p => p.identifier === 'formai_monthly');
    if (byId) return byId;
    const byType = packages.find(p => p.packageType === 'MONTHLY');
    return byType ?? null;
  }, [packages]);

  const yearlyPackage: PurchasesPackage | null = useMemo(() => {
    const byId = packages.find(p => p.identifier === 'formai_yearly');
    if (byId) return byId;
    const byType = packages.find(p => p.packageType === 'ANNUAL');
    return byType ?? null;
  }, [packages]);

  // Only display two cards: monthly then yearly
  const displayPackages: PurchasesPackage[] = useMemo(() => {
    const list = [monthlyPackage, yearlyPackage].filter(Boolean) as PurchasesPackage[];
    const uniqueById = new Map<string, PurchasesPackage>();
    for (const pkg of list) uniqueById.set(pkg.identifier, pkg);
    return Array.from(uniqueById.values());
  }, [monthlyPackage, yearlyPackage]);

  // Selected plan
  const [selectedPlan, setSelectedPlan] = useState<PurchasesPackage | null>(null);
  useEffect(() => {
    if (!selectedPlan) {
      if (yearlyPackage) setSelectedPlan(yearlyPackage);
      else if (monthlyPackage) setSelectedPlan(monthlyPackage);
    } else {
      // If selected plan is not in display list anymore, reset
      if (!displayPackages.find(p => p.identifier === selectedPlan.identifier)) {
        if (yearlyPackage) setSelectedPlan(yearlyPackage);
        else if (monthlyPackage) setSelectedPlan(monthlyPackage);
        else setSelectedPlan(null);
      }
    }
  }, [displayPackages, monthlyPackage, yearlyPackage, selectedPlan]);

  // Helpers
  function getBillingDate() {
    const today = new Date();
    const billingDate = new Date(today);
    billingDate.setDate(today.getDate() + 3);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return billingDate.toLocaleDateString('en-US', options);
  }

  const billingDate = getBillingDate();

  function getPackageDisplayName(packageType: string) {
    switch (packageType) {
      case 'ANNUAL':
        return 'Yearly';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return packageType;
    }
  }

  function getPackagePriceDisplay(pkg: PurchasesPackage) {
    if (pkg.packageType === 'ANNUAL') {
      const monthlyPrice = (pkg.product.price / 12).toFixed(2);
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: pkg.product.currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${formatter.format(parseFloat(monthlyPrice))}/mo`;
    }
    return `${pkg.product.priceString}/mo`;
  }

  function getPricingText() {
    if (!selectedPlan) return '';

    const isSelectedYearly =
      selectedPlan.packageType === 'ANNUAL' ||
      (yearlyPackage && selectedPlan.identifier === yearlyPackage.identifier);

    const pkgForPricing = isSelectedYearly ? (selectedPlan.product ? selectedPlan : yearlyPackage) : selectedPlan;
    if (!pkgForPricing) return '';

    if (isSelectedYearly) {
      const monthlyEquivalent = (pkgForPricing.product.price / 12).toFixed(2);
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: pkgForPricing.product.currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `3 days free, then ${pkgForPricing.product.priceString} per year (${formatter.format(parseFloat(monthlyEquivalent))}/mo)`;
    }

    const yearlyEquivalent = (pkgForPricing.product.price * 12).toFixed(2);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pkgForPricing.product.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Just ${pkgForPricing.product.priceString}/mo (${formatter.format(parseFloat(yearlyEquivalent))}/year)`;
  }

  function getYearlyPricingText() {
    if (!yearlyPackage) return '';
    const monthlyEquivalent = (yearlyPackage.product.price / 12).toFixed(2);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: yearlyPackage.product.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `3 days free, then ${yearlyPackage.product.priceString} per year (${formatter.format(parseFloat(monthlyEquivalent))}/mo)`;
  }

  const isYearlySelected = !!(selectedPlan && selectedPlan.identifier === yearlyPackage?.identifier);

  // Actions
  function handleFreeTrialNext() {
    setCurrentStep('notificationReminder');
  }

  function handleNotificationReminderNext() {
    setCurrentStep('subscriptionSelection');
  }

  async function handlePurchase() {
    if (!selectedPlan) {
      return;
    }
    setIsPurchasing(true);
    try {
        const response = await purchasePackage(selectedPlan);
        console.log(response);
        response !== null && onComplete();
    } catch (e: any) {
        const err = e as PurchasesError;
        if (err?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
          // User cancelled; do not navigate
          hapticFeedback.error();
        }
    } finally {
        setIsPurchasing(false);
    }
  }

  async function handleRestore() {
    setIsRestoring(true);
    try {
      await restorePurchases();
      // If restore is successful and user has active subscription, complete the flow
      onComplete();
    } catch (e) {
      console.error('Restore failed', e);
    } finally {
      setIsRestoring(false);
    }
  }

  // Header with optional back
  function renderHeader() {
    return (
      <View style={styles.header}>
        {currentStep !== 'freeTrial' && (
          <BackButton onPress={() => {
            if (currentStep === 'notificationReminder') setCurrentStep('freeTrial');
            else if (currentStep === 'subscriptionSelection') setCurrentStep('notificationReminder');
          }} />
        )}
        
        <View style={styles.headerSpacer} />
        
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            handleRestore();
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.restoreText, { color: '#8E8E93' }]}>
            Restore
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step content
  function renderContent() {
    if (currentStep === 'freeTrial') {
      return (
        <View style={styles.centeredContent}>
          <Text style={[styles.mainTitleLarge, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {i18n.t('onboarding.freeTrial.title')}
          </Text>
          <View style={styles.photoContainer}>
            <Image
              source={require('../../../assets/app-overview-photo.png')}
              style={styles.photo}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    }

    if (currentStep === 'notificationReminder') {
      return (
        <View style={styles.centeredContent}>
          <Text style={[styles.mainTitleMedium, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {i18n.t('onboarding.notificationReminder.title')}
          </Text>
          <View style={styles.bellContainer}>
            <LottieView
              source={require('../../../assets/animations/bell.json')}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
          </View>
        </View>
      );
    }

    // subscriptionSelection main content
    return (
      <View>
        {/* App icon above title */}
        <View style={styles.appIconContainer}>
          <View style={styles.appIconCard}>
            <Image
              source={require('../../../assets/formai-ios-icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={[styles.mainTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {isYearlySelected ? i18n.t('onboarding.subscriptionSelection.title') : i18n.t('onboarding.subscriptionSelection.titleMonthly')}
        </Text>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineItems}>
            {isYearlySelected ? (
              <>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: '#FF9500' }]}>
                    <UnlockIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {i18n.t('onboarding.subscriptionSelection.today')}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: '#8E8E93' }]}>
                      {i18n.t('onboarding.subscriptionSelection.todayDescription')}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: '#FF9500' }]}>
                    <BellIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {i18n.t('onboarding.subscriptionSelection.reminder')}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: '#8E8E93' }]}>
                      {i18n.t('onboarding.subscriptionSelection.reminderDescription')}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: '#000000' }]}>
                    <TrendingUpwardsIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {i18n.t('onboarding.subscriptionSelection.billing')}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: '#8E8E93' }]}>
                      {i18n.t('onboarding.subscriptionSelection.billingDescription', { billingDate })}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: '#FF9500' }]}>
                    <CheckmarkSmallIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature1')}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: '#8E8E93' }]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature1Description')}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: '#FF9500' }]}>
                    <CheckmarkSmallIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature2')}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: '#8E8E93' }]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature2Description')}
                    </Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: '#FF9500' }]}>
                    <CheckmarkSmallIcon width={20} height={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature3')}
                    </Text>
                    <Text style={[styles.timelineDescription, { color: '#8E8E93' }]}>
                      {i18n.t('onboarding.subscriptionSelection.monthlyFeature3Description')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Bottom actions
  function renderBottom() {
    if (currentStep === 'freeTrial') {
      return (
        <View>
          <View style={styles.inlineRowCenter}>
            <Text style={[styles.checkmark, { color: isDark ? '#FFFFFF' : '#000000' }]}>✓</Text>
            <Text style={[styles.noPaymentText, { color: isDark ? '#FFFFFF' : '#000000' }]}> 
              {i18n.t('onboarding.freeTrial.noPaymentDue')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
            onPress={() => {
              hapticFeedback.selection();
              handleFreeTrialNext();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {i18n.t('onboarding.freeTrial.tryForFree')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.pricingText, { color: '#8E8E93' }]}>{getYearlyPricingText()}</Text>
        </View>
      );
    }

    if (currentStep === 'notificationReminder') {
      return (
        <View>
          <View style={styles.inlineRowCenter}>
            <Text style={[styles.checkmark, { color: isDark ? '#FFFFFF' : '#000000' }]}>✓</Text>
            <Text style={[styles.noPaymentText, { color: isDark ? '#FFFFFF' : '#000000' }]}> 
              {i18n.t('onboarding.notificationReminder.noPaymentDue')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
            onPress={() => {
              hapticFeedback.selection();
              handleNotificationReminderNext();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              {i18n.t('onboarding.notificationReminder.continueForFree')}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.pricingText, { color: '#8E8E93' }]}>{getYearlyPricingText()}</Text>
        </View>
      );
    }

    // subscriptionSelection bottom content
    return (
      <View>
        <View style={styles.subscriptionContainer}>
          {displayPackages.map(pkg => (
            <TouchableOpacity
              key={pkg.identifier}
              style={[
                styles.subscriptionButton,
                selectedPlan?.identifier === pkg.identifier && styles.selectedButton,
                { borderColor: isDark ? '#FFFFFF' : '#000000' },
              ]}
              onPress={() => {
                hapticFeedback.selection();
                setSelectedPlan(pkg);
              }}
              activeOpacity={0.8}
            >
              {pkg.packageType === 'ANNUAL' && (
                <View style={[styles.freeTag, { backgroundColor: '#000000' }]}> 
                  <Text style={styles.freeTagText}>{i18n.t('onboarding.subscriptionSelection.freeTag')}</Text>
                </View>
              )}

              <View style={styles.subscriptionContent}>
                <View style={styles.subscriptionTextContainer}>
                  <Text style={[styles.subscriptionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}> 
                    {getPackageDisplayName(pkg.packageType)}
                  </Text>
                  <Text style={[styles.subscriptionPrice, { color: isDark ? '#FFFFFF' : '#000000' }]}> 
                    {getPackagePriceDisplay(pkg)}
                  </Text>
                </View>
                <View style={[styles.radioButton, selectedPlan?.identifier === pkg.identifier && styles.selectedRadio]}> 
                  {selectedPlan?.identifier === pkg.identifier && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inlineRowCenter}>
          <Text style={[styles.checkmark, { color: isDark ? '#FFFFFF' : '#000000' }]}>✓</Text>
          <Text style={[styles.noPaymentText, { color: isDark ? '#FFFFFF' : '#000000' }]}> 
            {isYearlySelected ? i18n.t('onboarding.subscriptionSelection.noPaymentDue') : i18n.t('onboarding.subscriptionSelection.cancelAnytime')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]} 
          onPress={() => {
            hapticFeedback.selection();
            handlePurchase();
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}> 
            {isYearlySelected ? i18n.t('onboarding.subscriptionSelection.startTrial') : i18n.t('onboarding.subscriptionSelection.startToday')}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.pricingText, { color: '#8E8E93' }]}>{getPricingText()}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}> 
      {renderHeader()}

      <View style={styles.contentWrapper}>{renderContent()}</View>

      <View style={styles.bottomWrapper}>{renderBottom()}</View>
      
      <LoadingOverlay visible={isRestoring || isPurchasing} />
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
  headerSpacer: {
    flex: 1,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitleLarge: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 42,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  mainTitleMedium: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 100,
    lineHeight: 36,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 34,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  appIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: -24,
  },
  appIconCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    ...Platform.select({ android: { elevation: 4 }, ios: { elevation: 8 } }),
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  // Notification reminder visuals
  bellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
  },
  // Subscription selection visuals
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
  inlineRowCenter: {
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
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
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
  photoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  photo: {
    width: '100%',
    height: '85%',
  },
}); 