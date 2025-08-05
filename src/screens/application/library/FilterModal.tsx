import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { gymMovements } from '../../../constants/gymMovements';
import { hapticFeedback } from '../../../utils/haptic';

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
  title = "Filter by movement"
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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
                stroke="#8E8E93"
                strokeWidth={1.5}
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.movementSelectionContainer}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search movements..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#8E8E93"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={handleClearSearch}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                      stroke="#8E8E93"
                      strokeWidth={2}
                    />
                  </Svg>
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
                  All Movements
                </Text>
                {selectedMovements.length === 0 && (
                  <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000000">
                    <Path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </Svg>
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
                    <Svg width={20} height={20} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#000000">
                      <Path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </Svg>
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
              style={styles.clearAllButton} 
              onPress={handleReset}
            >
              <Text style={styles.clearAllButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  movementSelectionContainer: {
    flex: 1,
    paddingVertical: 20,
    alignSelf: 'stretch',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E93',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingRight: 10, // Add some space for the clear button
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
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  },
  applyButton: {
    width: '100%',
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  clearAllButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  clearAllButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
}); 