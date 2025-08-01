import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import i18n from '../../../utils/i18n';
import { LANGUAGES } from '../../../constants/languages';
import { hapticFeedback } from '../../../utils/haptic';
import { useLanguage } from '../../../context/LanguageContext';

interface LanguageModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function LanguageModal({ isVisible, onClose }: LanguageModalProps) {
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageSelect = (languageCode: string) => {
    hapticFeedback.selection();
    setLanguage(languageCode);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              hapticFeedback.selection();
              onClose();
            }}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
                stroke="#000000"
                strokeWidth={2}
              />
            </Svg>
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>{i18n.t('language.selectLanguage')}</Text>

          {/* Language options */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            scrollIndicatorInsets={{ right: 1 }}
            indicatorStyle="black"
            bounces={true}
            alwaysBounceVertical={false}
            nestedScrollEnabled={true}
            fadingEdgeLength={Platform.OS === 'android' ? 50 : 0}
          >
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: currentLanguage === language.code
                      ? '#000000'  // Black background when selected
                      : 'transparent',
                    borderColor: currentLanguage === language.code
                      ? '#000000'  // Black border when selected
                      : '#E5E5EA',
                  }
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageContent}>
                  <Text 
                    style={[
                      styles.languageName,
                      { 
                        color: currentLanguage === language.code
                          ? '#FFFFFF'  // White text when selected
                          : '#000000',
                        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
                      }
                    ]}
                  >
                    {language.nativeName}
                  </Text>
                  <Text style={styles.flag}>{language.flag}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'left',
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingVertical: 10,
    gap: 12,
  },
  languageButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '500',
  },
}); 