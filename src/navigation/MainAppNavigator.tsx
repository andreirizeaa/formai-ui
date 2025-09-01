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
import { UnitsDetailsScreen } from '../screens/application/settings/UnitsDetailsScreen';
import { ShareScreen } from '../screens/application/settings/ShareScreen';
import { EditCurrentWeightScreen } from '../screens/application/settings/editPersonalDetails/EditCurrentWeightScreen';
import { EditHeightScreen } from '../screens/application/settings/editPersonalDetails/EditHeightScreen';
import { EditDateOfBirthScreen } from '../screens/application/settings/editPersonalDetails/EditDateOfBirthScreen';
import { EditGenderScreen } from '../screens/application/settings/editPersonalDetails/EditGenderScreen';
import { AddOptions } from '../screens/application/add/AddOptions';
import { RecordModal } from '../screens/application/add/record/RecordModal';
import { UploadModal } from '../screens/application/add/upload/UploadModal';
import { LiftDetails } from '../screens/application/feedback/liftDetails';
import { ILiftData } from '../context/LiftDataContext';
import { FeedbackSlideshow } from '../screens/application/feedback/feedbackSlideshow';
import { LibraryScreen } from '../screens/application/library/LibraryScreen';
import { BottomNavigationBar } from './BottomNavigationBar';
import { useUserDetails } from '../context/UserDetailsContext';

// Types for navigation
export type MainTabParamList = {
  Home: undefined;
  Performance: undefined;
  Settings: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  PersonalDetails: undefined;
  UnitsDetails: undefined;
  Share: undefined;
  EditCurrentWeight: { currentValue: string };
  EditHeight: { currentValue: string };
  EditDateOfBirth: { currentValue: string };
  EditGender: { currentValue: string };
  RecordModal: undefined;
  UploadModal: undefined;
  LiftDetails: {
    liftData: ILiftData;
  };
  HowItWorks: {
    liftData: ILiftData;
  };
  FeedbackSlideshow: {
    liftData: ILiftData;
  };
  Library: { selectedFilters?: string[] };
};

type MainStackNavigationProp = StackNavigationProp<MainStackParamList>;

const Stack = createStackNavigator<MainStackParamList>();

// Declare global function type
declare global {
  var triggerAddOptions: (() => void) | undefined;
  var navigateToPerformance: (() => void) | undefined;
  var openUploadModal: (() => void) | undefined;
  var closeAddOptions: (() => void) | undefined;
  var openLiftDetails: (() => void) | undefined;
  var showFirstLiftDetails: (() => void) | undefined;
  var openHowItWorksModal: (() => void) | undefined;
}

// Wrapper components for screens that need navigation
function HomeScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleShowFeedback = (liftData: ILiftData) => {
    navigation.navigate('LiftDetails', { 
      liftData: liftData,
    });
  };

  const handleShowFeedbackSlideshow = () => {
    // Navigate to feedback slideshow
    // This will be implemented later
  };

  const handleShowLibrary = () => {
    navigation.navigate('Library', { selectedFilters: [] });
  };

  const handleShowShare = () => {
    navigation.navigate('Share');
  };

  const handleTriggerAddOptions = () => {
    // This will be handled by the parent component
    // For now, we'll need to expose this through the global trigger
    if (global.triggerAddOptions) {
      global.triggerAddOptions();
    }
  };

  const handleNavigateToPerformance = () => {
    // Navigate to performance tab
    // This will be handled by the parent component to switch tabs
    if (global.navigateToPerformance) {
      global.navigateToPerformance();
    }
  };

  return (
    <HomeScreen 
      onShowFeedback={handleShowFeedback}
      onShowFeedbackSlideshow={handleShowFeedbackSlideshow}
      onShowLibrary={handleShowLibrary}
      onShowShare={handleShowShare}
      onTriggerAddOptions={handleTriggerAddOptions}
      onNavigateToPerformance={handleNavigateToPerformance}
    />
  );
}

function SettingsScreenWrapper({ onLogout }: { onLogout?: () => void }) {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handlePersonalDetailsPress = () => {
    navigation.navigate('PersonalDetails');
  };

  const handleUnitsPress = () => {
    navigation.navigate('UnitsDetails');
  };

  const handleSharePress = () => {
    navigation.navigate('Share');
  };

  return (
    <SettingsScreen 
      onPersonalDetailsPress={handlePersonalDetailsPress}
      onUnitsPress={handleUnitsPress}
      onSharePress={handleSharePress}
      onLogout={onLogout}
    />
  );
}

function PerformanceScreenWrapper() {
  const handleTriggerAddOptions = () => {
    // This will be handled by the parent component
    // For now, we'll need to expose this through the global trigger
    if (global.triggerAddOptions) {
      global.triggerAddOptions();
    }
  };

  return (
    <PerformanceScreen 
      onTriggerAddOptions={handleTriggerAddOptions}
    />
  );
}

function PersonalDetailsScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const { userDetails, getWeightDisplay, getHeightDisplay, getDateOfBirthDisplay } = useUserDetails();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditCurrentWeight = (currentValue: string) => {
    navigation.navigate('EditCurrentWeight', { currentValue });
  };

  const handleEditHeight = (currentValue: string) => {
    navigation.navigate('EditHeight', { currentValue });
  };

  const handleEditDateOfBirth = (currentValue: string) => {
    navigation.navigate('EditDateOfBirth', { currentValue });
  };

  const handleEditGender = (currentValue: string) => {
    navigation.navigate('EditGender', { currentValue });
  };

  return (
    <PersonalDetailsScreen
      onBack={handleBack}
      onEditCurrentWeight={handleEditCurrentWeight}
      onEditHeight={handleEditHeight}
      onEditDateOfBirth={handleEditDateOfBirth}
      onEditGender={handleEditGender}
    />
  );
}

function UnitsDetailsScreenWrapper() {
  const navigation = useNavigation<MainStackNavigationProp>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <UnitsDetailsScreen
      onBack={handleBack}
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
  const { updateWeight } = useUserDetails();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // Parse the weight string to get the metric value for storage
    const weightMatch = newValue.match(/(\d+(?:\.\d+)?)\s*(kg|lbs)/);
    if (weightMatch) {
      const [, number, unit] = weightMatch;
      const weight = parseFloat(number);
      const weightKg = unit === 'kg' ? weight : weight * 0.453592;
      updateWeight(weightKg);
    }
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
  const { updateHeight } = useUserDetails();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // Parse the height string to get the metric value for storage
    let heightCm: number;
    
    if (newValue.includes('cm')) {
      const heightMatch = newValue.match(/(\d+)\s*cm/);
      if (heightMatch) {
        heightCm = parseFloat(heightMatch[1]);
      } else {
        heightCm = 170; // Default
      }
    } else {
      // Parse feet/inches format
      const feetMatch = newValue.match(/(\d+)'/);
      const inchesMatch = newValue.match(/(\d+)"/);
      if (feetMatch && inchesMatch) {
        const feet = parseInt(feetMatch[1]);
        const inches = parseInt(inchesMatch[1]);
        heightCm = (feet * 12 + inches) * 2.54;
      } else {
        heightCm = 170; // Default
      }
    }
    
    updateHeight(heightCm);
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
  const { updateUserDetails } = useUserDetails();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    // The newValue is already in DD-MM-YYYY format from EditDateOfBirthScreen
    // Just validate it's in the correct format before saving
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (dateRegex.test(newValue)) {
      updateUserDetails('dateOfBirth', newValue);
    } else {
      console.error('Invalid date format received:', newValue);
    }
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
  const { updateUserDetails } = useUserDetails();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = (newValue: string) => {
    updateUserDetails('gender', newValue);
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
    // Navigate directly to FeedbackSlideshow (which now includes How It Works)
    navigation.navigate('FeedbackSlideshow', { liftData: route.params.liftData });
  };

  const handleOpenFeedbackSlideshowDirectly = () => {
    // For tutorial: bypass HowItWorks and go directly to FeedbackSlideshow
    navigation.navigate('FeedbackSlideshow', { liftData: route.params.liftData });
  };

  // Expose functions globally for tutorial
  React.useEffect(() => {
    global.openFeedbackSlideshow = handleShowFeedbackSlideshow;
    
    return () => {
      delete global.openFeedbackSlideshow;
    };
  }, [handleShowFeedbackSlideshow]);

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
  const route = useRoute<RouteProp<MainStackParamList, 'FeedbackSlideshow'>>();
  
  const handleClose = () => {
    // Go back to LiftDetails
    navigation.goBack();
  };

  const handleNavigateToLiftDetails = () => {
    // Go back to LiftDetails
    navigation.goBack();
  };

  // Transform the liftData to match the expected format
  const transformedLiftData = route.params?.liftData ? {
    analysis: {
      feedback: route.params.liftData.analysis.feedback.map(item => ({
        imageURL: item.imageURL,
        flaws: item.flaws,
        improvement: item.improvement
      }))
    }
  } : undefined;

  return (
    <FeedbackSlideshow
      onClose={handleClose}
      onNavigateToLiftDetails={handleNavigateToLiftDetails}
      liftData={transformedLiftData}
    />
  );
}



function LibraryScreenWrapperWithProps() {
  const navigation = useNavigation<MainStackNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'Library'>>();
  
  const handleBack = () => {
    navigation.goBack();
  };

  const handleTriggerAddOptions = () => {
    // Check if we can go back, if not just trigger add options directly
    if (navigation.canGoBack()) {
      navigation.goBack();
      // Use a small delay to ensure navigation completes
      setTimeout(() => {
        if (global.triggerAddOptions) {
          global.triggerAddOptions();
        }
      }, 100);
    } else {
      // If we can't go back, just trigger add options directly
      if (global.triggerAddOptions) {
        global.triggerAddOptions();
      }
    }
  };

  return (
    <LibraryScreen 
      onBack={handleBack} 
      onTriggerAddOptions={handleTriggerAddOptions}
    />
  );
}

// Main tabs navigator with custom bottom navigation
function MainTabsNavigator({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = React.useState<'home' | 'progress' | 'settings'>('home');
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  const navigation = useNavigation<MainStackNavigationProp>();

  const handleTabPress = (tab: 'home' | 'progress' | 'settings') => {
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

  // Expose the add press function globally
  React.useEffect(() => {
    global.triggerAddOptions = handleAddPress;
    global.navigateToPerformance = () => handleTabPress('progress');
    global.navigateToSettings = () => handleTabPress('settings');
    global.navigateToHome = () => handleTabPress('home');
    global.navigateToPersonalDetails = () => {
      // Navigate to personal details screen
      navigation.navigate('PersonalDetails');
    };
    global.completeTutorialAndGoHome = () => {
      // Complete tutorial, remove temporary lift data, and navigate to home
      if (global.completeTutorial) {
        global.completeTutorial();
      }
      // Clear temporary lift data if available
      if (global.clearTemporaryLifts) {
        global.clearTemporaryLifts();
      }
      // Navigate to home tab
      handleTabPress('home');
    };
    global.openUploadModal = () => handleUploadPress();
    global.closeAddOptions = () => handleCloseAddOptions();
    global.openLiftDetails = () => {
      // Navigate to the first lift in the home screen
      // This will be handled by the HomeScreen to show the first lift's details
      if (global.showFirstLiftDetails) {
        global.showFirstLiftDetails();
      }
    };
  }, []);

  const renderScreenContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreenWrapper />;
      case 'progress':
        return <PerformanceScreenWrapper />;
      case 'settings':
        return <SettingsScreenWrapper onLogout={onLogout} />;
      default:
        return <HomeScreenWrapper />;
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#e2e8f0', '#ffffff']}
        locations={[0, 0.9]}
        style={styles.container}
        start={{ x: 0.5, y: 0 }}
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
        </SafeAreaView>
      </LinearGradient>

      <AddOptions
        isVisible={showAddOptions}
        onUploadPress={handleUploadPress}
        onRecordPress={handleRecordPress}
        onClose={handleCloseAddOptions}
      />
    </>
  );
}

// Main stack navigator
export function MainAppNavigator({ onLogout }: { onLogout?: () => void }) {
  return (
    <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainTabs">
            {() => <MainTabsNavigator onLogout={onLogout} />}
          </Stack.Screen>
          <Stack.Screen 
            name="PersonalDetails" 
            component={PersonalDetailsScreenWrapper}
            options={{
              presentation: 'card',
            }}
          />
          <Stack.Screen 
            name="UnitsDetails" 
            component={UnitsDetailsScreenWrapper}
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
            }}
          />

          <Stack.Screen 
            name="Library" 
            component={LibraryScreenWrapperWithProps}
            options={{
              presentation: 'card',
              freezeOnBlur: true, 
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