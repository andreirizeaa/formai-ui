import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, TextInput, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../../../utils/haptic';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { useTutorialTarget, useTutorial } from '../../../../context/TutorialContext';

interface WeightRepsScreenProps {
  onBack: () => void;
  onUpload: (data: { weight: number; unit: 'kg' | 'lbs'; reps: number }) => void;
  initialUnit?: 'kg' | 'lbs';
}

export function WeightRepsScreen({ 
  onBack, 
  onUpload,
}: WeightRepsScreenProps) {
  const { ref: completeButtonRef } = useTutorialTarget('weight_reps_complete');
  const { isActive: isTutorialActive } = useTutorial();
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [focusedInput, setFocusedInput] = useState<'weight' | 'reps' | null>(null);
  const { userDetails } = useUserDetails();
  const unit: 'kg' | 'lbs' = userDetails?.unitSystem === 'imperial' ? 'lbs' : 'kg';
  
  const weightInputRef = useRef<TextInput>(null);
  const repsInputRef = useRef<TextInput>(null);

  // Auto-focus weight input when component mounts (but not during tutorial)
  useEffect(() => {
    if (isTutorialActive) {
      return; // Don't auto-focus during tutorial
    }
    
    const timer = setTimeout(() => {
      weightInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [isTutorialActive]);

  const handleBack = () => {
    hapticFeedback.selection();
    onBack();
  };

  const handleUpload = () => {
    hapticFeedback.selection();
    const weightValue = parseFloat(weight) || 0;
    const repsValue = parseInt(reps) || 0;
    
    if (weightValue > 0 && repsValue > 0) {
      onUpload({
        weight: weightValue,
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

  const isUploadDisabled = !weight || parseFloat(weight) <= 0 || !reps || parseInt(reps) <= 0;
  
  const isKeyboardButtonDisabled = () => {
    if (focusedInput === 'weight') {
      return !weight || parseFloat(weight) <= 0;
    } else if (focusedInput === 'reps') {
      return !reps || parseInt(reps) <= 0;
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Weight Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight</Text>

              {/* Weight Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={weightInputRef}
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
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
              <View style={styles.inputContainer}>
                <TextInput
                  ref={repsInputRef}
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  placeholder="1"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  onSubmitEditing={handleRepsSubmit}
                  blurOnSubmit={true}
                  onFocus={() => handleInputFocus('reps')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Custom Keyboard Accessory View */}
        {focusedInput && (
          <View style={styles.keyboardAccessoryView}>
            <TouchableOpacity 
              style={[styles.keyboardButton, isKeyboardButtonDisabled() && styles.keyboardButtonDisabled]}
              onPress={handleKeyboardButtonPress}
              disabled={isKeyboardButtonDisabled()}
              activeOpacity={0.7}
            >
              <Text style={[styles.keyboardButtonText, isKeyboardButtonDisabled() && styles.keyboardButtonTextDisabled]}>
                {focusedInput === 'weight' ? 'Next' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Buttons - always shown */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonStack}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              ref={completeButtonRef}
              style={[styles.uploadButton, isUploadDisabled && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={isUploadDisabled}
              activeOpacity={0.7}
            >
              <Text style={[styles.uploadButtonText, isUploadDisabled && styles.uploadButtonTextDisabled]}>
                Complete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    color: '#000000',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
  },
  unitText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  keyboardAccessoryView: {
    backgroundColor: '#f3f4f6',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    paddingBottom: 50,
  },
  keyboardButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 12,
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
    fontWeight: '600',
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
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  uploadButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  uploadButtonTextDisabled: {
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