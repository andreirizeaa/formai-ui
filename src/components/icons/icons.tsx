import React from 'react';
import Svg, { Circle, G } from 'react-native-svg';

// Default icon size
const DEFAULT_ICON_SIZE = 26;
const DEFAULT_COLOR = '#000000';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

// Circular Progress Chart Components
interface CircularProgressProps extends IconProps {
  percentage: number;
  progressColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  radius?: number;
  showTargetIcon?: boolean;
  iconColor?: string;
  iconSize?: number;
}

export function CircularProgressChart({ 
  width = 120, 
  height = 120, 
  percentage, 
  progressColor = DEFAULT_COLOR, 
  strokeWidth = 8,
  radius = 48,
  showTargetIcon = false,
  iconColor = "#000000",
  iconSize = 24
}: CircularProgressProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Background circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={'#f1f5f9'}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle - percentage filled */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${centerX} ${centerY})`}
      />
      {/* Inner circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius - strokeWidth - 8}
        fill="#FFFFFF"
      />
      {/* Target Icon in center with circular background */}
      {showTargetIcon && (
        <G transform={`translate(${centerX - iconSize/2}, ${centerY - iconSize/2})`}>
          {/* Circular background for the icon - matching back button style */}
          <Circle
            cx={iconSize/2}
            cy={iconSize/2}
            r={iconSize/2 + 6}
            fill="#f1f5f9"
          />
          {/* Target icon as SVG paths */}
          <Circle
            cx={iconSize/2}
            cy={iconSize/2}
            r={iconSize/2}
            fill="none"
            stroke={iconColor}
            strokeWidth={1.5}
          />
          <Circle
            cx={iconSize/2}
            cy={iconSize/2}
            r={iconSize/3}
            fill="none"
            stroke={iconColor}
            strokeWidth={1.5}
          />
          <Circle
            cx={iconSize/2}
            cy={iconSize/2}
            r={iconSize/6}
            fill={iconColor}
          />
        </G>
      )}
    </Svg>
  );
}


export function SingleDotIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="6"
        fill={color}
      />
    </Svg>
  );
}

export function ThreeDotsIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Top dot */}
      <Circle
        cx="12"
        cy="6"
        r="4"
        fill={color}
      />
      {/* Bottom left dot */}
      <Circle
        cx="7"
        cy="18"
        r="4"
        fill={color}
      />
      {/* Bottom right dot */}
      <Circle
        cx="17"
        cy="18"
        r="4"
        fill={color}
      />
    </Svg>
  );
}

export function SixDotsIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      {/* Left column - top */}
      <Circle
        cx="6"
        cy="4"
        r="3"
        fill={color}
      />
      {/* Left column - middle */}
      <Circle
        cx="6"
        cy="12"
        r="3"
        fill={color}
      />
      {/* Left column - bottom */}
      <Circle
        cx="6"
        cy="20"
        r="3"
        fill={color}
      />
      {/* Right column - top */}
      <Circle
        cx="18"
        cy="4"
        r="3"
        fill={color}
      />
      {/* Right column - middle */}
      <Circle
        cx="18"
        cy="12"
        r="3"
        fill={color}
      />
      {/* Right column - bottom */}
      <Circle
        cx="18"
        cy="20"
        r="3"
        fill={color}
      />
    </Svg>
  );
} 

 