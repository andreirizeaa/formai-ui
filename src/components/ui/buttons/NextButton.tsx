import React from 'react';
import { StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { OrangeGradientButton } from './OrangeGradientButton';

interface NextButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function NextButton({ title, onPress, disabled = false, loading = false }: NextButtonProps) {
  const isButtonDisabled = disabled || loading;

  return (
    <OrangeGradientButton
      title={title}
      onPress={onPress}
      disabled={isButtonDisabled}
      style={styles.container}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color="#FFFFFF" 
        />
      )}
    </OrangeGradientButton>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 40,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 