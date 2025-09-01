import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import showEditFailedAlert from '../../../../services/alertService';
import { useUserDetails } from '../../../../context/UserDetailsContext';
import { editUserDetails } from '../../../../services/userService';
import { hapticFeedback } from '../../../../utils/haptic';
import i18n from '../../../../utils/i18n';
import { ChevronLeft } from 'lucide-react-native';

interface EditGenderScreenProps {
  onBack: () => void;
  currentValue: string;
  onSave: (newValue: string) => void;
}

export function EditGenderScreen({ onBack, currentValue, onSave }: EditGenderScreenProps) {
  const { refetchUserDetails } = useUserDetails();
  const [selectedGender, setSelectedGender] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    if (isSaving) return;
    hapticFeedback.selection();
    setIsSaving(true);
    try {
      await editUserDetails({ gender: selectedGender });
      await refetchUserDetails();
      hapticFeedback.success();
      onSave(selectedGender);
    } catch (e) {
      hapticFeedback.error();
      setSelectedGender(currentValue);
      showEditFailedAlert(i18n.t('settings.editFailed.gender'), i18n.t('settings.editFailed.message'), () => {
        hapticFeedback.selection();
        onBack();
      });
    }
    setIsSaving(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            hapticFeedback.selection();
            onBack();
          }}
        >
          <ChevronLeft width={24} height={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('personalDetails.editGender')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{i18n.t('onboarding.gender.title')}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Gender Selection Buttons */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedGender === 'male' && styles.selectedOption,
            ]}
            onPress={() => {
              hapticFeedback.selection();
              setSelectedGender('male');
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === 'male' && styles.selectedOptionText,
              ]}
            >
              {i18n.t('onboarding.gender.male')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedGender === 'female' && styles.selectedOption,
            ]}
            onPress={() => {
              hapticFeedback.selection();
              setSelectedGender('female');
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === 'female' && styles.selectedOptionText,
              ]}
            >
              {i18n.t('onboarding.gender.female')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.nextButton, isSaving && { opacity: 0.7 }]} onPress={handleNext} activeOpacity={0.8} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>{i18n.t('settings.save')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  placeholder: {
    width: 44,
  },
  titleContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'left', // Align text to the left
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 