import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Image, ScrollView, Animated, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CircleCheck, CircleX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticFeedback } from '../../../utils/haptic';
import { useTutorialTarget } from '../../../context/TutorialContext';
import i18n from '../../../utils/i18n';
import LottieView from 'lottie-react-native';

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
      accuracyScore?: number;
    };
  };
}

type ScreenMode = 'howItWorks' | 'feedback' | 'accuracyScore';

export function FeedbackSlideshow({ onClose, onNavigateToLiftDetails, liftData }: FeedbackSlideshowProps) {
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
  const [currentPageType, setCurrentPageType] = useState<'image' | 'flaws' | 'improvement'>('image');
  const [isBottomExpanded, setIsBottomExpanded] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>('howItWorks');
  const navigation = useNavigation();
  
  // Setup slide animation and pan responder for bottom drawer
  const slideAnim = React.useRef(new Animated.Value(390)).current; // start collapsed (panel mostly hidden, only header showing)
  const currentSlidePosition = React.useRef(390); // track current position for pan responder
  
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: any, gestureState: any) => {
        // start gesture if vertical swipe > horizontal
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_: any, gestureState: any) => {
        if (isBottomExpanded) {
          // When expanded, allow dragging both up and down
          if (gestureState.dy < 0) {
            // Dragging up - collapse the panel
            const newY = Math.max(gestureState.dy, -390); // limit to 0 (fully expanded)
            slideAnim.setValue(newY);
          } else if (gestureState.dy > 0) {
            // Dragging down - show just the top of expanded content
            const newY = Math.min(gestureState.dy, 200); // limit to 200 (showing just top portion)
            slideAnim.setValue(newY);
          }
        } else {
          // When collapsed, only allow dragging up to expand
          if (gestureState.dy < 0) {
            const newY = Math.max(gestureState.dy + 390, 0); // start from 390, limit to 0
            slideAnim.setValue(newY);
          }
        }
      },
      onPanResponderRelease: (_: any, gestureState: any) => {
        if (isBottomExpanded) {
          if (gestureState.dy < -100) {
            // swipe up → collapse
            Animated.timing(slideAnim, {
              toValue: 390,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              setIsBottomExpanded(false);
              currentSlidePosition.current = 390;
            });
          } else if (gestureState.dy > 100) {
            // swipe down → show just top portion
            Animated.timing(slideAnim, {
              toValue: 200,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              currentSlidePosition.current = 200;
            });
          } else {
            // snap back to expanded
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              currentSlidePosition.current = 0;
            });
          }
        } else {
          // When collapsed, only allow expanding by dragging up
          if (gestureState.dy < -100) {
            // swipe up → expand
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              setIsBottomExpanded(true);
              currentSlidePosition.current = 0;
            });
          } else {
            // snap back to collapsed
            Animated.timing(slideAnim, {
              toValue: 390,
              duration: 200,
              useNativeDriver: true,
            }).start(() => {
              currentSlidePosition.current = 390;
            });
          }
        }
      },
    })
  ).current;
  
  // Tutorial targets for the feedback slideshow
  const { ref: feedbackSlideshowRef } = useTutorialTarget('feedback_slideshow');
  const { ref: issuesRef } = useTutorialTarget('feedback_issues');
  const { ref: tipsRef } = useTutorialTarget('feedback_tips');
  const { ref: howItWorksModalRef } = useTutorialTarget('how_it_works_modal');

  // Initialize slideAnim position based on current state
  React.useEffect(() => {
    if (currentPageType === 'image') {
      Animated.timing(slideAnim, {
        toValue: 390, // collapsed
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        currentSlidePosition.current = 390;
      });
    } else {
      const targetValue = isBottomExpanded ? 0 : 390;
      Animated.timing(slideAnim, {
        toValue: targetValue,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        currentSlidePosition.current = targetValue;
      });
    }
  }, [currentPageType, isBottomExpanded, slideAnim]);

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

  const handleViewFeedback = () => {
    hapticFeedback.selection();
    setScreenMode('feedback');
  };

  const handleBackToHowItWorks = () => {
    hapticFeedback.selection();
    setScreenMode('howItWorks');
  };

  const handleExitToLiftDetails = () => {
    hapticFeedback.selection();
    // Navigate back to lift details
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
        Animated.timing(slideAnim, {
          toValue: 0, // expand
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          currentSlidePosition.current = 0;
        });
      } else if (currentPageType === 'improvement') {
        setCurrentPageType('flaws');
        setIsBottomExpanded(true);
        // Already expanded, no animation needed
      }
    };
    
    global.navigateToTips = () => {
      if (currentPageType === 'flaws') {
        setCurrentPageType('improvement');
        setIsBottomExpanded(true);
        // Already expanded, no animation needed
      }
    };
    
    global.navigateToImage = () => {
      if (currentPageType === 'flaws') {
        setCurrentPageType('image');
        setIsBottomExpanded(false);
        Animated.timing(slideAnim, {
          toValue: 390, // collapse
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          currentSlidePosition.current = 390;
        });
      }
    };
    
    global.navigateToHowItWorksStep = () => {
      setScreenMode('howItWorks');
    };
    
    global.navigateToFeedbackPage = () => {
      setScreenMode('feedback');
      // Notify tutorial that the component is ready to continue
      // Use a longer delay to ensure the component is fully rendered
      setTimeout(() => {
        if (global.onFeedbackPageReady) global.onFeedbackPageReady();
      }, 800);
    };
    
    global.navigateToHome = () => {
      // Navigate to home screen for the tutorial
      // First close the current modal, then navigate to home
      if (onClose) {
        onClose();
        // Add a small delay to ensure the modal closes before navigating
        setTimeout(() => {
          // Use the global function to navigate to home tab
          if ((global as any).navigateToHome) {
            (global as any).navigateToHome();
          }
        }, 100);
      }
    };
    
    return () => {
      delete global.navigateToIssues;
      delete global.navigateToTips;
      delete global.navigateToImage;
      delete global.navigateToHowItWorksStep;
      delete global.navigateToFeedbackPage;
      delete global.navigateToHome;
      delete global.onFeedbackPageReady;
    };
  }, [currentPageType, onClose]);

  const handleExpandCollapse = () => {
    hapticFeedback.selection();
    const targetValue = isBottomExpanded ? 390 : 0;
    Animated.timing(slideAnim, {
      toValue: targetValue, // 0 = fully expanded, 390 = collapsed
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      currentSlidePosition.current = targetValue;
    });

    setIsBottomExpanded(!isBottomExpanded);
  };

  const navigateForward = () => {
    if (!liftData?.analysis?.feedback) return;

    const totalFeedbackItems = liftData.analysis.feedback.length;

    if (currentPageType === 'image') {
      setCurrentPageType('flaws');
      setIsBottomExpanded(true);
      Animated.timing(slideAnim, {
        toValue: 0, // expand
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        currentSlidePosition.current = 0;
      });
    } else if (currentPageType === 'flaws') {
      setCurrentPageType('improvement');
      setIsBottomExpanded(true);
      // Already expanded, no animation needed
    } else if (currentPageType === 'improvement') {
      // Move to next feedback item
      if (currentFeedbackIndex < totalFeedbackItems - 1) {
        setCurrentFeedbackIndex(currentFeedbackIndex + 1);
        setCurrentPageType('image');
        setIsBottomExpanded(false);
        Animated.timing(slideAnim, {
          toValue: 390, // collapse
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          currentSlidePosition.current = 390;
        });
              } else {
          // We're on the last feedback item's improvement page, show accuracy score page
          setScreenMode('accuracyScore');
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
        Animated.timing(slideAnim, {
          toValue: 0, // expand
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          currentSlidePosition.current = 0;
        });
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
      Animated.timing(slideAnim, {
        toValue: 390, // collapse
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        currentSlidePosition.current = 390;
      });
    } else if (currentPageType === 'improvement') {
      setCurrentPageType('flaws');
      setIsBottomExpanded(true);
      // Already expanded, no animation needed
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

  // Render How It Works screen
  if (screenMode === 'howItWorks') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t('feedback.howItWorks')}</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={styles.content}>
            <View style={styles.howItWorksContainer}>
              <View style={styles.howItWorksItems} ref={howItWorksModalRef}>
                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>1</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step1')}
                    </Text>
                  </View>
                </View>

                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>2</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step2')}
                    </Text>
                  </View>
                </View>

                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>3</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step3')}
                    </Text>
                  </View>
                </View>

                <View style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIcon}>
                    <Text style={styles.howItWorksNumber}>4</Text>
                  </View>
                  <View style={styles.howItWorksContent}>
                    <Text style={styles.howItWorksText}>
                      {i18n.t('feedback.step4')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.viewFeedbackButton}
              onPress={handleViewFeedback}
              activeOpacity={0.7}
            >
              <Text style={styles.viewFeedbackButtonText}>{i18n.t('feedback.viewFeedback')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Render Accuracy Score screen
  if (screenMode === 'accuracyScore') {
    const accuracyScore = liftData?.analysis?.accuracyScore || 85; // Default to 85 if not provided
    
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Analysis Complete</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View style={styles.content}>
            <View style={styles.accuracyScoreContainer}>
              {/* Confetti animation positioned behind content */}
              <View style={styles.animationContainer}>
                <LottieView
                  source={require('../../../../assets/animations/confetti.json')}
                  autoPlay
                  loop={false}
                  speed={0.6}
                  style={styles.confettiAnimation}
                />
              </View>

              <LinearGradient
                colors={['#e2e8f0', '#f5f3ff']}
                locations={[0, 0.9]}
                style={styles.accuracyScoreCard}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={styles.accuracyScoreContent}>
                  {/* Accuracy Score Display */}
                  <View style={styles.scoreDisplay}>
                    <Text style={styles.scoreLabel}>Form Accuracy</Text>
                    <Text style={styles.scoreValue}>{accuracyScore}%</Text>
                  </View>

                  {/* Subtitle */}
                  <Text style={styles.accuracySubtitle}>
                    Great job! Your form analysis is complete.
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={styles.exitButton}
              onPress={handleExitToLiftDetails}
              activeOpacity={0.7}
            >
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Render Feedback Slideshow screen
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
        <Animated.View 
          {...panResponder.panHandlers}
          style={[
            styles.bottomNavigationSection,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Bottom Content - Above navigation when expanded */}
          {getBottomContent()}

          {/* Navigation Row - Only show when fully expanded or collapsed, not in intermediate state */}
          <Animated.View 
            style={[
              styles.navigationRow,
              {
                opacity: slideAnim.interpolate({
                  inputRange: [0, 150, 200, 390],
                  outputRange: [1, 0, 0, 1], // visible at 0 (expanded) and 390 (collapsed), hidden in between
                }),
              },
            ]}
          >
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
          </Animated.View>
        </Animated.View>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 500, // fixed max height
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
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  // How It Works styles
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
  tutorialRefContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  // Accuracy Score styles
  accuracyScoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // Ensure it's behind other content
  },
  confettiAnimation: {
    width: 700,
    height: 700,
  },
  accuracyScoreCard: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  accuracyScoreContent: {
    alignItems: 'center',
    zIndex: 1, // Ensure it's above the animation
  },
  scoreDisplay: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffb86a',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
  },
  accuracySubtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    lineHeight: 26,
    textAlign: 'center',
  },
  exitButton: {
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
}); 