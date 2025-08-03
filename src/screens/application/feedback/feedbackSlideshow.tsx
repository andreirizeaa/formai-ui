import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { hapticFeedback } from '../../../utils/haptic';

interface FeedbackSlideshowProps {
  onClose: () => void;
  onNavigateToLiftDetails?: () => void;
  liftData?: {
    analysis: {
      feedback: Array<{
        imageURL: any;
        flaws: string;
        improvement: string;
      }>;
    };
  };
}

export function FeedbackSlideshow({ onClose, onNavigateToLiftDetails, liftData }: FeedbackSlideshowProps) {
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [currentPageType, setCurrentPageType] = useState<'image' | 'flaws' | 'improvement'>('image');

  const handleClose = () => {
    hapticFeedback.selection();
    if (onNavigateToLiftDetails) {
      onNavigateToLiftDetails();
    } else {
      onClose();
    }
  };

  const handleLeftChevron = () => {
    hapticFeedback.selection();
    navigateBackward();
  };

  const handleRightChevron = () => {
    hapticFeedback.selection();
    navigateForward();
  };

  const navigateForward = () => {
    if (!liftData?.analysis?.feedback) return;

    const totalFeedbackItems = liftData.analysis.feedback.length;
    const totalPages = totalFeedbackItems * 3;

    // Calculate current absolute page number
    const currentAbsolutePage = currentFeedbackIndex * 3 + getPageTypeIndex(currentPageType);

    if (currentAbsolutePage < totalPages - 1) {
      // Move to next page
      if (currentPageType === 'image') {
        setCurrentPageType('flaws');
      } else if (currentPageType === 'flaws') {
        setCurrentPageType('improvement');
      } else if (currentPageType === 'improvement') {
        // Move to next feedback item
        if (currentFeedbackIndex < totalFeedbackItems - 1) {
          setCurrentFeedbackIndex(currentFeedbackIndex + 1);
          setCurrentPageType('image');
        }
      }
    } else {
      // We're on the last page, navigate back to LiftDetails
      if (onNavigateToLiftDetails) {
        onNavigateToLiftDetails();
      } else {
        onClose();
      }
    }
  };

  const navigateBackward = () => {
    if (!liftData?.analysis?.feedback) return;

    const totalFeedbackItems = liftData.analysis.feedback.length;

    // Calculate current absolute page number
    const currentAbsolutePage = currentFeedbackIndex * 3 + getPageTypeIndex(currentPageType);

    if (currentAbsolutePage > 0) {
      // Move to previous page
      if (currentPageType === 'image') {
        // Move to previous feedback item's improvement page
        if (currentFeedbackIndex > 0) {
          setCurrentFeedbackIndex(currentFeedbackIndex - 1);
          setCurrentPageType('improvement');
        }
      } else if (currentPageType === 'flaws') {
        setCurrentPageType('image');
      } else if (currentPageType === 'improvement') {
        setCurrentPageType('flaws');
      }
    } else {
      // We're on the first page, go back to previous screen
      handleClose();
    }
  };

  const getPageTypeIndex = (pageType: 'image' | 'flaws' | 'improvement') => {
    switch (pageType) {
      case 'image': return 0;
      case 'flaws': return 1;
      case 'improvement': return 2;
    }
  };

  const getCurrentFeedbackItem = () => {
    if (!liftData?.analysis?.feedback) return null;
    return liftData.analysis.feedback[currentFeedbackIndex];
  };

  const getCurrentPageContent = () => {
    const feedbackItem = getCurrentFeedbackItem();
    if (!feedbackItem) return null;

    switch (currentPageType) {
      case 'image':
        return (
          <View style={styles.imageContainer}>
            <Image 
              source={feedbackItem.imageURL} 
              style={styles.feedbackImage}
              resizeMode="cover"
            />
          </View>
        );
      case 'flaws':
        return (
          <View style={styles.textContainer}>
            <Text style={styles.pageContent}>{feedbackItem.flaws}</Text>
          </View>
        );
      case 'improvement':
        return (
          <View style={styles.textContainer}>
            <Text style={styles.pageContent}>{feedbackItem.improvement}</Text>
          </View>
        );
    }
  };

  const getCurrentPageNumber = () => {
    if (!liftData?.analysis?.feedback) return 0;
    const totalFeedbackItems = liftData.analysis.feedback.length;
    const totalPages = totalFeedbackItems * 3;
    return (currentFeedbackIndex * 3 + getPageTypeIndex(currentPageType)) + 1;
  };

  const getTotalPages = () => {
    if (!liftData?.analysis?.feedback) return 0;
    return liftData.analysis.feedback.length * 3;
  };

  const getPageTitle = () => {
    switch (currentPageType) {
      case 'image': return 'Photo';
      case 'flaws': return 'Issues';
      case 'improvement': return 'Tips';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Content Area */}
        <View style={[
          styles.content,
          currentPageType === 'image' && styles.fullWidthContent
        ]}>
          {getCurrentPageContent()}
        </View>

        {/* Left Chevron */}
        {getCurrentPageNumber() > 1 && (
          <TouchableOpacity 
            style={[
              styles.leftChevron,
              currentPageType === 'image' && styles.transparentChevron
            ]}
            onPress={handleLeftChevron}
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
                stroke="#000000"
                strokeWidth={1.5}
              />
            </Svg>
          </TouchableOpacity>
        )}

        {/* Right Chevron */}
        <TouchableOpacity 
          style={[
            styles.rightChevron,
            currentPageType === 'image' && styles.transparentChevron
          ]}
          onPress={handleRightChevron}
          activeOpacity={0.7}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
              stroke="#000000"
              strokeWidth={1.5}
            />
          </Svg>
        </TouchableOpacity>

        {/* Page indicator */}
        <View style={styles.pageIndicatorRow}>
          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {getCurrentPageNumber()} / {getTotalPages()}
            </Text>
          </View>
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitleText}>
              {getPageTitle()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
                stroke="#000000"
                strokeWidth={2}
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  viewFeedbackButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  viewFeedbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  leftChevron: {
    position: 'absolute',
    left: 20,
    top: height / 2 - 24, // Vertically center (adjusted for circle size)
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  rightChevron: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 24, // Vertically center (adjusted for circle size)
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  textAboveChevrons: {
    position: 'absolute',
    top: height / 2 - 120, // Move higher above chevrons
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    zIndex: 1,
  },
  textBelowChevrons: {
    position: 'absolute',
    top: height / 2 + 80, // Position below chevrons
    left: 0,
    right: 0,
    paddingHorizontal: 40,
    zIndex: 1,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
    lineHeight: 24, // Increased line height to match larger font
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 44,
    marginBottom: -34,
  },
  feedbackImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 10,
  },
  pageContent: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
    lineHeight: 28,
  },
  pageIndicator: {
    alignItems: 'center',
    zIndex: 9999,
  },
  pageIndicatorText: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  pageTitleText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    textAlign: 'center',
    width: '100%',
  },
  pageTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transparentChevron: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  fullWidthContent: {
    paddingHorizontal: 0,
  },
  pageIndicatorRow: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10000,
  },
  howItWorksContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  howItWorksItems: {
    width: '100%',
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
  },
  howItWorksIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  howItWorksNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  howItWorksContent: {
    flex: 1,
  },
  howItWorksText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    lineHeight: 24,
  },
}); 