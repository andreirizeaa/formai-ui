import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomNavigationBar } from '../../navigation/BottomNavigationBar';
import { HomeScreen } from '../../screens/application/home/HomeScreen';
import { PerformanceScreen } from '../../screens/application/performance/PerformanceScreen';
import { SettingsScreen } from '../../screens/application/settings/SettingsScreen';
import { AddOptions } from '../../screens/application/add/AddOptions';
import { RecordModal } from '../../screens/application/add/record/RecordModal';
import { UploadScreen } from '../../screens/application/add/upload/UploadScreen';

interface MainAppLayoutProps {
  children?: React.ReactNode;
}

export function MainAppLayout({ children }: MainAppLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'performance' | 'settings'>('home');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUploadScreen, setShowUploadScreen] = useState(false);

  const handleTabPress = (tab: 'home' | 'performance' | 'settings') => {
    setActiveTab(tab);
  };

  const handleAddPress = () => {
    setShowAddOptions(true);
  };

  const handleCloseAddOptions = () => {
    setShowAddOptions(false);
  };

  const handleUploadPress = () => {
    setShowAddOptions(false);
    setShowUploadScreen(true);
  };

  const handleRecordPress = () => {
    setShowAddOptions(false);
    setShowRecordModal(true);
  };

  const handleCloseRecordModal = () => {
    setShowRecordModal(false);
  };

  const handleCloseUploadScreen = () => {
    setShowUploadScreen(false);
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
    <LinearGradient
      colors={['#ddd6ff', '#ffffff']}
      locations={[0, 0.75]}
      style={styles.container}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {renderScreenContent()}
        </View>
        
        <BottomNavigationBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          onAddPress={handleAddPress}
        />

        <AddOptions
          isVisible={showAddOptions}
          onUploadPress={handleUploadPress}
          onRecordPress={handleRecordPress}
          onClose={handleCloseAddOptions}
        />

        <RecordModal
          isVisible={showRecordModal}
          onClose={handleCloseRecordModal}
        />

        <UploadScreen
          isVisible={showUploadScreen}
          onClose={handleCloseUploadScreen}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for bottom navigation bar
  },
}); 