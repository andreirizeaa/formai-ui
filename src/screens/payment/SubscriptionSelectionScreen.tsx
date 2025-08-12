import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { BackButton } from '../../components/ui/BackButton';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { useOnboarding } from '../../context/OnboardingContext';

interface SubscriptionSelectionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

// Icon Components
function UnlockIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BellIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CrownIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckmarkIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m4.5 12.75 6 6 9-13.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SubscriptionSelectionScreen({ onNext, onBack }: SubscriptionSelectionScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { preferences, updatePreference, getOnboardingDataForAPI } = useOnboarding();

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
  const handlePaymentComplete = () => {
    const now = new Date();
    const startDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Calculate renewal date based on plan
    const renewalDate = new Date(now);
    if (selectedPlan === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }
    const renewalDateString = renewalDate.toISOString().split('T')[0];
    
    // Set subscription cost based on plan
    const subscriptionCost = selectedPlan === 'monthly' ? 9.99 : 39.99;
    
    // Update subscription preferences
    updatePreference('subscriptionPlan', selectedPlan);
    updatePreference('subscriptionActive', false);
    updatePreference('subscriptionCost', subscriptionCost);
    updatePreference('subscriptionStartDate', startDate);
    updatePreference('subscriptionRenewalDate', renewalDateString);
    updatePreference('freeTrialActive', true);
    
    try {
      const apiData = getOnboardingDataForAPI();
      console.log('API-ready data after payment:', apiData);
    } catch (error) {
      console.log('Onboarding data incomplete after payment:', error);
    }
    onNext();
  };

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
          {selectedPlan === 'yearly' 
            ? i18n.t('onboarding.subscriptionSelection.title')
            : i18n.t('onboarding.subscriptionSelection.titleMonthly')
          }
        </Text>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {/* Timeline Items */}
          <View style={styles.timelineItems}>
            {selectedPlan === 'yearly' ? (
              // Yearly timeline (trial period)
              <>
                {/* Today */}
                <View style={styles.timelineItem}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: isDark ? '#FF9500' : '#FF9500' }
                  ]}>
                    <UnlockIcon color="#FFFFFF" size={20} />
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
                    <BellIcon color="#FFFFFF" size={20} />
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
                    <CrownIcon color="#FFFFFF" size={20} />
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
                    <CheckmarkIcon color="#FFFFFF" size={20} />
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
                    <CheckmarkIcon color="#FFFFFF" size={20} />
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
                    <CheckmarkIcon color="#FFFFFF" size={20} />
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
          {/* Monthly Option */}
          <TouchableOpacity
            style={[
              styles.subscriptionButton,
              selectedPlan === 'monthly' && styles.selectedButton,
              { borderColor: isDark ? '#FFFFFF' : '#000000' }
            ]}
            onPress={() => {
              hapticFeedback.selection();
              setSelectedPlan('monthly');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionTextContainer}>
                <Text style={[
                  styles.subscriptionTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {i18n.t('onboarding.subscriptionSelection.monthly')}
                </Text>
                <Text style={[
                  styles.subscriptionPrice,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {i18n.t('onboarding.subscriptionSelection.monthlyPrice')}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPlan === 'monthly' && styles.selectedRadio
              ]}>
                {selectedPlan === 'monthly' && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Yearly Option */}
          <TouchableOpacity
            style={[
              styles.subscriptionButton,
              selectedPlan === 'yearly' && styles.selectedButton,
              { borderColor: isDark ? '#FFFFFF' : '#000000' }
            ]}
            onPress={() => {
              hapticFeedback.selection();
              setSelectedPlan('yearly');
            }}
            activeOpacity={0.8}
          >
            {/* 3 Days Free Tag */}
            <View style={[
              styles.freeTag,
              { backgroundColor: isDark ? '#000000' : '#000000' }
            ]}>
              <Text style={styles.freeTagText}>
                {i18n.t('onboarding.subscriptionSelection.freeTag')}
              </Text>
            </View>

            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionTextContainer}>
                <Text style={[
                  styles.subscriptionTitle,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {i18n.t('onboarding.subscriptionSelection.yearly')}
                </Text>
                <Text style={[
                  styles.subscriptionPrice,
                  { color: isDark ? '#FFFFFF' : '#000000' }
                ]}>
                  {i18n.t('onboarding.subscriptionSelection.yearlyPrice')}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPlan === 'yearly' && styles.selectedRadio
              ]}>
                {selectedPlan === 'yearly' && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
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
            {selectedPlan === 'yearly' 
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
            {selectedPlan === 'yearly' 
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
          {selectedPlan === 'yearly' 
            ? i18n.t('onboarding.subscriptionSelection.yearlyPricing')
            : i18n.t('onboarding.subscriptionSelection.monthlyPricing')
          }
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