import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS
} from 'react-native-reanimated';

interface AnimatedOptionButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  isSelected: boolean;
  isDark: boolean;
  delay: number;
  style?: any;
  activeOpacity?: number;
}

export function AnimatedOptionButton({
  children,
  onPress,
  isSelected,
  isDark,
  delay,
  style,
  activeOpacity = 0.7
}: AnimatedOptionButtonProps) {
  const translateY = useSharedValue(delay === 0 ? 0 : 30);
  const opacity = useSharedValue(delay === 0 ? 1 : 0);

  useEffect(() => {
    // If delay is 0, don't animate - show immediately
    if (delay === 0) return;
    
    // Animate in with a staggered delay
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 25,
        stiffness: 200,
        mass: 0.6,
      })
    );
    
    opacity.value = withDelay(
      delay,
      withSpring(1, {
        damping: 25,
        stiffness: 200,
      })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isSelected
              ? '#000000'  // Black background when selected
              : 'transparent',
            borderColor: isSelected
              ? '#000000'  // Black border when selected
              : (isDark ? '#2C2C2E' : '#E5E5EA'),
          },
          style
        ]}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
}); 