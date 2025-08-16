import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={[
      styles.track,
      { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }
    ]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${progress}%`,
            backgroundColor: isDark ? '#FFFFFF' : '#000000'
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
}); 