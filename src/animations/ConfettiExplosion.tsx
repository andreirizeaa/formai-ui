import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Text } from "react-native";

const initialTopPosition = 0.5;
const explosionVelocity = 500;
const fallingSpeed = 4000;
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const confettieColors = [
  "#FF5733",
  "#FFC300",
  "#DAF7A6",
  "#C70039",
  "#900C3F",
  "#FF5733",
  "#FFC300",
  "#581845",
  "#33FF57",
  "#3375FF",
  "#F033FF",
];

const getRandomValue = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = (colors: string[]) => {
  return colors[Math.floor(getRandomValue(0, colors.length))];
};

interface ConfettiProps {
  contentTransform: any[];
  transform: any[];
  opacity: any;
  color: string;
}

const Confetti = ({ contentTransform, transform, opacity, color }: ConfettiProps) => {
  const confettiWidth = getRandomValue(8, 16);
  const confettiHeight = getRandomValue(6, 12);
  const isConfettiRounded = Math.round(getRandomValue(0, 1)) === 1;

  const containerStyle = { transform: contentTransform };
  const confettiStyle = {
    width: confettiWidth,
    height: confettiHeight,
    backgroundColor: color,
    transform,
    opacity,
  };

  return (
    <Animated.View style={[styles.confetti, containerStyle]} pointerEvents="none">
      <Animated.View style={[isConfettiRounded && styles.rounded, confettiStyle]} />
    </Animated.View>
  );
};

interface ExplosionProps {
  count: number;
  origin: { x: number; y: number };
  explosionSpeed?: number;
  fallSpeed?: number;
  colors?: string[];
  fadeOut?: boolean;
}

const Explosion = React.forwardRef<any, ExplosionProps>(
  (
    {
      count,
      origin,
      explosionSpeed = explosionVelocity,
      fallSpeed = fallingSpeed,
      colors = confettieColors,
      fadeOut,
    },
    ref
  ) => {
    const [confettiItems, setConfettiItems] = React.useState<any[]>([]);
    const animationValue = React.useRef(new Animated.Value(0)).current;

    const startAnimation = () => {
      animationValue.setValue(0);
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: explosionSpeed,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 2,
          duration: fallSpeed,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const stopAnimation = () => {
      animationValue.stopAnimation();
    };

    React.useImperativeHandle(ref, () => ({
      start: startAnimation,
      stop: stopAnimation,
    }));

    React.useEffect(() => {
      const newConfettiItems = Array(count)
        .fill(null)
        .map(() => ({
          leftDelta: getRandomValue(0, 1),
          topDelta: getRandomValue(initialTopPosition, 1),
          swingDelta: getRandomValue(0.2, 1),
          speedDelta: {
            rotateX: getRandomValue(0.3, 1),
            rotateY: getRandomValue(0.3, 1),
            rotateZ: getRandomValue(0.3, 1),
          },
          color: getRandomColor(colors),
        }));
      setConfettiItems(newConfettiItems);
    }, [count, colors]);

    return (
      <View style={styles.explosionContainer} pointerEvents="none">
        {confettiItems.map((item, index) => {
          const top = animationValue.interpolate({
            inputRange: [0, 1, 1 + item.topDelta, 2],
            outputRange: [origin.y, origin.y - item.topDelta * screenHeight, origin.y, origin.y],
          });
          const left = animationValue.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [origin.x, item.leftDelta * screenWidth, item.leftDelta * screenWidth],
          });
          const opacity = animationValue.interpolate({
            inputRange: [0, 1, 1.8, 2],
            outputRange: [1, 1, 1, fadeOut ? 0 : 1],
          });
          const translateX = animationValue.interpolate({
            inputRange: [0, 0.4, 1.2, 2],
            outputRange: [0, -(item.swingDelta * 30), item.swingDelta * 30, 0],
          });
          const rotateX = animationValue.interpolate({
            inputRange: [0, 2],
            outputRange: ["0deg", `${item.speedDelta.rotateX * 360 * 10}deg`],
          });
          const rotateY = animationValue.interpolate({
            inputRange: [0, 2],
            outputRange: ["0deg", `${item.speedDelta.rotateY * 360 * 5}deg`],
          });
          const rotateZ = animationValue.interpolate({
            inputRange: [0, 2],
            outputRange: ["0deg", `${item.speedDelta.rotateZ * 360 * 2}deg`],
          });
          const distanceOpacity = animationValue.interpolate({
            inputRange: [1, 2],
            outputRange: [1, 0.5],
            extrapolate: "clamp",
          });

          const combinedOpacity = Animated.multiply(opacity, distanceOpacity);
          const contentTransform = [{ translateX: left }, { translateY: top }];
          const transform = [{ rotateX }, { rotateY }, { rotate: rotateZ }, { translateX }];

          return (
            <Confetti
              key={index}
              contentTransform={contentTransform}
              transform={transform}
              opacity={combinedOpacity}
              color={item.color}
            />
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  explosionContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confetti: {
    position: "absolute",
    left: 0,
    top: -10,
    zIndex: 1,
  },
  rounded: {
    borderRadius: 100,
  },
});

export default Explosion; 