import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/common/OnboardingLayout';
import i18n from '../../utils/i18n';
import { ActivityIndicator } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

interface SetupLoadingScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function SetupLoadingScreen({ onNext, onBack }: SetupLoadingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setupSteps = [
    i18n.t('setupLoading.step1'),
    i18n.t('setupLoading.step2'),
  ];

  useEffect(() => {
    let stepIndex = 0;
    
    const showNextStep = () => {
      if (stepIndex < setupSteps.length) {
        setCurrentStep(stepIndex);
        stepIndex++;
        
        // Show tracking popup after 2 seconds (arbitrary timing)
        if (stepIndex === 2) {
          setTimeout(() => {
            requestTrackingPermission();
          }, 2000);
        }
        
        timeoutRef.current = setTimeout(showNextStep, 1500);
      } else {
        // Setup complete, move to next screen
        setTimeout(() => {
          onNext();
        }, 1000);
      }
    };

    showNextStep();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const requestTrackingPermission = async () => {
    try {
      // Request tracking permission
      await TrackingTransparency.requestTrackingPermissionsAsync();
      
      // Get the tracking authorization status
      await TrackingTransparency.getTrackingPermissionsAsync();
      
      setShowTrackingPopup(true);
      
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowTrackingPopup(false);
      }, 3000);
      
    } catch (error) {
      console.log('Error requesting tracking permission:', error);
    }
  };

  return (
    <OnboardingLayout
      title={i18n.t('setupLoading.title')}
      subtitle=""
      currentStep={15}
      totalSteps={16}
      onBack={onBack}
      onNext={() => {}} // No next button, handled automatically
      nextTitle=""
      nextDisabled={true}
      hideNextButton={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Main title */}
          <Text style={[
            styles.mainTitle,
            {
              color: isDark ? '#FFFFFF' : '#000000',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
            }
          ]}>
            {i18n.t('setupLoading.mainTitle')}
          </Text>

          {/* Current step text */}
          <Text style={[
            styles.stepText,
            {
              color: isDark ? '#8E8E93' : '#8E8E93',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
            }
          ]}>
            {setupSteps[currentStep]}
          </Text>

          {/* Loading spinner */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator 
              size={Platform.OS === 'ios' ? 'large' : 48}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </View>
        </View>
      </View>

      {/* iOS Tracking Permission Popup */}
      {showTrackingPopup && (
        <View style={styles.trackingPopup}>
          <View style={[
            styles.trackingDialog,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
            }
          ]}>
            <Text style={[
              styles.trackingTitle,
              {
                color: isDark ? '#FFFFFF' : '#000000',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
              }
            ]}>
              {i18n.t('setupLoading.trackingTitle')}
            </Text>
            
            <Text style={[
              styles.trackingDescription,
              {
                color: isDark ? '#8E8E93' : '#8E8E93',
                fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
              }
            ]}>
              {i18n.t('setupLoading.trackingDescription')}
            </Text>
            
            <View style={styles.trackingButtons}>
              <Text style={[
                styles.trackingButton,
                {
                  color: isDark ? '#007AFF' : '#007AFF',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}>
                {i18n.t('setupLoading.askAppNotToTrack')}
              </Text>
              
              <Text style={[
                styles.trackingButton,
                {
                  color: isDark ? '#007AFF' : '#007AFF',
                  fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                }
              ]}>
                {i18n.t('setupLoading.allow')}
              </Text>
            </View>
          </View>
        </View>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  stepText: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  spinnerContainer: {
    marginTop: 20,
  },
  trackingPopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  trackingDialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  trackingTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackingDescription: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  trackingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackingButton: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    paddingVertical: 12,
  },
}); 