import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

interface AccountLoadingScreenProps {
  onComplete: () => void | Promise<void>;
}

export function AccountLoadingScreen({ onComplete }: AccountLoadingScreenProps) {
  useEffect(() => {
    // Show loading animation for 2 seconds for consistent experience
    const timer = setTimeout(async () => {
      await onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LottieView
          speed={1}
          source={require('../../../assets/animations/loading.json')}
          autoPlay
          style={styles.lottieAnimation}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d293d',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 500,
    height: 500,
  },
});
