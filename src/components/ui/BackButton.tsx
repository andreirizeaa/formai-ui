import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { hapticFeedback } from '../../utils/haptic';
import { ChevronLeft } from 'lucide-react-native';

interface BackButtonProps {
  onPress: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    // Call onPress immediately for responsive navigation
    onPress();
    // Run haptic feedback asynchronously to avoid blocking
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#000000'} />
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