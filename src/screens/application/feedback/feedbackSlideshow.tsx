import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CircleCheck, CircleX } from 'lucide-react-native';
import { hapticFeedback } from '../../../utils/haptic';
import { useTutorialTarget } from '../../../context/TutorialContext';

interface FeedbackSlideshowProps {
  onClose: () => void;
  onNavigateToLiftDetails?: () => void;
  liftData?: {
    analysis: {
      feedback: Array<{
        imageURL: any;
        flaws: string[];
        improvement: string[];
      }>;
    };
  };
}

export function FeedbackSlideshow({ onClose, onNavigateToLiftDetails, liftData }: FeedbackSlideshowProps) {
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [currentPageType, setCurrentPageType] = useState<'image' | 'flaws' | 'improvement'>('image');
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const navigation = useNavigation();
  
  // Tutorial targets for the feedback slideshow
  const { ref: feedbackSlideshowRef } = useTutorialTarget('feedback_slideshow');
  const { ref: issuesRef } = useTutorialTarget('feedback_issues');
  const { ref: tipsRef } = useTutorialTarget('feedback_tips');

  const handleClose = () => {
    hapticFeedback.selection();
    // If onNavigateToLiftDetails is provided, use it to go back to lift details
    // Otherwise, fall back to the default onClose behavior
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

  // Expose navigation functions globally for tutorial
  React.useEffect(() => {
    global.navigateToIssues = () => {
      if (currentPageType === 'image') {
        setCurrentPageType('flaws');
        setIsBottomExpanded(true);
      } else if (currentPageType === 'improvement') {
        setCurrentPageType('flaws');
        setIsBottomExpanded(true);
      }
    };
    
    global.navigateToTips = () => {
      if (currentPageType === 'flaws') {
        setCurrentPageType('improvement');
        setIsBottomExpanded(true);
      }
    };
    
    global.navigateToImage = () => {
      if (currentPageType === 'flaws') {
        setCurrentPageType('image');
        setIsBottomExpanded(false);
      }
    };
    
    global.navigateToHome = () => {
      // Navigate back to the main tabs by going back multiple times
      // First go back from feedback slideshow to how it works
      navigation.goBack();
      // Then go back from how it works to lift details
      setTimeout(() => navigation.goBack(), 100);
      // Finally go back from lift details to main tabs
      setTimeout(() => navigation.goBack(), 200);
    };
    
    return () => {
      delete global.navigateToIssues;
      delete global.navigateToTips;
      delete global.navigateToImage;
      delete global.navigateToHome;
    };
  }, [currentPageType]);

  const handleExpandCollapse = () => {
    hapticFeedback.selection();
    setIsBottomExpanded(!isBottomExpanded);
  };

  const navigateForward = () => {
    if (!liftData?.analysis?.feedback) return;

    const totalFeedbackItems = liftData.analysis.feedback.length;

    if (currentPageType === 'image') {
      setCurrentPageType('flaws');
      setIsBottomExpanded(true);
    } else if (currentPageType === 'flaws') {
      setCurrentPageType('improvement');
      setIsBottomExpanded(true);
    } else if (currentPageType === 'improvement') {
      // Move to next feedback item
      if (currentFeedbackIndex < totalFeedbackItems - 1) {
        setCurrentFeedbackIndex(currentFeedbackIndex + 1);
        setCurrentPageType('image');
        setIsBottomExpanded(false);
      } else {
        // We're on the last feedback item's improvement page, navigate back to LiftDetails
        // Use onNavigateToLiftDetails if available, otherwise fall back to onClose
        if (onNavigateToLiftDetails) {
          onNavigateToLiftDetails();
        } else {
          onClose();
        }
      }
    }
  };

  const navigateBackward = () => {
    if (!liftData?.analysis?.feedback) return;

    if (currentPageType === 'image') {
      // Move to previous feedback item's improvement page
      if (currentFeedbackIndex > 0) {
        setCurrentFeedbackIndex(currentFeedbackIndex - 1);
        setCurrentPageType('improvement');
        setIsBottomExpanded(true);
      } else {
        // We're on the first page, go back to previous screen
        // Use onNavigateToLiftDetails if available, otherwise fall back to onClose
        if (onNavigateToLiftDetails) {
          onNavigateToLiftDetails();
        } else {
          onClose();
        }
      }
    } else if (currentPageType === 'flaws') {
      setCurrentPageType('image');
      setIsBottomExpanded(false);
    } else if (currentPageType === 'improvement') {
      setCurrentPageType('flaws');
      setIsBottomExpanded(true);
    }
  };

  const getCurrentFeedbackItem = () => {
    if (!liftData?.analysis?.feedback) return null;
    return liftData.analysis.feedback[currentFeedbackIndex];
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

  const getPageTypeIndex = (pageType: 'image' | 'flaws' | 'improvement') => {
    switch (pageType) {
      case 'image': return 0;
      case 'flaws': return 1;
      case 'improvement': return 2;
    }
  };

  const getPageTitle = () => {
    return `Feedback point ${currentFeedbackIndex + 1}`;
  };

  const getBottomContent = () => {
    const feedbackItem = getCurrentFeedbackItem();
    if (!feedbackItem) return null;

    if (currentPageType === 'image' || !isBottomExpanded) {
      return null; // No content in bottom container for image view or when collapsed
    }

    const isIssues = currentPageType === 'flaws';
    const listRaw = isIssues ? feedbackItem.flaws : feedbackItem.improvement;
    const items: string[] = Array.isArray(listRaw)
      ? listRaw as unknown as string[]
      : typeof listRaw === 'string'
        ? (listRaw as string).split(/\n+/).map(s => s.trim()).filter(Boolean)
        : [];

    return (
      <View style={styles.bottomContentContainer} ref={isIssues ? issuesRef : tipsRef}>
        <Text style={styles.bottomContentTitle}>
          {isIssues ? 'Issues' : 'Tips'}
        </Text>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.listContainer}>
            {items.map((text, idx) => (
              <View key={`${isIssues ? 'issue' : 'tip'}-${idx}`} style={styles.listItem}>
                {isIssues ? (
                  <CircleX size={20} color="#FF3B30" />
                ) : (
                                      <CircleCheck size={20} color="#00c950" />
                )}
                <Text style={styles.listItemText}>{text}</Text>
              </View>
            ))}
            {items.length === 0 && (
              <Text style={styles.bottomContentText}>No {isIssues ? 'issues' : 'tips'} provided.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  const feedbackItem = getCurrentFeedbackItem();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getPageTitle()}</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
          >
            <X size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Content Area - Always full height */}
        <View style={styles.content}>
          {feedbackItem && (
            <View style={styles.imageContainer} ref={feedbackSlideshowRef}>
              <Image 
                source={typeof feedbackItem.imageURL === 'string' ? { uri: feedbackItem.imageURL } : feedbackItem.imageURL}
                style={styles.feedbackImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Bottom Navigation Section - Overlays on top */}
        <View style={[
          styles.bottomNavigationSection,
          (currentPageType !== 'image' && isBottomExpanded) && styles.expandedBottomSection
        ]}>
          {/* Bottom Content - Above navigation when expanded */}
          {getBottomContent()}

          {/* Navigation Row - Always at bottom */}
          <View style={styles.navigationRow}>
            {/* Left Chevron */}
            <TouchableOpacity 
              style={styles.bottomChevron}
              onPress={handleLeftChevron}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#000000" />
            </TouchableOpacity>

            {/* Center Column - Page Indicator and Expand/Collapse */}
            <View style={styles.centerColumn}>
              {/* Expand/Collapse Button - Only show on issues/tips */}
              {currentPageType !== 'image' && (
                <TouchableOpacity 
                  style={isBottomExpanded ? styles.downChevronButton : styles.upChevronButton}
                  onPress={handleExpandCollapse}
                  activeOpacity={0.7}
                >
                  {isBottomExpanded ? (
                    <ChevronDown size={24} color="#FFFFFF" />
                  ) : (
                    <ChevronUp size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}

              {/* Page Indicator */}
              <View style={styles.bottomPageIndicator}>
                <Text style={styles.bottomPageIndicatorText}>
                  {getCurrentPageNumber()} / {getTotalPages()}
                </Text>
              </View>
            </View>

            {/* Right Chevron */}
            <TouchableOpacity 
              style={styles.bottomChevron}
              onPress={handleRightChevron}
              activeOpacity={0.7}
            >
              <ChevronRight size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingHorizontal: 20,
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
    minHeight: 110,
    marginBottom: -30,
    paddingBottom: 30,
  },
  expandedBottomSection: {
    minHeight: 500,
    maxHeight: 500,
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
  bottomContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    flexShrink: 1,
  },
  bottomContentTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 12,
    marginTop: 24,
  },
  bottomContentText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    lineHeight: 26,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
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
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  centerColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  expandCollapseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  upChevronButton: {
    width: 60,
    height: 26,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'absolute',
    top: -32,
    alignSelf: 'center',
  },
  downChevronButton: {
    width: 60,
    height: 26,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'absolute',
    top: -420,
    alignSelf: 'center',
  },
  tutorialRefContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
}); 