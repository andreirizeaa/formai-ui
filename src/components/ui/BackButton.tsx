import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { hapticFeedback } from '../../utils/haptic';

interface BackButtonProps {
  onPress: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    hapticFeedback.selection();
    onPress();
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons 
        name="chevron-back" 
        size={20} 
        color={isDark ? '#FFFFFF' : '#000000'} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
}); 