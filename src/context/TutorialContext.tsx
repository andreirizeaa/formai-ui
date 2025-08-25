import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, UIManager, findNodeHandle, Platform } from 'react-native';
import { useUserDetails } from './UserDetailsContext';
import { hapticFeedback } from '../utils/haptic';
import { editUserDetails } from '../services/userService';

// Global type declarations for tutorial functions
declare global {
  var triggerAddOptions: (() => void) | undefined;
  var openUploadModal: (() => void) | undefined;
  var closeAddOptions: (() => void) | undefined;
  var tutorialUpload: {
    skipToPreviewWithDemo?: () => void;
    goToMovementSelection?: () => void;
    goToPractices?: () => void;
    selectMovement?: (movement: string) => void;
    goToWeightReps?: () => void;
    goToVideoPreview?: () => void;
    close?: () => void;
  } | undefined;

  var addDummyLift: (() => void) | undefined;
  var openLiftDetails: (() => void) | undefined;
  var showFirstLiftDetails: (() => void) | undefined;
  var openHowItWorksModal: (() => void) | undefined;
  var openFeedbackSlideshow: (() => void) | undefined;
  var navigateToIssues: (() => void) | undefined;
  var navigateToTips: (() => void) | undefined;
  var navigateToHome: (() => void) | undefined;
  var navigateToPerformance: (() => void) | undefined;
  var openPerformanceFilters: (() => void) | undefined;
  var navigateToSettings: (() => void) | undefined;
  var navigateToPersonalDetails: (() => void) | undefined;
  var completeTutorial: (() => void) | undefined;
  var completeTutorialAndGoHome: (() => void) | undefined;
  var clearTemporaryLifts: (() => void) | undefined;
}

interface TutorialRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialTargetRegistration {
  id: string;
  measure: () => Promise<TutorialRect | null>;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetId?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'inside-bottom';
  onNext?: () => void;
  onPrev?: () => void;
}

interface TutorialContextType {
  isActive: boolean;
  isTransitioning: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  currentRect: TutorialRect | null;
  start: () => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  registerTarget: (id: string, measure: () => Promise<TutorialRect | null>) => void;
  unregisterTarget: (id: string) => void;
  cleanupStaleRegistrations: () => void;
  getStepNumber: (stepId: string) => number;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const registrationsRef = useRef<Map<string, TutorialTargetRegistration>>(new Map());
  const [isActive, setIsActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentRect, setCurrentRect] = useState<TutorialRect | null>(null);
  const { updateUserDetails, refetchUserDetails } = useUserDetails();

  // Steps flow definition
  const steps: TutorialStep[] = useMemo(() => [
    {
      id: 'add_button',
      title: 'Add a lift',
      description: 'Use the Add button to upload or record a video.',
      targetId: 'add_button',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          if (global.triggerAddOptions) global.triggerAddOptions();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'add_options_upload',
      title: 'Upload a video',
      description: 'Choose Upload to pick an existing video.',
      targetId: 'add_options_upload',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          if (global.openUploadModal) global.openUploadModal();
          if (global.closeAddOptions) global.closeAddOptions();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          if (global.closeAddOptions) global.closeAddOptions();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'upload_practices_cta',
      title: 'Tips & upload',
      description: "This normally opens your library. We'll skip to a demo video.",
      targetId: 'upload_practices_cta',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Skip directly to demo video for tutorial
          if (global.tutorialUpload?.skipToPreviewWithDemo) {
            global.tutorialUpload.skipToPreviewWithDemo();
          }
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'video_preview_continue',
      title: 'Preview',
      description: 'Looks good. Continue to select the movement.',
      targetId: 'video_preview_continue',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          if (global.tutorialUpload?.goToMovementSelection) global.tutorialUpload.goToMovementSelection();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        // If user goes back, ensure the practices screen is visible
        try {
          if (global.tutorialUpload?.goToPractices) global.tutorialUpload.goToPractices();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'movement_selection_continue',
      title: 'Choose movement',
      description: 'We picked a demo movement for you. Continue.',
      targetId: 'movement_selection_continue',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          if (global.tutorialUpload?.selectMovement) global.tutorialUpload.selectMovement('Squat');
          if (global.tutorialUpload?.goToWeightReps) global.tutorialUpload.goToWeightReps();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          if (global.tutorialUpload?.goToVideoPreview) global.tutorialUpload.goToVideoPreview();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'weight_reps_complete',
      title: 'Weight & reps',
      description: 'We will complete this step for the demo.',
      targetId: 'weight_reps_complete',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          if (global.tutorialUpload?.close) global.tutorialUpload.close();
          if (global.addDummyLift) global.addDummyLift();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          if (global.tutorialUpload?.goToMovementSelection) global.tutorialUpload.goToMovementSelection();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'home_first_lift_card',
      title: 'Click into this to find your analysis',
      description: 'Your lift appears here with analysis. Tap on it to see detailed feedback and insights.',
      targetId: 'home_first_lift_card',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Open the lift details page as if user clicked on it
          if (global.openLiftDetails) global.openLiftDetails();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'lift_details_form_graph',
      title: 'Form accuracy across your reps',
      description: 'This chart shows how your form accuracy varies across each repetition of your lift.',
      targetId: 'lift_details_form_graph',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Continue to the next step (review feedback)
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to the home screen
          if (global.showFirstLiftDetails) global.showFirstLiftDetails();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'lift_details_review_feedback',
      title: 'Review your feedback',
      description: 'Tap the Review Feedback button to see detailed analysis and tips for improving your form.',
      targetId: 'lift_details_review_feedback',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Open the feedback slideshow as if user clicked on it
          if (global.openHowItWorksModal) global.openHowItWorksModal();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to the form graph step
          const formGraphStepIndex = 6; // Index of lift_details_form_graph step
          setCurrentStepIndex(formGraphStepIndex);
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'how_it_works_modal',
      title: 'How it works',
      description: 'Learn how our AI analyzes your form and provides personalized feedback.',
      targetId: 'how_it_works_modal',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          // Navigate directly to the feedback slideshow and set the image as reference
          // Add a small delay to ensure the navigation completes before auto-advancing
          setTimeout(() => {
            if (global.openFeedbackSlideshow) global.openFeedbackSlideshow();
          }, 100);
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to lift details
          if (global.openLiftDetails) global.openLiftDetails();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'feedback_slideshow',
      title: 'Your feedback',
      description: 'Here you can see detailed analysis of your form with specific areas for improvement.',
      targetId: 'feedback_slideshow',
      tooltipPlacement: 'inside-bottom',
      onNext: () => {
        try {
          // Navigate to issues page by triggering the right chevron
          // This will move from image view to flaws/issues view
          if (global.navigateToIssues) global.navigateToIssues();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to how it works modal
          if (global.openHowItWorksModal) global.openHowItWorksModal();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'feedback_issues',
      title: 'Issues to address',
      description: 'Review the specific issues identified in your form that need attention.',
      targetId: 'feedback_issues',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Navigate to tips page by triggering the right chevron
          // This will move from flaws/issues view to improvement/tips view
          if (global.navigateToTips) global.navigateToTips();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to image view
          // This will be handled by the feedback slideshow navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'feedback_tips',
      title: 'Improvement tips',
      description: 'Here are specific tips to help improve your form and technique.',
      targetId: 'feedback_tips',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Navigate back to home screen
          if (global.navigateToHome) global.navigateToHome();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to issues page
          // This will be handled by the feedback slideshow navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'home_performance_icon',
      title: 'Performance tracking',
      description: 'Tap the Performance tab to view your progress and statistics over time.',
      targetId: 'home_performance_icon',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Navigate to performance screen
          if (global.navigateToPerformance) global.navigateToPerformance();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to feedback tips
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'performance_filters',
      title: 'Filter your data',
      description: 'Use the filter button to focus on specific movements and get more targeted insights.',
      targetId: 'performance_filters',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          // Just proceed to next tutorial step (no navigation needed)
          // The tutorial will automatically show the next step
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to performance icon step
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'performance_metrics',
      title: 'Performance Charts',
      description: 'View your accuracy and improvement metrics to track your progress over time.',
      targetId: 'performance_metrics',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          // Just proceed to next tutorial step (no navigation needed)
          // The tutorial will automatically show the next step
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to performance filters step
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'performance_charts',
      title: 'Accuracy & Improvement',
      description: 'Explore detailed charts and graphs to analyze your lifting patterns and trends.',
      targetId: 'performance_charts',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Navigate to settings screen
          if (global.navigateToSettings) global.navigateToSettings();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to performance metrics step
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'settings_first_card',
      title: 'Personal Details',
      description: 'Edit your personal information, language and prefered units',
      targetId: 'settings_first_card',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          // Just proceed to next tutorial step (no navigation needed)
          // The tutorial will automatically show the next step
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to performance filters step
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'settings_support_email',
      title: 'Support Email',
      description: 'Need help? Tap here to contact our support team via email.',
      targetId: 'settings_support_email',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          // Complete tutorial and navigate to home
          if (global.completeTutorialAndGoHome) global.completeTutorialAndGoHome();
          stop();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to settings first card step
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
  ], []);

  // Helpers
  const registerTarget = useCallback((id: string, measure: () => Promise<TutorialRect | null>) => {
    try {
      // Only allow registration for current step target
      const currentStep = steps[currentStepIndex];
      const isCurrentStepTarget = currentStep?.targetId === id;
      
      // AGGRESSIVE SAFEGUARD: Never register add_button when not on step 0
      if (id === 'add_button' && currentStepIndex !== 0) {
        return;
      }
      
      if (!isCurrentStepTarget) {
        return; // Don't register at all
      }
      
      registrationsRef.current.set(id, { id, measure });
      
      // Only measure immediately if this is the current step
      if (isActive && isCurrentStepTarget) {
        void (async () => {
          try {
            const rect = await measure();
            setCurrentRect(rect ?? null);
          } catch (err) {
            console.warn('Immediate measure after register failed:', err);
          }
        })();
      }
    } catch (error) {
      console.warn('Failed to register tutorial target:', error);
    }
  }, [isActive, currentStepIndex, steps]);

  const unregisterTarget = useCallback((id: string) => {
    try {
      registrationsRef.current.delete(id);
    } catch (error) {
      console.warn('Failed to unregister tutorial target:', error);
    }
  }, [currentStepIndex, steps]);

  const cleanupStaleRegistrations = useCallback(() => {
    try {
      const currentStep = steps[currentStepIndex];
      const currentTargetId = currentStep?.targetId;
      
      // AGGRESSIVE SAFEGUARD: Always remove add_button registration when not on step 0
      if (currentStepIndex !== 0) {
        registrationsRef.current.delete('add_button');
      }
      
      // Remove registrations that are not for the current step
      for (const [id] of registrationsRef.current) {
        if (id !== currentTargetId) {
          registrationsRef.current.delete(id);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup stale registrations:', error);
    }
  }, [currentStepIndex, steps]);

  const measureCurrentTarget = useCallback(async (index: number) => {
    try {
      // Don't measure during transitions
      if (isTransitioning) {
        return;
      }
      
      // AGGRESSIVE SAFEGUARD: Never measure step 0 when we're not on step 0
      if (index === 0 && currentStepIndex !== 0) {
        return;
      }
      
      // Double-check that this measurement request is still relevant
      if (index !== currentStepIndex) {
        return;
      }
      
      const step = steps[index];
      if (!step?.targetId) {
        setCurrentRect(null);
        return;
      }
      
      // Simple target measurement without retries to prevent infinite loops
      const reg = registrationsRef.current.get(step.targetId);
      if (!reg) {
        // Hide the tutorial overlay completely when target is not found
        setCurrentRect(null);
        return;
      }
      
      // Additional safeguard for home card step: ensure it's fully rendered
      if (step.id === 'home_first_lift_card') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Longer delay for review feedback step to ensure it's fully rendered
      if (step.id === 'lift_details_form_graph') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Delay for how it works modal step
      if (step.id === 'how_it_works_modal') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Delay for feedback slideshow step
      if (step.id === 'feedback_slideshow') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Delay for feedback issues step
      if (step.id === 'feedback_issues') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Delay for feedback tips step
      if (step.id === 'feedback_tips') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Delay for performance icon step
      if (step.id === 'home_performance_icon') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const rect = await reg.measure();
      
      // Only update if this measurement is still for the current step
      if (index === currentStepIndex) {
        setCurrentRect(rect ?? null);
        // Clear transitioning state when target is successfully measured
        setIsTransitioning(false);
      }
    } catch (error) {
      console.warn('Failed to measure tutorial target:', error);
      // Don't set currentRect to null on error - keep current step active
    }
  }, [steps, currentStepIndex]);

  // Public actions
  const start = useCallback(() => {
    try {
      setIsActive(true);
      setIsTransitioning(true); // Start with transition state
      setCurrentStepIndex(0);
      
      // Small delay to ensure smooth first step appearance
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    } catch (error) {
      console.warn('Failed to start tutorial:', error);
    }
  }, []);

  const next = useCallback(() => {
    try {
      const step = steps[currentStepIndex];
      
      if (step?.onNext) {
        step.onNext();
      }
      
      // Set transitioning state to hide overlay during step change
      setIsTransitioning(true);
      setCurrentRect(null); // Clear current rect during transition
      
      // Immediately clear all registrations to prevent old overlays from being measured
      registrationsRef.current.clear();
      
      // Add a delay to ensure any UI changes from onNext are complete
      const isModalOpeningStep = step?.id === 'add_button' || step?.id === 'add_options_upload';
      const delay = isModalOpeningStep ? 500 : 100;
      
      setTimeout(() => {
        const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
        setCurrentStepIndex(nextIndex);
        
        // Clear transitioning state after step change
        setTimeout(() => {
          setIsTransitioning(false);
        }, 150);
      }, delay);
    } catch (error) {
      console.warn('Failed to go to next tutorial step:', error);
      setIsTransitioning(false);
    }
  }, [currentStepIndex, steps]);

  const prev = useCallback(() => {
    try {
      const step = steps[currentStepIndex];
      if (step?.onPrev) step.onPrev();
      
      // Set transitioning state to hide overlay during step change
      setIsTransitioning(true);
      setCurrentRect(null); // Clear current rect during transition
      
      // Immediately clear all registrations to prevent old overlays from being measured
      registrationsRef.current.clear();
      
      const prevIndex = Math.max(currentStepIndex - 1, 0);
      setCurrentStepIndex(prevIndex);
      
      // Clear transitioning state after step change
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    } catch (error) {
      console.warn('Failed to go to previous tutorial step:', error);
      setIsTransitioning(false);
    }
  }, [currentStepIndex, steps]);
  const stop = useCallback(async() => {
    try {
      setIsActive(false);
      setIsTransitioning(false);
      setCurrentStepIndex(0);
      setCurrentRect(null);
      // Update local state immediately to prevent delayed UI updates
      updateUserDetails('walkthroughCompleted', true);
      // Then make the API call
      await editUserDetails({ walkthrough_completed: true });
      await refetchUserDetails();
      hapticFeedback.success();
    } catch (error) {
      console.warn('Failed to stop tutorial:', error);
    }
  }, []);

  const getStepNumber = useCallback((stepId: string) => {
    try {
      const idx = steps.findIndex(s => s.id === stepId);
      return idx >= 0 ? idx + 1 : 0;
    } catch (error) {
      console.warn('Failed to get step number:', error);
      return 0;
    }
  }, [steps]);

  const value = useMemo(() => ({
    isActive,
    isTransitioning,
    currentStepIndex,
    steps,
    currentRect,
    start,
    next,
    prev,
    stop,
    registerTarget,
    unregisterTarget,
    cleanupStaleRegistrations,
    getStepNumber,
  }), [isActive, isTransitioning, currentStepIndex, steps, currentRect, start, next, prev, stop, registerTarget, unregisterTarget, cleanupStaleRegistrations, getStepNumber]);

  // Expose stop method globally for tutorial completion
  React.useEffect(() => {
    global.completeTutorial = stop;
    return () => {
      global.completeTutorial = undefined;
    };
  }, [stop]);

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used within TutorialProvider');
  return ctx;
}

export function useTutorialTarget(targetId?: string) {
  try {
    const { registerTarget, unregisterTarget, currentStepIndex, steps, isActive } = useTutorial();
    const ref = useRef<any>(null);

    useEffect(() => {
      
      if (!targetId || !ref.current) {
        return;
      }
      
      // Check if this target is for the current step
      const currentStep = steps[currentStepIndex];
      const isCurrentStepTarget = currentStep?.targetId === targetId;
      
      // AGGRESSIVE SAFEGUARD: Never allow add_button registration when not on step 0
      if (targetId === 'add_button' && currentStepIndex !== 0) {
        return;
      }
      
      const measure = async (): Promise<TutorialRect | null> => {
        return new Promise((resolve) => {
          try {
            const node = findNodeHandle(ref.current);
            if (!node) return resolve(null);
            
            // Use measureInWindow for iOS, standard measure for Android
            if (Platform.OS === 'ios') {
              UIManager.measureInWindow(node, (x, y, width, height) => {
                resolve({ x, y, width, height });
              });
            } else {
              // Standard measurement for Android
              UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
                resolve({ x: pageX, y: pageY, width, height });
              });
            }
          } catch (error) {
            console.warn('Tutorial target measurement failed:', error);
            resolve(null);
          }
        });
      };
      
      // For lift_details_review_feedback, use a longer delay to ensure proper rendering
      const delay = targetId === 'lift_details_form_graph' ? 500 : 
                   targetId === 'how_it_works_modal' ? 500 :
                   targetId === 'feedback_slideshow' ? 500 :
                   targetId === 'home_performance_icon' ? 700 : 100;
      const timer = setTimeout(() => {
        try {
          // AGGRESSIVE SAFEGUARD: Never register add_button when not on step 0
          if (targetId === 'add_button' && currentStepIndex !== 0) {
            return;
          }
          
          // Only register for current step target
          if (isCurrentStepTarget) {
            registerTarget(targetId, measure);
          }
        } catch (error) {
          console.warn('Failed to register tutorial target:', error);
        }
      }, delay);
      
      return () => {
        clearTimeout(timer);
        // Always unregister on cleanup
        unregisterTarget(targetId);
      };
    }, [registerTarget, unregisterTarget, targetId, currentStepIndex, steps, isActive]);

    return { ref } as const;
  } catch (error) {
    console.error('useTutorialTarget error:', error);
    // Return a fallback ref if there's an error
    return { ref: React.useRef<any>(null) };
  }
}



