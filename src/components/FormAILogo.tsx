import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';

interface FormAILogoProps {
  containerStyle?: any;
  iconSize?: number;
  textStyle?: any;
}

export function FormAILogo({ 
  containerStyle,
  iconSize = 40,
  textStyle
}: FormAILogoProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Image 
        source={require('../../assets/dumbel.svg')}
        style={{ width: iconSize, height: iconSize }}
        contentFit="contain"
      />
      <Text style={[styles.title, textStyle]}>
        Form AI
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
});
