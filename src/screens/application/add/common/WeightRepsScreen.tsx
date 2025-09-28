import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, TextInput, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../../../utils/haptic';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { useTutorialTarget, useTutorial } from '../../../../context/TutorialContext';
import { WeightUnit } from '../../../../types/Lifts';
import { track } from '../../../../services/analytics';

interface WeightRepsScreenProps {
  weightReps: { weight: number; unit: WeightUnit; reps: number } | null;
  onChange: (data: { weight: number; unit: WeightUnit; reps: number }) => void;
  onBack: () => void;
  onUpload: (data: { weight: number; unit: WeightUnit; reps: number }) => void;
}

export function WeightRepsScreen({ 
  weightReps,
  onChange,
  onBack, 
  onUpload,
}: WeightRepsScreenProps) {
  const { ref: completeButtonRef } = useTutorialTarget('weight_reps_complete');
  const { isActive: isTutorialActive } = useTutorial();
  const [focusedInput, setFocusedInput] = useState<'weight' | 'reps' | null>(null);
  const { userDetails } = useUserDetails();
  const unit: WeightUnit = userDetails?.unitSystem === 'imperial' ? 'lbs' : 'kg';
  
  // Use props for weight and reps, with fallback to empty strings
  const weight = weightReps?.weight?.toString() || '';
  const reps = weightReps?.reps?.toString() || '';
  
  const weightInputRef = useRef<TextInput>(null);
  const repsInputRef = useRef<TextInput>(null);
  const accessoryBottom = useRef(new Animated.Value(0)).current;
  const GAP_ADJUSTMENT = -42;
  const insets = useSafeAreaInsets();

  // Auto focus weight input on mount to open keyboard and show accessory (skip if tutorial is active)
  useEffect(() => {
    if (isTutorialActive) return;
    const t = setTimeout(() => {
      setFocusedInput('weight');
      weightInputRef.current?.focus();
    }, 250);
    return () => clearTimeout(t);
  }, [isTutorialActive]);

  // Animate accessory with keyboard height
  useEffect(() => {
    const showSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillShow', e => {
          const height = e.endCoordinates?.height ?? 0;
          Animated.timing(accessoryBottom, {
            toValue: Math.max(height - insets.bottom + GAP_ADJUSTMENT, 0),
            duration: e.duration ?? 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        })
      : Keyboard.addListener('keyboardDidShow', e => {
          const height = e.endCoordinates?.height ?? 0;
          Animated.timing(accessoryBottom, {
            toValue: Math.max(height + GAP_ADJUSTMENT, 0),
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        });

    const hideSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', e => {
          Animated.timing(accessoryBottom, {
            toValue: 0,
            duration: e.duration ?? 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        })
      : Keyboard.addListener('keyboardDidHide', () => {
          Animated.timing(accessoryBottom, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }).start();
        });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [accessoryBottom, insets.bottom]);


  const handleBack = () => {
    hapticFeedback.selection();
    // Track add analysis clicks for back to movements
    track('Add analysis', { event: 'Back to movements' });
    onBack();
  };

  const handleUpload = () => {
    hapticFeedback.selection();
    const metricWeight = weightReps?.weight || 0;
    const repsValue = weightReps?.reps || 0;
    
    if (metricWeight > 0 && repsValue > 0) {
      onUpload({
        weight: metricWeight,
        unit,
        reps: repsValue
      });
    }
  };

  const handleWeightSubmit = () => {
    repsInputRef.current?.focus();
  };

  const handleRepsSubmit = () => {
    Keyboard.dismiss();
    setFocusedInput(null);
    // Track add analysis clicks for complete add video
    track('Add analysis', { event: 'Complete add video' });
    handleUpload();
  };

  const handleKeyboardButtonPress = () => {
    hapticFeedback.selection();
    if (focusedInput === 'weight') {
      handleWeightSubmit();
    } else if (focusedInput === 'reps') {
      handleRepsSubmit();
    }
  };

  const handleInputFocus = (inputType: 'weight' | 'reps') => {
    setFocusedInput(inputType);
  };

  const isWeightValid = weightReps?.weight && weightReps.weight > 0;
  const isUploadDisabled = !isWeightValid || !weightReps?.reps || weightReps.reps <= 0;
  
  const isKeyboardButtonDisabled = () => {
    if (focusedInput === 'weight') {
      return !weightReps?.weight || weightReps.weight <= 0;
    } else if (focusedInput === 'reps') {
      return !weightReps?.reps || weightReps.reps <= 0;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback>
          <View style={styles.content} ref={completeButtonRef}>
            {/* Weight Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight</Text>

              {/* Weight Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={weightInputRef}
                  style={styles.input}
                  value={weight}
                  onChangeText={(text) => {
                    // Track add analysis clicks for weight input
                    if (text.length > 0 && weight.length === 0) {
                      track('Add analysis', { event: 'Weight input' });
                    }
                    const weightValue = parseFloat(text) || 0;
                    onChange({
                      weight: weightValue,
                      unit,
                      reps: weightReps?.reps || 0
                    });
                  }}
                  placeholder="1"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  onSubmitEditing={handleWeightSubmit}
                  blurOnSubmit={false}
                  textContentType="none"
                  autoComplete="off"
                  autoCorrect={false}
                  onFocus={() => handleInputFocus('weight')}
                  onBlur={() => setFocusedInput(null)}
                />
                <Text style={styles.unitText}>{unit}</Text>
              </View>
            </View>

            {/* Sets Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reps</Text>
              <View style={[styles.inputContainer, !isWeightValid && styles.inputContainerDisabled]}>
                <TextInput
                  ref={repsInputRef}
                  style={[styles.input, !isWeightValid && styles.inputDisabled]}
                  value={reps}
                  onChangeText={(text) => {
                    // Track add analysis clicks for reps input
                    if (text.length > 0 && reps.length === 0) {
                      track('Add analysis', { event: 'Reps input' });
                    }
                    const repsValue = parseInt(text) || 0;
                    onChange({
                      weight: weightReps?.weight || 0,
                      unit,
                      reps: repsValue
                    });
                  }}
                  placeholder="1"
                  placeholderTextColor={isWeightValid ? "#8E8E93" : "#C7C7CC"}
                  keyboardType="numeric"
                  onSubmitEditing={handleRepsSubmit}
                  blurOnSubmit={true}
                  onFocus={() => handleInputFocus('reps')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!!isWeightValid}
                  pointerEvents={isWeightValid ? 'auto' : 'none'}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>

      </KeyboardAvoidingView>
      {/* Custom Keyboard Accessory View (outside KAV to avoid overlap) - hide during tutorial */}
      {focusedInput && !isTutorialActive && (
        <Animated.View style={[styles.keyboardAccessoryView, { bottom: accessoryBottom }]}> 
          <View style={styles.keyboardRow}>
            <TouchableOpacity 
              style={styles.keyboardBackButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.keyboardBackButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.keyboardPrimaryButton, isKeyboardButtonDisabled() && styles.keyboardPrimaryButtonDisabled]}
              onPress={handleKeyboardButtonPress}
              disabled={isKeyboardButtonDisabled()}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyboardPrimaryButtonText, isKeyboardButtonDisabled() && styles.keyboardPrimaryButtonTextDisabled]}>
                {focusedInput === 'weight' ? 'Next' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    paddingHorizontal: 20,
    flex: 1,
  },
  content: {
    marginTop: -40,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 18,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
    height: 60,
    
  },
  unitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  keyboardAccessoryView: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F0F0F0',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  keyboardRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  keyboardBackButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  keyboardBackButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  keyboardPrimaryButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  keyboardPrimaryButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.7,
  },
  keyboardPrimaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  keyboardPrimaryButtonTextDisabled: {
    color: '#FFFFFF',
  },
  keyboardButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 0,
  },
  keyboardButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.7,
  },
  keyboardButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  keyboardButtonTextDisabled: {
    color: '#FFFFFF',
  },
  bottomContainer: {
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: -30,
  },
  buttonStack: {
    width: '100%',
  },
  backButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  uploadButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 28,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.7,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  uploadButtonTextDisabled: {
    color: '#C7C7CC',
  },
  inputContainerDisabled: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  inputDisabled: {
    color: '#C7C7CC',
  },
  dismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
}); 