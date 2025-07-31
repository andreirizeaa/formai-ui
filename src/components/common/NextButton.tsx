import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';

interface NextButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function NextButton({ title, onPress, disabled = false }: NextButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: disabled 
            ? (isDark ? '#2C2C2E' : '#E5E5EA')
            : (isDark ? '#FFFFFF' : '#000000')
        }
      ]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text 
        style={[
          styles.text, 
          { 
            color: disabled 
              ? (isDark ? '#666666' : '#999999')
              : (isDark ? '#000000' : '#FFFFFF'),
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
          }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 34,
    marginBottom: 34,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
  },
}); 