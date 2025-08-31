import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { hapticFeedback } from '../../utils/haptic';
import { useUserCheckIns } from '../../context/UserCheckInsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WEEK_WIDTH = SCREEN_WIDTH * 0.9; // ✅ narrower than screen
const WEEK_HEIGHT = 80;

interface SwipeableCalendarProps {
  onDateSelect?: (date: Date) => void;
  initialSelectedDate?: Date;
}

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  isActive: boolean;
  isLogged: boolean;
}

export function SwipeableCalendar({ onDateSelect, initialSelectedDate }: SwipeableCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDate || new Date()
  );
  const { daysLogged } = useUserCheckIns();

  const formatDateAsDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const generateWeekData = useCallback(
    (weekOffset: number): DayData[] => {
      const today = new Date();
      const startOfCurrentWeek = new Date(today);
      const dayOfWeek = today.getDay();
      startOfCurrentWeek.setDate(today.getDate() - dayOfWeek);

      const startOfTargetWeek = new Date(startOfCurrentWeek);
      startOfTargetWeek.setDate(startOfCurrentWeek.getDate() + weekOffset * 7);

      const days: DayData[] = [];
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfTargetWeek);
        date.setDate(startOfTargetWeek.getDate() + i);

        const isToday = date.toDateString() === today.toDateString();
        const isSelected = selectedDate
          ? date.toDateString() === selectedDate.toDateString()
          : false;

        const formattedDate = formatDateAsDDMMYYYY(date);
        const isLogged = daysLogged.includes(formattedDate);

        days.push({
          date,
          dayName: dayNames[i],
          dayNumber: date.getDate().toString(),
          isToday,
          isActive: isSelected,
          isLogged,
        });
      }

      return days;
    },
    [selectedDate, daysLogged]
  );

  const WEEKS_BACK = 12;
  const weeks: DayData[][] = [];
  for (let i = -WEEKS_BACK; i <= 0; i++) {
    weeks.push(generateWeekData(i));
  }

  const handleDatePress = (dayData: DayData) => {
    setSelectedDate(dayData.date);
    if (onDateSelect) {
      onDateSelect(dayData.date);
    }
  };

  return (
    <View style={styles.container}>
      <Carousel
        loop={false}
        width={SCREEN_WIDTH}        // ✅ page = full screen
        height={WEEK_HEIGHT}
        data={weeks}
        renderItem={({ item }) => (
          <View style={styles.weekPage}>
            <View style={styles.weekContent}>
              {item.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dayContainer}
                  onPress={() => handleDatePress(day)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      day.isToday && day.isActive
                        ? styles.todaySelectedCircle
                        : day.isToday
                        ? styles.todayCircle
                        : day.isActive && day.isLogged
                        ? styles.loggedDayCircle
                        : day.isActive
                        ? styles.selectedCircle
                        : day.isLogged
                        ? styles.loggedDayCircle
                        : styles.inactiveDayCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        day.isLogged && !day.isToday
                          ? styles.loggedDayText
                          : day.isActive
                          ? styles.activeDayText
                          : styles.inactiveDayText,
                      ]}
                    >
                      {day.dayName}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.dayNumber,
                      day.isActive ? styles.activeDayText : styles.inactiveDayText,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        defaultIndex={weeks.length - 1}
        pagingEnabled
        snapEnabled
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
  },
  weekPage: {
    width: SCREEN_WIDTH,          // ✅ full page
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekContent: {
    width: WEEK_WIDTH,            // ✅ narrower, centered
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
  selectedCircle: {
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
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
  loggedDayCircle: {
    borderWidth: 1.5,
    borderColor: '#ff6900',
    borderStyle: 'solid',
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
  loggedDayText: {
    color: '#ff6900',
    fontWeight: '600',
  },
});
