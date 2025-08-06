import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { SwipeableLineGraphCard } from '../../../components/ui/SwipeableLineGraphCard';
import { useLiftData } from '../../../context/LiftDataContext';

interface PerformanceScreenProps {
  onTriggerAddOptions?: () => void;
}

export function PerformanceScreen({ onTriggerAddOptions }: PerformanceScreenProps) {
  const { liftData } = useLiftData();
  
  // Generate card data based on all lift types that have data
  const cardData = useMemo(() => {
    // Get all unique lift types that have data
    const uniqueLiftTypes = [...new Set(liftData.map(lift => lift.liftType))];

    // Generate card data for each lift type
    return uniqueLiftTypes.map((liftType) => {
      // Get all lifts of this type
      const liftsOfType = liftData.filter(lift => lift.liftType === liftType);
      
      // Sort by weight (lowest to highest)
      const sortedLifts = liftsOfType.sort((a, b) => a.weightValue - b.weightValue);
      
      // Create chart data
      const chartData = {
        labels: sortedLifts.length > 6 
          ? sortedLifts.map((lift, index) => {
              if (index === 0 || index === sortedLifts.length - 1) {
                return `${lift.weightValue}kg`;
              }
              return '';
            })
          : sortedLifts.map(lift => `${lift.weightValue}kg`),
        datasets: [
          {
            data: sortedLifts.map(lift => lift.analysis.accuracy),
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      return {
        title: 'Accuracy per weight',
        subtitle: liftType,
        chartData
      };
    });
  }, [liftData]);

  // Generate accuracy over time card data
  const accuracyOverTimeData = useMemo(() => {
    // Get all unique lift types that have data
    const uniqueLiftTypes = [...new Set(liftData.map(lift => lift.liftType))];

    // Generate card data for each lift type
    return uniqueLiftTypes.map((liftType) => {
      // Get all lifts of this type
      const liftsOfType = liftData.filter(lift => lift.liftType === liftType);
      
      // Group lifts by date and average accuracy for each date
      const liftsByDate = liftsOfType.reduce((acc, lift) => {
        const date = lift.liftDate;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(lift);
        return acc;
      }, {} as Record<string, typeof liftsOfType>);

      // Calculate average accuracy for each date and sort by date
      const averagedLifts = Object.entries(liftsByDate)
        .map(([date, lifts]) => ({
          date,
          averageAccuracy: lifts.reduce((sum, lift) => sum + lift.analysis.accuracy, 0) / lifts.length
        }))
        .sort((a, b) => {
          // Parse DD-MM-YYYY format correctly
          const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
          };
          return parseDate(a.date).getTime() - parseDate(b.date).getTime();
        });
      
      // Format date for display
      const formatDate = (dateString: string) => {
        // Parse DD-MM-YYYY format correctly
        const [day, month, year] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
        return date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      };
      
      // Create chart data
      const chartData = {
        labels: averagedLifts.map((lift, index) => {
          if (index === 0 || index === averagedLifts.length - 1) {
            return formatDate(lift.date);
          }
          return '';
        }),
        datasets: [
          {
            data: averagedLifts.map(lift => lift.averageAccuracy),
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };

      return {
        title: 'Accuracy over time',
        subtitle: liftType,
        chartData
      };
    });
  }, [liftData]);

  // Check if there are no lifts
  const hasNoLifts = cardData.length === 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Performance</Text>
        
        {/* Performance Cards */}
        <SwipeableLineGraphCard 
          cardData={cardData}
          onTriggerAddOptions={onTriggerAddOptions}
          hasNoLifts={hasNoLifts}
        />

        {/* Accuracy Over Time Cards */}
        {!hasNoLifts && (
          <SwipeableLineGraphCard 
            cardData={accuracyOverTimeData}
            hasNoLifts={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 24,
  },
}); 