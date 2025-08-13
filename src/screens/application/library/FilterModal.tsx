import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, Modal } from 'react-native';
import { CloseIcon, CheckmarkIcon } from '../../../components/icons/icons';
import { gymMovements } from '../../../constants/gymMovements';
import { hapticFeedback } from '../../../utils/haptic';
import i18n from '../../../utils/i18n';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onFilterSelect: (movements: string[]) => void;
  currentFilters: string[];
  title?: string;
}

export function FilterModal({
  isVisible,
  onClose,
  onFilterSelect,
  currentFilters,
  title = i18n.t('library.filterByMovement')
}: FilterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovements, setSelectedMovements] = useState<string[]>(currentFilters);

  // Filter movements based on search query
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) {
      return gymMovements;
    }
    return gymMovements.filter(movement =>
      movement.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleMovementToggle = (movement: string) => {
    hapticFeedback.selection();
    setSelectedMovements(prev => {
      if (prev.includes(movement)) {
        return prev.filter(m => m !== movement);
      } else {
        return [...prev, movement];
      }
    });
  };

  const handleApply = () => {
    hapticFeedback.success();
    onFilterSelect(selectedMovements);
    onClose();
  };

  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleReset = () => {
    hapticFeedback.success();
    setSelectedMovements([]);
    onFilterSelect([]);
    onClose();
  };

  const handleClearSearch = () => {
    hapticFeedback.selection();
    setSearchQuery('');
  };

  const handleSelectAllMovements = () => {
    hapticFeedback.selection();
    setSelectedMovements([]);
  };

  const isMovementSelected = (movement: string) => selectedMovements.includes(movement);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={handleClose}
      >
        <TouchableOpacity 
          style={styles.popupContainer} 
          activeOpacity={1} 
          onPress={() => {}} // Prevent closing when clicking inside the modal
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <CloseIcon width={20} height={20} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.movementSelectionContainer}>
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={i18n.t('library.searchMovements')}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#8E8E93"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={handleClearSearch}
                  >
                    <CloseIcon width={16} height={16} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
              
              <ScrollView style={styles.movementsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TouchableOpacity
                  style={[
                    styles.movementItem,
                    selectedMovements.length === 0 && styles.movementItemSelected
                  ]}
                  onPress={handleSelectAllMovements}
                  activeOpacity={0.7}
                  delayPressIn={0}
                >
                  <Text style={[
                    styles.movementItemText,
                    selectedMovements.length === 0 && styles.movementItemTextSelected
                  ]}>
                    {i18n.t('library.allMovements')}
                  </Text>
                  {selectedMovements.length === 0 && (
                    <CheckmarkIcon width={20} height={20} color="#000000" />
                  )}
                </TouchableOpacity>
                
                {filteredMovements.map((movement, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.movementItem,
                      isMovementSelected(movement) && styles.movementItemSelected
                    ]}
                    onPress={() => handleMovementToggle(movement)}
                    activeOpacity={0.7}
                    delayPressIn={0}
                  >
                    <Text style={[
                      styles.movementItemText,
                      isMovementSelected(movement) && styles.movementItemTextSelected
                    ]}>
                      {movement}
                    </Text>
                    {isMovementSelected(movement) && (
                      <CheckmarkIcon width={20} height={20} color="#000000" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomControls}>
            <View style={styles.buttonStack}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>{i18n.t('library.reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>{i18n.t('library.apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    height: '90%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 0,
  },
  movementSelectionContainer: {
    flex: 1,
    paddingVertical: 10,
    alignSelf: 'stretch',
    minHeight: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E93',
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingRight: 10,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    height: '100%',
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    lineHeight: 16,
  },
  clearButton: {
    padding: 5,
  },
  movementsList: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 44,
  },
  movementItemSelected: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  movementItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'left',
    flex: 1,
  },
  movementItemTextSelected: {
    fontWeight: '600',
  },
  bottomControls: {
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  buttonStack: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 