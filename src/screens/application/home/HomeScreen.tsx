import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hapticFeedback } from '../../../utils/haptic';

interface HomeScreenProps {
  onShowFeedback: (liftData: LiftData) => void;
  onShowFeedbackSlideshow: () => void;
}

interface LiftData {
  id: string;
  liftType: string;
  liftDate: string;
  accuracy: number;
  lineGraphValues: number[];
  weight: number;
  unit: string;
  sets: number;
  reps: number;
}

export function HomeScreen({ onShowFeedback, onShowFeedbackSlideshow }: HomeScreenProps) {
  // Dummy data for recent lifts
  const recentLifts: LiftData[] = [
    {
      id: '1',
      liftType: 'Bench Press',
      liftDate: 'Today, 2:30 PM',
      accuracy: 87,
      lineGraphValues: [95, 92, 90, 88, 85, 87, 89, 91],
      weight: 85,
      unit: 'KG',
      sets: 3,
      reps: 8,
    },
    {
      id: '2',
      liftType: 'Shoulder Press',
      liftDate: 'Today, 2:40 PM',
      accuracy: 98,
      lineGraphValues: [95, 92, 90, 88, 85, 87, 89, 91],
      weight: 85,
      unit: 'KG',
      sets: 3,
      reps: 8,
    },
  ];

  const handleLiftPress = (lift: LiftData) => {
    hapticFeedback.selection();
    onShowFeedback(lift);
  };

  function LiftCard({ lift }: { lift: LiftData }) {
    return (
      <TouchableOpacity 
        style={styles.liftCard}
        onPress={() => handleLiftPress(lift)}
        activeOpacity={0.7}
      >
        <View style={styles.liftHeader}>
          <Text style={styles.liftName}>{lift.liftType}</Text>
          <Text style={styles.liftDate}>{lift.liftDate}</Text>
        </View>
        <View style={styles.liftAccuracyContainer}>
          <Text style={styles.accuracyLabel}>Accuracy</Text>
          <View style={styles.accuracyPill}>
            <Text style={styles.accuracyValue}>{lift.accuracy}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../../../assets/formai-light-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Spacer to push content to bottom */}
      <View style={styles.spacer} />
      
      <View style={styles.bottomContent}>
        <Text style={styles.sectionTitle}>Recent Lifts</Text>
        <View 
          style={styles.liftsScrollView} 
        >
          {recentLifts.map((lift) => (
            <LiftCard key={lift.id} lift={lift} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -52,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  logo: {
    width: 110,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'SF Pro Display',
  },
  liftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  liftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liftName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  liftDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    fontFamily: 'SF Pro Text',
  },
  liftAccuracyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
  },
  accuracyPill: {
    backgroundColor: '#000',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  spacer: {
    flex: 1,
  },
  bottomContent: {
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  liftsScrollView: {
    maxHeight: 180,
    backgroundColor: 'transparent',
  },
  liftsScrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    paddingBottom: 20,
  },
}); 