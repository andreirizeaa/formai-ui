import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import i18n from '../../utils/i18n';
import Svg, { Line, Circle, Text as SvgText, G } from 'react-native-svg';

interface ProgressScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function ProgressScreen({ onNext, onBack }: ProgressScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = Dimensions.get('window');
  
  // Chart configuration
  const chartWidth = screenWidth - 80;
  const chartHeight = 250;
  const padding = 40;
  
  // Dummy data showing improvement over 12 weeks
  const data = [
    { week: 0, score: 45 },
    { week: 1, score: 52 },
    { week: 2, score: 58 },
    { week: 3, score: 63 },
    { week: 4, score: 68 },
    { week: 5, score: 72 },
    { week: 6, score: 76 },
    { week: 7, score: 79 },
    { week: 8, score: 82 },
    { week: 9, score: 85 },
    { week: 10, score: 87 },
    { week: 11, score: 89 },
    { week: 12, score: 92 },
  ];
  
  // Calculate chart coordinates
  const maxWeek = Math.max(...data.map(d => d.week));
  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));
  
  const getX = (week: number) => padding + (week / maxWeek) * (chartWidth - 2 * padding);
  const getY = (score: number) => chartHeight - padding - ((score - minScore) / (maxScore - minScore)) * (chartHeight - 2 * padding);

  const lineColor = isDark ? '#FFFFFF' : '#000000';
  const gridColor = isDark ? '#2C2C2E' : '#E5E5EA';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <OnboardingLayout
      title={i18n.t('progress.title')}
      subtitle={i18n.t('progress.subtitle')}
      currentStep={6}
      totalSteps={12}
      onBack={onBack}
      onNext={onNext}
      nextTitle={i18n.t('next')}
      nextDisabled={false}
    >
      <View style={styles.container}>
        <Text style={[styles.chartTitle, { color: textColor }]}>
          {i18n.t('progress.chartTitle')}
        </Text>
        
        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid lines */}
            {[0, 2, 4, 6, 8, 10, 12].map(week => (
              <Line
                key={`grid-${week}`}
                x1={getX(week)}
                y1={padding}
                x2={getX(week)}
                y2={chartHeight - padding}
                stroke={gridColor}
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Y-axis grid lines */}
            {[50, 60, 70, 80, 90].map(score => (
              <Line
                key={`grid-y-${score}`}
                x1={padding}
                y1={getY(score)}
                x2={chartWidth - padding}
                y2={getY(score)}
                stroke={gridColor}
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Main chart line */}
            <G>
              {data.slice(0, -1).map((point, index) => {
                const nextPoint = data[index + 1];
                return (
                  <Line
                    key={index}
                    x1={getX(point.week)}
                    y1={getY(point.score)}
                    x2={getX(nextPoint.week)}
                    y2={getY(nextPoint.score)}
                    stroke={lineColor}
                    strokeWidth={3}
                  />
                );
              })}
              
              {/* Data points */}
              {data.map((point, index) => (
                <Circle
                  key={index}
                  cx={getX(point.week)}
                  cy={getY(point.score)}
                  r={4}
                  fill={lineColor}
                />
              ))}
            </G>
            
            {/* Axis labels */}
            <SvgText
              x={chartWidth / 2}
              y={chartHeight}
              fontSize="14"
              fill={textColor}
              textAnchor="middle"
              fontFamily={isDark ? 'SF Pro Text' : 'Roboto'}
            >
              {i18n.t('progress.week')}
            </SvgText>
            
            <SvgText
              x={15}
              y={chartHeight / 2}
              fontSize="14"
              fill={textColor}
              textAnchor="middle"
              fontFamily={isDark ? 'SF Pro Text' : 'Roboto'}
              transform={`rotate(-90, 15, ${chartHeight / 2})`}
            >
              {i18n.t('progress.score')}
            </SvgText>
            
            {/* Week labels */}
            {[0, 4, 8, 12].map(week => (
              <SvgText
                key={`week-${week}`}
                x={getX(week)}
                y={chartHeight - 16}
                fontSize="12"
                fill={textColor}
                textAnchor="middle"
                fontFamily={isDark ? 'SF Pro Text' : 'Roboto'}
              >
                {week}
              </SvgText>
            ))}
            
            {/* Score labels */}
            {[50, 70, 90].map(score => (
              <SvgText
                key={`score-${score}`}
                x={30}
                y={getY(score) + 4}
                fontSize="12"
                fill={textColor}
                textAnchor="middle"
                fontFamily={isDark ? 'SF Pro Text' : 'Roboto'}
              >
                {score}
              </SvgText>
            ))}
          </Svg>
        </View>
        
        <View style={[styles.improvementStats, { 
          borderColor: isDark ? '#FFF' : '#000',
        }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>+104%</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {i18n.t('progress.formImprovement')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: textColor }]}>12</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {i18n.t('progress.weeksToExcellence')}
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  chartContainer: {
    marginBottom: 30,
  },
  improvementStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 2,
    borderRadius: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 