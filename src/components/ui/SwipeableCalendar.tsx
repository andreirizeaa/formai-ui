import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { hapticFeedback } from '../../utils/haptic';

interface SwipeableCalendarProps {
  onDateSelect?: (date: Date) => void;
  initialSelectedDate?: Date;
  daysLogged?: string[]; // Format: MM-DD-YYYY
}

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  isActive: boolean;
  isLogged: boolean;
}

export function SwipeableCalendar({ onDateSelect, initialSelectedDate, daysLogged = [] }: SwipeableCalendarProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate || new Date());
  const translateX = useSharedValue(0);
  
  // Helper function to format date as DD-MM-YYYY
  const formatDateAsDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Generate weeks of data based on week offset
  const generateWeekData = useCallback((weekOffset: number): DayData[] => {
    const today = new Date();
    
    // Calculate the start of the current week (Sunday)
    const startOfCurrentWeek = new Date(today);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startOfCurrentWeek.setDate(today.getDate() - dayOfWeek);
    
    // Calculate the start of the target week based on offset
    const startOfTargetWeek = new Date(startOfCurrentWeek);
    startOfTargetWeek.setDate(startOfCurrentWeek.getDate() + (weekOffset * 7));
    
    const days: DayData[] = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfTargetWeek);
      date.setDate(startOfTargetWeek.getDate() + i);
      
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
      const isActive = isSelected;
      
      // Format the date as DD-MM-YYYY for comparison with daysLogged array
      const formattedDate = formatDateAsDDMMYYYY(date);
      const isLogged = daysLogged.includes(formattedDate);
            
      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate().toString(),
        isToday,
        isActive,
        isLogged,
      });
    }
    
    return days;
  }, [selectedDate, daysLogged]);

  const currentWeek = generateWeekData(currentWeekOffset);
  
  const handleDatePress = (dayData: DayData) => {
    setSelectedDate(dayData.date);
    if (onDateSelect) {
      onDateSelect(dayData.date);
    }
  };

  const handleWeekChange = (direction: 'left' | 'right') => {
    // Fix the direction mapping: left swipe should go to previous week, right swipe to next week
    const newOffset = direction === 'left' 
      ? currentWeekOffset - 1  // Previous week
      : currentWeekOffset + 1; // Next week
    
    // Prevent going to future weeks (when currentWeekOffset is 0, which is the current week)
    if (direction === 'right' && currentWeekOffset === 0) {
      // Don't allow swiping to next week when we're on the current week
      hapticFeedback.error();
      return;
    }
    hapticFeedback.selection();

    
    setCurrentWeekOffset(newOffset);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const threshold = 50;
      // Fix the gesture direction mapping
      if (event.translationX > threshold) {
        // Swipe right (positive translation) = go to previous week
        runOnJS(handleWeekChange)('left');
      } else if (event.translationX < -threshold) {
        // Swipe left (negative translation) = go to next week
        runOnJS(handleWeekChange)('right');
      }
      translateX.value = withSpring(0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.calendarContainer, animatedStyle]}>
          <View style={styles.daysContainer}>
            {currentWeek.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dayContainer}
                onPress={() => handleDatePress(day)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.dayCircle,
                  day.isToday && day.isLogged ? styles.todayLoggedCircle :
                  day.isLogged ? styles.loggedDayCircle :
                  day.isToday && day.isActive ? styles.todaySelectedCircle : 
                  day.isToday ? styles.todayCircle : 
                  day.isActive ? styles.selectedCircle : styles.inactiveDayCircle
                ]}>
                  <Text style={[
                    styles.dayName,
                    day.isActive ? styles.activeDayText : styles.inactiveDayText
                  ]}>
                    {day.dayName}
                  </Text>
                </View>
                <Text style={[
                  styles.dayNumber,
                  day.isActive ? styles.activeDayText : styles.inactiveDayText
                ]}>
                  {day.dayNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  calendarContainer: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingBottom: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  inactiveDayCircle: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  activeDayCircle: {
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  inactiveDayText: {
    color: '#9CA3AF',
  },
  activeDayText: {
    color: '#000000',
    fontWeight: '700',
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: '#9CA3AF',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  todaySelectedCircle: {
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  loggedDayCircle: {
    borderWidth: 1.5,
    borderColor: '#ff6900',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  todayLoggedCircle: {
    borderWidth: 2,
    borderColor: '#ed694a',
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
}); 