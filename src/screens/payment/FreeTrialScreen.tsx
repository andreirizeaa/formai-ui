import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { PaymentLayout } from '../../components/payment/PaymentLayout';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';

interface FreeTrialScreenProps {
  onNext: () => void;
}

export function FreeTrialScreen({ onNext }: FreeTrialScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <PaymentLayout
      customButtons={
        <View style={styles.buttonContainer}>
          {/* No Payment Due Text */}
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
              {i18n.t('freeTrial.noPaymentDue')}
            </Text>
          </View>

          {/* Try for Free Button */}
          <TouchableOpacity
            style={[
              styles.tryButton,
              { backgroundColor: isDark ? '#FFFFFF' : '#000000' }
            ]}
            onPress={() => {
              hapticFeedback.selection();
              onNext();
            }}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tryButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' }
            ]}>
              {i18n.t('freeTrial.tryForFree')}
            </Text>
          </TouchableOpacity>

          {/* Pricing Text */}
          <Text style={[
            styles.pricingText,
            { color: isDark ? '#8E8E93' : '#8E8E93' }
          ]}>
            {i18n.t('freeTrial.pricing')}
          </Text>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Main Title */}
        <Text style={[
          styles.mainTitle,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          {i18n.t('freeTrial.title')}
        </Text>

        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require('../../../assets/formai-light-icon.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </View>
      </View>
    </PaymentLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  mainTitle: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 42,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  appIcon: {
    width: 260,
    height: 260,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  noPaymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tryButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tryButtonText: {
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