import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

interface BottomNavigationBarProps {
  activeTab: 'home' | 'performance' | 'settings';
  onTabPress: (tab: 'home' | 'performance' | 'settings') => void;
  onAddPress: () => void;
}

interface TabIconProps {
  name: 'home' | 'performance' | 'settings';
  isActive: boolean;
  size?: number;
}

function TabIcon({ name, isActive, size = 32 }: TabIconProps) {
  const color = isActive ? '#000000' : '#8E8E93';
  
  const icons = {
    home: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    ),
    performance: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    ),
    settings: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          stroke={color}
          strokeWidth={2}
        />
        <Path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    ),
  };

  return icons[name];
}

export function BottomNavigationBar({ 
  activeTab, 
  onTabPress, 
  onAddPress 
}: BottomNavigationBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Top separator line */}
      <View style={styles.separator} />
      
      {/* Navigation bar */}
      <View style={[styles.navigationBar, { paddingBottom: insets.bottom + 8 }]}>
        {/* Home Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabPress('home')}
          activeOpacity={0.7}
        >
          <TabIcon name="home" isActive={activeTab === 'home'} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'home' ? '#000000' : '#8E8E93' }
          ]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Performance Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabPress('performance')}
          activeOpacity={0.7}
        >
          <TabIcon name="performance" isActive={activeTab === 'performance'} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'performance' ? '#000000' : '#8E8E93' }
          ]}>
            Performance
          </Text>
        </TouchableOpacity>

        {/* Settings Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabPress('settings')}
          activeOpacity={0.7}
        >
          <TabIcon name="settings" isActive={activeTab === 'settings'} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'settings' ? '#000000' : '#8E8E93' }
          ]}>
            Settings
          </Text>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#C6C6C8',
    marginHorizontal: 16,
  },
  navigationBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'System',
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -50,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 50,
    fontWeight: '300',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: 50,
  },
}); 