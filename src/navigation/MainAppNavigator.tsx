import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeScreen } from '../screens/application/home/HomeScreen';
import { PerformanceScreen } from '../screens/application/performance/PerformanceScreen';
import { SettingsScreen } from '../screens/application/settings/SettingsScreen';
import { PersonalDetailsScreen } from '../screens/application/settings/PersonalDetailsScreen';
import { ShareScreen } from '../screens/application/settings/ShareScreen';
import { EditCurrentWeightScreen } from '../screens/application/settings/editPersonalDetails/EditCurrentWeightScreen';
import { EditHeightScreen } from '../screens/application/settings/editPersonalDetails/EditHeightScreen';
import { EditDateOfBirthScreen } from '../screens/application/settings/editPersonalDetails/EditDateOfBirthScreen';
import { EditGenderScreen } from '../screens/application/settings/editPersonalDetails/EditGenderScreen';
import { AddOptions } from '../screens/application/add/AddOptions';
import { RecordModal } from '../screens/application/add/record/RecordModal';
import { UploadModal } from '../screens/application/add/upload/UploadModal';
import { LiftDetails } from '../screens/application/feedback/liftDetails';
import { FeedbackSlideshow } from '../screens/application/feedback/feedbackSlideshow';
import { LibraryScreen } from '../screens/application/library/LibraryScreen';
import { FavouritesScreen } from '../screens/application/favourites/FavouritesScreen';
import { BottomNavigationBar } from './BottomNavigationBar';

// Types for navigation
export type MainTabParamList = {
  Home: undefined;
  Performance: undefined;
  Settings: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  PersonalDetails: undefined;
  Share: undefined;
  EditCurrentWeight: { currentValue: string };
  EditHeight: { currentValue: string };
  EditDateOfBirth: { currentValue: string };
  EditGender: { currentValue: string };
  RecordModal: undefined;
  UploadModal: undefined;
  LiftDetails: {
    liftData: {
      id: string;
      liftType: string;
      liftDate: string;
      accuracy: number;
      lineGraphValues: number[];
      weight: number;
      unit: string;
      sets: number;
      reps: number;
    };
  };
  FeedbackSlideshow: undefined;
  Library: undefined;
  Favourites: undefined;
};

type MainStackNavigationProp = StackNavigationProp<MainStackParamList>;

const Stack = createStackNavigator<MainStackParamList>();

// Wrapper components for screens that need navigation
function HomeScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleShowFeedback = (liftData: any) => {
    navigation.navigate('LiftDetails', { liftData });
  };

  const handleShowFeedbackSlideshow = () => {
    navigation.navigate('FeedbackSlideshow');
  };

  const handleShowLibrary = () => {
    navigation.navigate('Library');
  };

  const handleShowFavourites = () => {
    navigation.navigate('Favourites');
  };

  return (
    <HomeScreen 
      onShowFeedback={handleShowFeedback}
      onShowFeedbackSlideshow={handleShowFeedbackSlideshow}
      onShowLibrary={handleShowLibrary}
      onShowFavourites={handleShowFavourites}
    />
  );
}

function SettingsScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handlePersonalDetailsPress = () => {
    navigation.navigate('PersonalDetails');
  };

  const handleSharePress = () => {
    navigation.navigate('Share');
  };

  return (
    <SettingsScreen 
      onPersonalDetailsPress={handlePersonalDetailsPress}
      onSharePress={handleSharePress}
    />
  );
}

function PersonalDetailsScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditCurrentWeight = (data: any) => {
    navigation.navigate('EditCurrentWeight', { currentValue: data.currentWeight });
  };

  const handleEditHeight = (data: any) => {
    navigation.navigate('EditHeight', { currentValue: data.height });
  };

  const handleEditDateOfBirth = (data: any) => {
    navigation.navigate('EditDateOfBirth', { currentValue: data.dateOfBirth });
  };

  const handleEditGender = (data: any) => {
    navigation.navigate('EditGender', { currentValue: data.gender });
  };

  // Mock personal data - in real app this would come from context/state
  const personalData = {
    currentWeight: '75 kg',
    height: '175 cm',
    dateOfBirth: '15 March 1990',
    gender: 'Male',
  };

  return (
    <PersonalDetailsScreen 
      onBack={handleBack}
      onEditCurrentWeight={handleEditCurrentWeight}
      onEditHeight={handleEditHeight}
      onEditDateOfBirth={handleEditDateOfBirth}
      onEditGender={handleEditGender}
      personalData={personalData}
    />
  );
}

function ShareScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  return <ShareScreen onBack={handleBack} />;
}

function EditCurrentWeightScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'EditCurrentWeight'>>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // Here you would typically update the global state
    navigation.goBack();
  };

  return (
    <EditCurrentWeightScreen 
      onBack={handleBack}
      currentValue={route.params.currentValue}
      onSave={handleSave}
    />
  );
}

function EditHeightScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'EditHeight'>>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // Here you would typically update the global state
    navigation.goBack();
  };

  return (
    <EditHeightScreen 
      onBack={handleBack}
      currentValue={route.params.currentValue}
      onSave={handleSave}
    />
  );
}

function EditDateOfBirthScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'EditDateOfBirth'>>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // Here you would typically update the global state
    navigation.goBack();
  };

  return (
    <EditDateOfBirthScreen 
      onBack={handleBack}
      currentValue={route.params.currentValue}
      onSave={handleSave}
    />
  );
}

function EditGenderScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'EditGender'>>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // Here you would typically update the global state
    navigation.goBack();
  };

  return (
    <EditGenderScreen 
      onBack={handleBack}
      currentValue={route.params.currentValue}
      onSave={handleSave}
    />
  );
}

function RecordModalWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <RecordModal
      isVisible={true}
      onClose={handleClose}
    />
  );
}

function UploadModalWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <UploadModal
      isVisible={true}
      onClose={handleClose}
    />
  );
}

function LiftDetailsWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'LiftDetails'>>();
  
  const handleClose = () => {
    navigation.goBack();
  };

  const handleShowFeedbackSlideshow = () => {
    navigation.navigate('FeedbackSlideshow');
  };

  return (
    <LiftDetails
      onClose={handleClose}
      onShowFeedbackSlideshow={handleShowFeedbackSlideshow}
      liftData={route.params.liftData}
    />
  );
}

function FeedbackSlideshowWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <FeedbackSlideshow
      onClose={handleClose}
    />
  );
}

function LibraryScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  return <LibraryScreen onBack={handleBack} />;
}

function FavouritesScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  return <FavouritesScreen onBack={handleBack} />;
}

// Main tabs navigator with custom bottom navigation
function MainTabsNavigator() {
  const [activeTab, setActiveTab] = React.useState<'home' | 'performance' | 'settings'>('home');
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const navigation = useNavigation<MainStackNavigationProp>();

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
    navigation.navigate('UploadModal');
  };

  const handleRecordPress = () => {
    setShowAddOptions(false);
    navigation.navigate('RecordModal');
  };

  const renderScreenContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreenWrapper />;
      case 'performance':
        return <PerformanceScreen />;
      case 'settings':
        return <SettingsScreenWrapper />;
      default:
        return <HomeScreenWrapper />;
    }
  };

  return (
    <LinearGradient
      colors={['#F7EFFF', '#ffffff']}
      locations={[0, 0.75]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
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
      </SafeAreaView>
    </LinearGradient>
  );
}

// Main stack navigator
export function MainAppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        <Stack.Screen 
          name="PersonalDetails" 
          component={PersonalDetailsScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="Share" 
          component={ShareScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="EditCurrentWeight" 
          component={EditCurrentWeightScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="EditHeight" 
          component={EditHeightScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="EditDateOfBirth" 
          component={EditDateOfBirthScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="EditGender" 
          component={EditGenderScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="RecordModal" 
          component={RecordModalWrapper}
          options={{
            presentation: 'modal',
            animation: 'none',
          }}
        />
        <Stack.Screen 
          name="UploadModal" 
          component={UploadModalWrapper}
          options={{
            presentation: 'modal',
            animation: 'none',
          }}
        />
        <Stack.Screen 
          name="LiftDetails" 
          component={LiftDetailsWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="FeedbackSlideshow" 
          component={FeedbackSlideshowWrapper}
          options={{
            presentation: 'card',
            animation: 'scale_from_center',
          }}
        />
        <Stack.Screen 
          name="Library" 
          component={LibraryScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen 
          name="Favourites" 
          component={FavouritesScreenWrapper}
          options={{
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
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
    paddingBottom: 100,
  },
}); 