import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigationBar } from '../../navigation/BottomNavigationBar';
import { HomeScreen } from '../../screens/application/home/HomeScreen';
import { PerformanceScreen } from '../../screens/application/performance/PerformanceScreen';
import { SettingsScreen } from '../../screens/application/settings/SettingsScreen';
import { CameraModal } from '../../screens/application/cameraModal/CameraModal';

interface MainAppLayoutProps {
  children?: React.ReactNode;
}

export function MainAppLayout({ children }: MainAppLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'performance' | 'settings'>('home');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleTabPress = (tab: 'home' | 'performance' | 'settings') => {
    setActiveTab(tab);
  };

  const handleAddPress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const renderScreenContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'performance':
        return <PerformanceScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return children;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreenContent()}
      </View>
      
      <BottomNavigationBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onAddPress={handleAddPress}
      />

      <CameraModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for bottom navigation bar
  },
}); 