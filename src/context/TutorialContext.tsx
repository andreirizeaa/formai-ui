import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, UIManager, findNodeHandle, Platform } from 'react-native';

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
          
          // Immediately clear current rect and set transitioning to prevent flickering
          setCurrentRect(null);
          setIsTransitioning(true);
          
          // Clear all registrations immediately to prevent old targets from being measured
          registrationsRef.current.clear();
          
          // Force cleanup of any lingering registrations
          setTimeout(() => {
            registrationsRef.current.clear();
          }, 100);
          
          // Manually advance to the home screen card step after a delay
          setTimeout(() => {
            const homeCardStepIndex = 6; // Index of home_first_lift_card step
            
            setCurrentStepIndex(homeCardStepIndex);
            
            // Keep transitioning state until target is properly positioned
            // The transitioning state will be cleared when the target is measured
          }, 1000);
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
      id: 'lift_details_review_feedback',
      title: 'Review your feedback',
      description: 'Tap the Review Feedback button to see detailed analysis and tips for improving your form.',
      targetId: 'lift_details_review_feedback',
      tooltipPlacement: 'bottom',
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
          // Go back to the home screen
          if (global.showFirstLiftDetails) global.showFirstLiftDetails();
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
      // Special safeguard for review feedback step: don't unregister during the tutorial step
      const currentStep = steps[currentStepIndex];
      if (currentStep?.id === 'lift_details_review_feedback' && id === 'lift_details_review_feedback') {
        // Only unregister if we're moving away from this step
        return;
      }
      
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
      
      // Special safeguard for review feedback step: ensure it stays registered
      if (currentStep?.id === 'lift_details_review_feedback' && currentTargetId) {
        const existingReg = registrationsRef.current.get(currentTargetId);
        if (!existingReg) {
          // If the registration was accidentally removed, don't clean it up
          // This prevents the button from disappearing during the tutorial
          return;
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
      if (step.id === 'lift_details_review_feedback') {
        await new Promise(resolve => setTimeout(resolve, 500));
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

  // Re-measure on step change or when activating
  useEffect(() => {
    
    if (!isActive || isTransitioning) {
      return;
    }
    
    const currentStep = steps[currentStepIndex];
    if (!currentStep) {
      return;
    }
    
    // Clean up stale registrations before measuring
    cleanupStaleRegistrations();
    
    // Add a delay before measuring to ensure the target is fully rendered
    const delay = currentStep.id === 'home_first_lift_card' ? 800 : 
                  currentStep.id === 'lift_details_review_feedback' ? 800 :
                  currentStep.id === 'how_it_works_modal' ? 600 :
                  currentStep.id === 'feedback_slideshow' ? 600 :
                  currentStep.id === 'feedback_issues' ? 600 :
                  currentStep.id === 'feedback_tips' ? 600 :
                  currentStep.id === 'home_performance_icon' ? 600 : 100;
    
    setTimeout(() => {
      // Only measure if we have a valid step and it's the current active step
      if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
        void measureCurrentTarget(currentStepIndex);
      } else {
        setCurrentStepIndex(0); // Reset to valid step
      }
    }, delay);
    
    // Special case for review feedback step: add additional measurement after longer delay
    if (currentStep.id === 'lift_details_review_feedback') {
      setTimeout(() => {
        if (currentStepIndex === 7 && isActive && !isTransitioning) {
          void measureCurrentTarget(currentStepIndex);
        }
      }, 1200);
    }
    
    // Special case for how it works modal step: add additional measurement after longer delay
    if (currentStep.id === 'how_it_works_modal') {
      setTimeout(() => {
        if (currentStepIndex === 8 && isActive && !isTransitioning) {
          void measureCurrentTarget(currentStepIndex);
        }
      }, 1000);
    }
    
    // Special case for feedback slideshow step: add additional measurement after longer delay
    if (currentStep.id === 'feedback_slideshow') {
      setTimeout(() => {
        if (currentStepIndex === 9 && isActive && !isTransitioning) {
          void measureCurrentTarget(currentStepIndex);
        }
      }, 1000);
    }
    
    // Special case for feedback issues step: add additional measurement after longer delay
    if (currentStep.id === 'feedback_issues') {
      setTimeout(() => {
        if (currentStepIndex === 10 && isActive && !isTransitioning) {
          void measureCurrentTarget(currentStepIndex);
        }
      }, 1000);
    }
    
    // Special case for feedback tips step: add additional measurement after longer delay
    if (currentStep.id === 'feedback_tips') {
      setTimeout(() => {
        if (currentStepIndex === 11 && isActive && !isTransitioning) {
          void measureCurrentTarget(currentStepIndex);
        }
      }, 1000);
    }
    
    // Special case for performance icon step: add additional measurement after longer delay
    if (currentStep.id === 'home_performance_icon') {
      setTimeout(() => {
        if (currentStepIndex === 12 && isActive && !isTransitioning) {
          void measureCurrentTarget(currentStepIndex);
        }
      }, 1000);
    }
  }, [isActive, currentStepIndex, steps, measureCurrentTarget, cleanupStaleRegistrations, isTransitioning]);

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
      
      // For weight_reps_complete step, don't auto-advance since we handle it manually in onNext
      if (step?.id === 'weight_reps_complete') {
        setIsTransitioning(false);
        return;
      }
      
      // For home_first_lift_card step, auto-advance to review feedback step after a delay
      if (step?.id === 'home_first_lift_card') {
        setTimeout(() => {
          const reviewFeedbackStepIndex = 7; // Index of lift_details_review_feedback step
          setCurrentStepIndex(reviewFeedbackStepIndex);
          
          // Clear transitioning state after step change with longer delay to ensure proper rendering
          setTimeout(() => {
            setIsTransitioning(false);
          }, 500);
        }, 200); // Increased delay to ensure lift details screen is fully rendered
        return;
      }
      
      // For review feedback step, auto-advance to how it works modal
      if (step?.id === 'lift_details_review_feedback') {
        setTimeout(() => {
          const howItWorksStepIndex = 8; // Index of how_it_works_modal step
          setCurrentStepIndex(howItWorksStepIndex);
          
          // Clear transitioning state after step change
          setTimeout(() => {
            setIsTransitioning(false);
          }, 500);
        }, 200);
        return;
      }
      
      // For how it works modal step, auto-advance to feedback slideshow
      if (step?.id === 'how_it_works_modal') {
        setTimeout(() => {
          const feedbackSlideshowStepIndex = 9; // Index of feedback_slideshow step
          setCurrentStepIndex(feedbackSlideshowStepIndex);
          
          // Clear transitioning state after step change
          setTimeout(() => {
            setIsTransitioning(false);
          }, 500);
        }, 200);
        return;
      }
      
      // For feedback slideshow step, auto-advance to issues step after a delay
      if (step?.id === 'feedback_slideshow') {
        setTimeout(() => {
          const issuesStepIndex = 10; // Index of feedback_issues step
          setCurrentStepIndex(issuesStepIndex);
          
          // Clear transitioning state after step change
          setTimeout(() => {
            setIsTransitioning(false);
          }, 500);
        }, 200);
        return;
      }
      
      // For feedback issues step, auto-advance to tips step after a delay
      if (step?.id === 'feedback_issues') {
        setTimeout(() => {
          const tipsStepIndex = 11; // Index of feedback_tips step
          setCurrentStepIndex(tipsStepIndex);
          
          // Clear transitioning state after step change
          setTimeout(() => {
            setIsTransitioning(false);
          }, 500);
        }, 200);
        return;
      }
      
      // For feedback tips step, auto-advance to performance icon step after navigation
      if (step?.id === 'feedback_tips') {
        setTimeout(() => {
          const performanceIconStepIndex = 12; // Index of home_performance_icon step
          setCurrentStepIndex(performanceIconStepIndex);
          
          // Clear transitioning state after step change with longer delay to ensure navigation completes
          setTimeout(() => {
            setIsTransitioning(false);
          }, 800);
        }, 500); // Wait for navigation to complete
        return;
      }
      
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

  const stop = useCallback(() => {
    try {
      setIsActive(false);
      setIsTransitioning(false);
      setCurrentStepIndex(0);
      setCurrentRect(null);
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
      const delay = targetId === 'lift_details_review_feedback' ? 300 : 
                   targetId === 'how_it_works_modal' ? 300 :
                   targetId === 'feedback_slideshow' ? 300 :
                   targetId === 'home_performance_icon' ? 300 : 100;
      const timer = setTimeout(() => {
        try {
          // AGGRESSIVE SAFEGUARD: Never register add_button when not on step 0
          if (targetId === 'add_button' && currentStepIndex !== 0) {
            return;
          }
          
          // Only register for current step target
          if (isCurrentStepTarget) {
            registerTarget(targetId, measure);
            
            // For review feedback step, add additional retry logic
            if (targetId === 'lift_details_review_feedback') {
              // Retry registration after a longer delay to ensure the component is fully mounted
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 600);
              
              // Additional retry for extra stability
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 1000);
            }
            
            // For how it works modal step, add additional retry logic
            if (targetId === 'how_it_works_modal') {
              // Retry registration after a longer delay to ensure the component is fully mounted
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 600);
              
              // Additional retry for extra stability
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 1000);
            }
            
            // For feedback slideshow step, add additional retry logic
            if (targetId === 'feedback_slideshow') {
              // Retry registration after a longer delay to ensure the component is fully mounted
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 600);
              
              // Additional retry for extra stability
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 1000);
            }
            
            // For performance icon step, add additional retry logic
            if (targetId === 'home_performance_icon') {
              // Retry registration after a longer delay to ensure the component is fully mounted
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 600);
              
              // Additional retry for extra stability
              setTimeout(() => {
                if (isCurrentStepTarget && ref.current) {
                  registerTarget(targetId, measure);
                }
              }, 1000);
            }
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



