import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, Keyboard } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface MovementSelectionScreenProps {
  selectedMovement: string;
  searchQuery: string;
  filteredMovements: string[];
  onMovementSelect: (movement: string) => void;
  onSearchChange: (text: string) => void;
  onBack: () => void;
  onUpload: () => void;
  onClose: () => void;
  title?: string;
}

export function MovementSelectionScreen({
  selectedMovement,
  searchQuery,
  filteredMovements,
  onMovementSelect,
  onSearchChange,
  onBack,
  onUpload,
  onClose,
  title = "Upload Video"
}: MovementSelectionScreenProps) {
  return (
    <>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.movementSelectionContainer}>
          <Text style={styles.movementSelectionTitle}>What exercise were you doing?</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movements..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#8E8E93"
          />
          
          <ScrollView style={styles.movementsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {filteredMovements.map((movement, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.movementItem,
                  selectedMovement === movement && styles.movementItemSelected
                ]}
                onPress={() => onMovementSelect(movement)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <Text style={[
                  styles.movementItemText,
                  selectedMovement === movement && styles.movementItemTextSelected
                ]}>
                  {movement}
                </Text>
                {selectedMovement === movement && (
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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.uploadButton, !selectedMovement && styles.uploadButtonDisabled]} 
            onPress={onUpload}
            disabled={!selectedMovement}
          >
            <Text style={[styles.uploadButtonText, !selectedMovement && styles.uploadButtonTextDisabled]}>
              Upload
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,

  },
  movementSelectionContainer: {
    flex: 1,
    paddingVertical: 20,
    alignSelf: 'stretch',
  },
  movementSelectionTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E93',
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginBottom: 20,
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
    backgroundColor: '#E0E0E0',
  },
  movementItemText: {
    fontSize: 17,
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
    marginBottom: 10,
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
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  uploadButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.7,
  },
  uploadButtonTextDisabled: {
    color: '#C7C7CC',
  },
}); 