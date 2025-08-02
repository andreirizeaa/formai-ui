import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';

interface OnboardingHeaderProps {
  title: string;
  subtitle?: string;
}

export function OnboardingHeader({ title, subtitle }: OnboardingHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <Text 
        style={[
          styles.title, 
          { 
            color: isDark ? '#FFFFFF' : '#000000',
            fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto'
          }
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text 
          style={[
            styles.subtitle, 
            { 
              color: isDark ? '#AEAEB2' : '#8E8E93',
              fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
            }
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
}); 