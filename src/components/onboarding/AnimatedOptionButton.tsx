import React, { useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS,
  withSequence
} from 'react-native-reanimated';

interface AnimatedOptionButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  isSelected: boolean;
  isDark: boolean;
  delay: number;
  style?: any;
  activeOpacity?: number;
  hasIcon?: boolean; // New prop to indicate if the button has an icon
}

export function AnimatedOptionButton({
  children,
  onPress,
  isSelected,
  isDark,
  delay,
  style,
  activeOpacity = 0.7,
  hasIcon = false // Default to false
}: AnimatedOptionButtonProps) {
  const translateY = useSharedValue(delay === 0 ? 0 : 30);
  const opacity = useSharedValue(delay === 0 ? 1 : 0);
  const scale = useSharedValue(1);

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
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    // Bounce animation: scale down to 0.95, then back to 1 (slightly faster)
    scale.value = withSequence(
      withSpring(0.95, {
        damping: 18,
        stiffness: 250,
        mass: 0.6,
      }),
      withSpring(1, {
        damping: 18,
        stiffness: 250,
        mass: 0.6,
      })
    );
    
    // Call the original onPress function
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isSelected
              ? '#000000'  // Black background when selected
              : '#F4F4F8',
            paddingVertical: hasIcon ? 14 : 22, // Conditional padding
          },
          style
        ]}
        onPress={handlePress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    // borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 24,
  },
}); 