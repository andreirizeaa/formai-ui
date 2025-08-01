import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentLayoutProps {
  children: React.ReactNode;
  customButtons?: React.ReactNode;
}

export function PaymentLayout({
  children,
  customButtons,
}: PaymentLayoutProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#000000' : '#FFFFFF' }
      ]}
    >
      {/* Content area with vertical centering */}
      <View style={styles.contentWrapper}>
        <View style={styles.centeredContent}>
          {children}
        </View>
      </View>

      {/* Custom buttons at bottom */}
      {customButtons && (
        <View style={styles.customButtonsContainer}>
          {customButtons}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center', // Center content vertically
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center', // Center the content vertically within the available space
  },
  customButtonsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
}); 