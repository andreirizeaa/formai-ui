import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      <View style={styles.contentWrapper}>
        <Text style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#000000' }
        ]}>
          Home page
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
}); 