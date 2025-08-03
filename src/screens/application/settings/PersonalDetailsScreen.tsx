import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import i18n from '../../../utils/i18n';
import { hapticFeedback } from '../../../utils/haptic';

interface PersonalDetailsScreenProps {
  onBack: () => void;
  onEditCurrentWeight: (data: PersonalData) => void;
  onEditHeight: (data: PersonalData) => void;
  onEditDateOfBirth: (data: PersonalData) => void;
  onEditGender: (data: PersonalData) => void;
  personalData: PersonalData;
}

interface PersonalData {
  currentWeight: string;
  height: string;
  dateOfBirth: string;
  gender: string;
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
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            stroke="#8E8E93"
            strokeWidth={1.5}
          />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

// Function to translate personal data values based on current language
function translatePersonalDataValue(key: string, value: string): string {
  const currentLocale = i18n.locale;
  
  switch (key) {
    case 'currentWeight':
      // Extract number and unit from weight value
      const weightMatch = value.match(/(\d+(?:\.\d+)?)\s*(kg|lbs)/);
      if (weightMatch) {
        const [, number, unit] = weightMatch;
        const translatedUnit = unit === 'kg' ? i18n.t('measurements.kg') : i18n.t('measurements.lbs');
        return `${number} ${translatedUnit}`;
      }
      return value;
      
    case 'height':
      // Handle both metric and imperial height formats
      if (value.includes('cm')) {
        const heightMatch = value.match(/(\d+)\s*cm/);
        if (heightMatch) {
          const [, number] = heightMatch;
          return `${number} ${i18n.t('measurements.cm')}`;
        }
      } else if (value.includes("'") && value.includes('"')) {
        // Keep feet/inches format as is since it's universal
        return value;
      }
      return value;
      
    case 'dateOfBirth':
      // Translate month names in date
      const months = {
        'January': i18n.t('months.january'),
        'February': i18n.t('months.february'),
        'March': i18n.t('months.march'),
        'April': i18n.t('months.april'),
        'May': i18n.t('months.may'),
        'June': i18n.t('months.june'),
        'July': i18n.t('months.july'),
        'August': i18n.t('months.august'),
        'September': i18n.t('months.september'),
        'October': i18n.t('months.october'),
        'November': i18n.t('months.november'),
        'December': i18n.t('months.december')
      };
      
      let translatedDate = value;
      Object.entries(months).forEach(([english, translated]) => {
        translatedDate = translatedDate.replace(english, translated);
      });
      return translatedDate;
      
    case 'gender':
      // Translate gender values
      const genderTranslations = {
        'Male': i18n.t('gender.male'),
        'Female': i18n.t('gender.female'),
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
  onEditGender,
  personalData
}: PersonalDetailsScreenProps) {
  // Handler functions to open edit screens with current data
  const handleEditCurrentWeight = () => {
    onEditCurrentWeight(personalData);
  };

  const handleEditHeight = () => {
    onEditHeight(personalData);
  };

  const handleEditDateOfBirth = () => {
    onEditDateOfBirth(personalData);
  };

  const handleEditGender = () => {
    onEditGender(personalData);
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
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
              stroke="#000000"
              strokeWidth={2}
            />
          </Svg>
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
            value={translatePersonalDataValue('currentWeight', personalData.currentWeight)}
            onPress={handleEditCurrentWeight}
          />
          <View style={styles.separator} />
          <PersonalDetailOption
            title={i18n.t('personalDetails.height')}
            value={translatePersonalDataValue('height', personalData.height)}
            onPress={handleEditHeight}
          />
          <View style={styles.separator} />
          <PersonalDetailOption
            title={i18n.t('personalDetails.dateOfBirth')}
            value={translatePersonalDataValue('dateOfBirth', personalData.dateOfBirth)}
            onPress={handleEditDateOfBirth}
          />
          <View style={styles.separator} />
          <PersonalDetailOption
            title={i18n.t('personalDetails.gender')}
            value={translatePersonalDataValue('gender', personalData.gender)}
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