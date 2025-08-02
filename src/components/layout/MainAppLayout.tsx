import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomNavigationBar } from '../../navigation/BottomNavigationBar';
import { HomeScreen } from '../../screens/application/home/HomeScreen';
import { PerformanceScreen } from '../../screens/application/performance/PerformanceScreen';
import { SettingsScreen } from '../../screens/application/settings/SettingsScreen';
import { PersonalDetailsScreen } from '../../screens/application/settings/PersonalDetailsScreen';
import { EditCurrentWeightScreen } from '../../screens/application/settings/editPersonalDetails/EditCurrentWeightScreen';
import { EditHeightScreen } from '../../screens/application/settings/editPersonalDetails/EditHeightScreen';
import { EditDateOfBirthScreen } from '../../screens/application/settings/editPersonalDetails/EditDateOfBirthScreen';
import { EditGenderScreen } from '../../screens/application/settings/editPersonalDetails/EditGenderScreen';
import { AddOptions } from '../../screens/application/add/AddOptions';
import { RecordModal } from '../../screens/application/add/record/RecordModal';
import { UploadScreen } from '../../screens/application/add/upload/UploadScreen';
import { LiftDetails } from '../../screens/application/feedback/liftDetails';
import { FeedbackSlideshow } from '../../screens/application/feedback/feedbackSlideshow';
import { hapticFeedback } from '../../utils/haptic';

interface MainAppLayoutProps {
  children?: React.ReactNode;
}

interface PersonalData {
  currentWeight: string;
  height: string;
  dateOfBirth: string;
  gender: string;
}

export function MainAppLayout({ children }: MainAppLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'performance' | 'settings'>('home');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showUploadScreen, setShowUploadScreen] = useState(false);
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [showEditCurrentWeight, setShowEditCurrentWeight] = useState(false);
  const [showEditHeight, setShowEditHeight] = useState(false);
  const [showEditDateOfBirth, setShowEditDateOfBirth] = useState(false);
  const [showEditGender, setShowEditGender] = useState(false);
  const [showLiftDetails, setShowLiftDetails] = useState(false);
  const [showFeedbackSlideshow, setShowFeedbackSlideshow] = useState(false);
  const [selectedLift, setSelectedLift] = useState<any>(null);
  const [currentPersonalData, setCurrentPersonalData] = useState<PersonalData | null>(null);
  const [personalData, setPersonalData] = useState<PersonalData>({
    currentWeight: '75 kg',
    height: '175 cm',
    dateOfBirth: '15 March 1990',
    gender: 'Male',
  });
  const slideAnim = useRef(new Animated.Value(0)).current;
  const editSlideAnim = useRef(new Animated.Value(0)).current;
  const liftDetailsSlideAnim = useRef(new Animated.Value(400)).current;
  const feedbackSlideshowAnim = useRef(new Animated.Value(0)).current;

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
    hapticFeedback.selection();
    setShowRecordModal(false);
  };

  const handleCloseUploadScreen = () => {
    hapticFeedback.selection();
    setShowUploadScreen(false);
  };

  const handleShowLiftDetails = (liftData: any) => {
    hapticFeedback.selection();
    setSelectedLift(liftData);
    setShowLiftDetails(true);
    
    // Animate slide in from right
    Animated.timing(liftDetailsSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseLiftDetails = () => {
    // Animate slide out to right
    Animated.timing(liftDetailsSlideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowLiftDetails(false);
      setSelectedLift(null);
    });
  };

  const handleShowFeedbackSlideshow = () => {
    setShowFeedbackSlideshow(true);
    
    // Animate scale in from center
    Animated.timing(feedbackSlideshowAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseFeedbackSlideshow = () => {
    // Animate scale out to center
    Animated.timing(feedbackSlideshowAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowFeedbackSlideshow(false);
    });
  };

  const handlePersonalDetailsPress = () => {
    setShowPersonalDetails(true);
    // Animate slide in from right
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePersonalDetailsBack = () => {
    // Animate slide out to right
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPersonalDetails(false);
    });
  };

  const handleEditCurrentWeightPress = (data: PersonalData) => {
    setCurrentPersonalData(data);
    setShowEditCurrentWeight(true);
    // Animate slide in from right
    Animated.timing(editSlideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleEditCurrentWeightBack = () => {
    // Animate slide out to right
    Animated.timing(editSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowEditCurrentWeight(false);
      setCurrentPersonalData(null);
    });
  };

  const handleEditCurrentWeightSave = (newValue: string) => {
    // Update the personal data
    setPersonalData(prev => ({ ...prev, currentWeight: newValue }));
    handleEditCurrentWeightBack();
  };

  const handleEditHeightPress = (data: PersonalData) => {
    setCurrentPersonalData(data);
    setShowEditHeight(true);
    // Animate slide in from right
    Animated.timing(editSlideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleEditHeightBack = () => {
    // Animate slide out to right
    Animated.timing(editSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowEditHeight(false);
      setCurrentPersonalData(null);
    });
  };

  const handleEditHeightSave = (newValue: string) => {
    // Update the personal data
    setPersonalData(prev => ({ ...prev, height: newValue }));
    handleEditHeightBack();
  };

  const handleEditDateOfBirthPress = (data: PersonalData) => {
    setCurrentPersonalData(data);
    setShowEditDateOfBirth(true);
    // Animate slide in from right
    Animated.timing(editSlideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleEditDateOfBirthBack = () => {
    // Animate slide out to right
    Animated.timing(editSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowEditDateOfBirth(false);
      setCurrentPersonalData(null);
    });
  };

  const handleEditDateOfBirthSave = (newValue: string) => {
    // Update the personal data
    setPersonalData(prev => ({ ...prev, dateOfBirth: newValue }));
    handleEditDateOfBirthBack();
  };

  const handleEditGenderPress = (data: PersonalData) => {
    setCurrentPersonalData(data);
    setShowEditGender(true);
    // Animate slide in from right
    Animated.timing(editSlideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleEditGenderBack = () => {
    // Animate slide out to right
    Animated.timing(editSlideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowEditGender(false);
      setCurrentPersonalData(null);
    });
  };

  const handleEditGenderSave = (newValue: string) => {
    // Update the personal data
    setPersonalData(prev => ({ ...prev, gender: newValue }));
    handleEditGenderBack();
  };

  const renderScreenContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onShowFeedback={handleShowLiftDetails} onShowFeedbackSlideshow={handleShowFeedbackSlideshow} />;
      case 'performance':
        return <PerformanceScreen />;
      case 'settings':
        return <SettingsScreen onPersonalDetailsPress={handlePersonalDetailsPress} />;
      default:
        return children;
    }
  };

  return (
    <LinearGradient
      colors={['#ffd6a7', '#ffffff']}
      locations={[0, 0.75]}
      style={styles.container}
      start={{ x: 2, y: 0 }}
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

      {/* Personal Details Screen - Full Screen Overlay with Animation */}
      {showPersonalDetails && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0], // Slide from right (400) to center (0)
                  }),
                },
              ],
            },
          ]}
        >
          <PersonalDetailsScreen 
            onBack={handlePersonalDetailsBack}
            onEditCurrentWeight={handleEditCurrentWeightPress}
            onEditHeight={handleEditHeightPress}
            onEditDateOfBirth={handleEditDateOfBirthPress}
            onEditGender={handleEditGenderPress}
            personalData={personalData}
          />
        </Animated.View>
      )}

      {/* Edit Current Weight Screen */}
      {showEditCurrentWeight && currentPersonalData && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  translateX: editSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0], // Slide from right (400) to center (0)
                  }),
                },
              ],
            },
          ]}
        >
          <EditCurrentWeightScreen 
            onBack={handleEditCurrentWeightBack}
            currentValue={currentPersonalData.currentWeight}
            onSave={handleEditCurrentWeightSave}
          />
        </Animated.View>
      )}

      {/* Edit Height Screen */}
      {showEditHeight && currentPersonalData && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  translateX: editSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0], // Slide from right (400) to center (0)
                  }),
                },
              ],
            },
          ]}
        >
          <EditHeightScreen 
            onBack={handleEditHeightBack}
            currentValue={currentPersonalData.height}
            onSave={handleEditHeightSave}
          />
        </Animated.View>
      )}

      {/* Edit Date of Birth Screen */}
      {showEditDateOfBirth && currentPersonalData && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  translateX: editSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0], // Slide from right (400) to center (0)
                  }),
                },
              ],
            },
          ]}
        >
          <EditDateOfBirthScreen 
            onBack={handleEditDateOfBirthBack}
            currentValue={currentPersonalData.dateOfBirth}
            onSave={handleEditDateOfBirthSave}
          />
        </Animated.View>
      )}

      {/* Edit Gender Screen */}
      {showEditGender && currentPersonalData && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  translateX: editSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0], // Slide from right (400) to center (0)
                  }),
                },
              ],
            },
          ]}
        >
          <EditGenderScreen 
            onBack={handleEditGenderBack}
            currentValue={currentPersonalData.gender}
            onSave={handleEditGenderSave}
          />
        </Animated.View>
      )}

      {/* Lift Details - Full Screen Overlay with Animation */}
      {showLiftDetails && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  translateX: liftDetailsSlideAnim,
                },
              ],
            },
          ]}
        >
          <LiftDetails
            onClose={handleCloseLiftDetails}
            onShowFeedbackSlideshow={handleShowFeedbackSlideshow}
            liftData={selectedLift || undefined}
          />
        </Animated.View>
      )}

      {/* Feedback Slideshow - Center Scale Animation */}
      {showFeedbackSlideshow && (
        <Animated.View
          style={[
            styles.fullScreenOverlay,
            {
              transform: [
                {
                  scale: feedbackSlideshowAnim,
                },
              ],
            },
          ]}
        >
          <FeedbackSlideshow
            onClose={handleCloseFeedbackSlideshow}
          />
        </Animated.View>
      )}
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
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
}); 