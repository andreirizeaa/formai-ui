import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';
import { useUserDetails } from '../../../context/UserDetailsContext';
import { Pencil, X } from 'lucide-react-native';

interface PersonalDetailsScreenProps {
  onBack: () => void;
  onEditCurrentWeight: (currentValue: string) => void;
  onEditHeight: (currentValue: string) => void;
  onEditDateOfBirth: (currentValue: string) => void;
  onEditGender: (currentValue: string) => void;
}

interface PersonalDetailOptionProps {
  title: string;
  value: string;
  onPress?: () => void;
}

function PersonalDetailOption({ title, value, onPress }: PersonalDetailOptionProps) {
  return (
    <TouchableOpacity 
      style={styles.optionRow} 
      onPress={() => {
        hapticFeedback.selection();
        onPress?.();
      }} 
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionValue}>{value}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Pencil width={20} height={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
}

// Function to translate personal data values based on current language
function translatePersonalDataValue(key: string, value: string): string {
  switch (key) {
    case 'currentWeight':
      // Extract number and unit from weight value
      const weightMatch = value.match(/(\d+(?:\.\d+)?)\s*(kg|lbs)/);
      if (weightMatch) {
        const [, number, unit] = weightMatch;
        const translatedUnit = unit === 'kg' ? i18n.t('onboarding.measurements.kg') : i18n.t('onboarding.measurements.lbs');
        return `${number} ${translatedUnit}`;
      }
      return value;
      
    case 'height':
      // Handle both metric and imperial height formats
      if (value.includes('cm')) {
        const heightMatch = value.match(/(\d+)\s*cm/);
        if (heightMatch) {
          const [, number] = heightMatch;
          return `${number} ${i18n.t('onboarding.measurements.cm')}`;
        }
      } else if (value.includes("'") && value.includes('"')) {
        // Keep feet/inches format as is since it's universal
        return value;
      }
      return value;
      
    case 'dateOfBirth':
      // Translate month names in date to abbreviated format
      const months = {
        'January': i18n.t('months.january').substring(0, 3),
        'February': i18n.t('months.february').substring(0, 3),
        'March': i18n.t('months.march').substring(0, 3),
        'April': i18n.t('months.april').substring(0, 3),
        'May': i18n.t('months.may').substring(0, 3),
        'June': i18n.t('months.june').substring(0, 3),
        'July': i18n.t('months.july').substring(0, 3),
        'August': i18n.t('months.august').substring(0, 3),
        'September': i18n.t('months.september').substring(0, 3),
        'October': i18n.t('months.october').substring(0, 3),
        'November': i18n.t('months.november').substring(0, 3),
        'December': i18n.t('months.december').substring(0, 3),
      };
      
      let translatedDate = value;
      Object.entries(months).forEach(([english, translated]) => {
        translatedDate = translatedDate.replace(english, translated);
      });
      return translatedDate;
      
    case 'gender':
      // Translate gender values
      const genderTranslations = {
        'male': i18n.t('personalDetails.male'),
        'female': i18n.t('personalDetails.female'),
      };
      return genderTranslations[value as keyof typeof genderTranslations] || value;
      
    default:
      return value;
  }
}

export function PersonalDetailsScreen({ 
  onBack, 
  onEditCurrentWeight, 
  onEditHeight, 
  onEditDateOfBirth, 
  onEditGender
}: PersonalDetailsScreenProps) {
  const { userDetails, getWeightDisplay, getHeightDisplay, getDateOfBirthDisplay } = useUserDetails();

  const handleEditCurrentWeight = () => {
    onEditCurrentWeight(getWeightDisplay());
  };

  const handleEditHeight = () => {
    onEditHeight(getHeightDisplay());
  };

  const handleEditDateOfBirth = () => {
    onEditDateOfBirth(getDateOfBirthDisplay());
  };

  const handleEditGender = () => {
    onEditGender(userDetails?.gender ?? '');
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <X width={20} height={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('settings.personalDetails')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Personal Details Card */}
        <View style={styles.card}>
          <PersonalDetailOption
            title={i18n.t('personalDetails.currentWeight')}
            value={translatePersonalDataValue('currentWeight', getWeightDisplay())}
            onPress={handleEditCurrentWeight}
          />
          <View style={styles.separator} />
          <PersonalDetailOption
            title={i18n.t('personalDetails.height')}
            value={translatePersonalDataValue('height', getHeightDisplay())}
            onPress={handleEditHeight}
          />
          <View style={styles.separator} />
          <PersonalDetailOption
            title={i18n.t('personalDetails.dateOfBirth')}
            value={translatePersonalDataValue('dateOfBirth', getDateOfBirthDisplay())}
            onPress={handleEditDateOfBirth}
          />
          <View style={styles.separator} />
          <PersonalDetailOption
            title={i18n.t('personalDetails.gender')}
            value={translatePersonalDataValue('gender', userDetails?.gender ?? '')}
            onPress={handleEditGender}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  optionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5EA',
  },
}); 