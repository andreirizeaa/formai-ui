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
      case 'image': return `Feedback point ${currentFeedbackIndex + 1}`;
      case 'flaws': return 'Issues';
      case 'improvement': return 'Tips';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getPageTitle()}</Text>
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

        {/* Content Area */}
        <View style={[
          styles.content,
          currentPageType === 'image' && styles.fullWidthContent
        ]}>
          {getCurrentPageContent()}
        </View>

        {/* Bottom Navigation Section */}
        <View style={styles.bottomNavigationSection}>
          {/* Left Chevron */}
          <TouchableOpacity 
            style={styles.bottomChevron}
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

          {/* Page Indicator in Center */}
          <View style={styles.bottomPageIndicator}>
            <Text style={styles.bottomPageIndicatorText}>
              {getCurrentPageNumber()} / {getTotalPages()}
            </Text>
          </View>

          {/* Right Chevron */}
          <TouchableOpacity 
            style={styles.bottomChevron}
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
        </View>
      </SafeAreaView>
    </View>
  );
}

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
    paddingBottom: 100,
    paddingTop: 0,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 20,
    marginHorizontal: 20,
    minHeight: 400,
  },
  feedbackImage: {
    width: '100%',
    height: '100%',
    minHeight: 400,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pageContent: {
    fontSize: 20,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
    lineHeight: 28,
  },
  fullWidthContent: {
    paddingHorizontal: 0,
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
  bottomNavigationSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
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
  bottomChevron: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 44,
  },
  bottomPageIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    flex: 1,
    maxWidth: 100,
  },
  bottomPageIndicatorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
}); 