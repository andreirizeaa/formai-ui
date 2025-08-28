import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';

interface NextButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function NextButton({ title, onPress, disabled = false, loading = false }: NextButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isButtonDisabled = disabled || loading;

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: isButtonDisabled 
            ? (isDark ? '#2C2C2E' : '#E5E5EA')
            : (isDark ? '#FFFFFF' : '#000000')
        }
      ]} 
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={isDark ? '#666666' : '#999999'} 
        />
      ) : (
        <Text 
          style={[
            styles.text, 
            { 
              color: isButtonDisabled 
                ? (isDark ? '#666666' : '#999999')
                : (isDark ? '#000000' : '#FFFFFF'),
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
            }
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 40,
    height: 65,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 19,
    fontWeight: '500',
  },
}); 