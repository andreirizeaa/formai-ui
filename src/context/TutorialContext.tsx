import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, UIManager, findNodeHandle, Platform, InteractionManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserDetails } from './UserDetailsContext';
import { hapticFeedback } from '../utils/haptic';
import { editUserDetails } from '../services/userService';
import i18n from '../utils/i18n';

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

  var openFeedbackSlideshow: (() => void) | undefined;
  var navigateToIssues: (() => void) | undefined;
  var navigateToTips: (() => void) | undefined;
  var navigateToImage: (() => void) | undefined;
  var navigateToHome: (() => void) | undefined;
  var navigateToPerformance: (() => void) | undefined;
  var openPerformanceFilters: (() => void) | undefined;
  var navigateToSettings: (() => void) | undefined;
  var navigateToPersonalDetails: (() => void) | undefined;
  var completeTutorial: (() => void) | undefined;
  var completeTutorialAndGoHome: (() => void) | undefined;
  var clearTemporaryLifts: (() => void) | undefined;
  var navigateToHowItWorksStep: (() => void) | undefined;
  var navigateToFeedbackPage: (() => void) | undefined;
  var onFeedbackPageReady: (() => void) | undefined;
  var remeasureTutorialTarget: (() => void) | undefined;
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
  onNext?: () => void | Promise<void>;
  onPrev?: () => void;
}

interface TutorialContextType {
  isActive: boolean;
  isTransitioning: boolean;
  isProcessingStep: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  currentRect: TutorialRect | null;
  start: () => void;
  next: () => Promise<void>;
  stop: () => void;
  registerTarget: (id: string, measure: () => Promise<TutorialRect | null>) => void;
  unregisterTarget: (id: string) => void;
  cleanupStaleRegistrations: () => void;
  getStepNumber: (stepId: string) => number;
  setCurrentStepIndex: (index: number) => void;
  setCurrentRect: (rect: TutorialRect | null) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const registrationsRef = useRef<Map<string, TutorialTargetRegistration>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentRect, setCurrentRect] = useState<TutorialRect | null>(null);
  const { updateUserDetails, refetchUserDetails } = useUserDetails();

  // Steps flow definition
  const steps: TutorialStep[] = useMemo(() => [
    {
      id: 'add_button',
      title: i18n.t('tutorial.addButton.title'),
      description: i18n.t('tutorial.addButton.description'),
      targetId: 'add_button',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          if ((global as any).triggerAddOptions) (global as any).triggerAddOptions();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'add_options_upload',
      title: i18n.t('tutorial.addOptionsUpload.title'),
      description: i18n.t('tutorial.addOptionsUpload.description'),
      targetId: 'add_options_upload',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          if ((global as any).openUploadModal) (global as any).openUploadModal();
          if ((global as any).closeAddOptions) (global as any).closeAddOptions();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'upload_practices_cta',
      title: i18n.t('tutorial.uploadPracticesCta.title'),
      description: i18n.t('tutorial.uploadPracticesCta.description'),
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
      title: i18n.t('tutorial.videoPreviewContinue.title'),
      description: i18n.t('tutorial.videoPreviewContinue.description'),
      targetId: 'video_preview_continue',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          if (global.tutorialUpload?.goToMovementSelection) global.tutorialUpload.goToMovementSelection();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'movement_selection_continue',
      title: i18n.t('tutorial.movementSelectionContinue.title'),
      description: i18n.t('tutorial.movementSelectionContinue.description'),
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
      
    },
    {
      id: 'weight_reps_complete',
      title: i18n.t('tutorial.weightRepsComplete.title'),
      description: i18n.t('tutorial.weightRepsComplete.description'),
      targetId: 'weight_reps_complete',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          if (global.tutorialUpload?.close) global.tutorialUpload.close();
          if (global.addDummyLift) global.addDummyLift();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'home_first_lift_card',
      title: i18n.t('tutorial.homeFirstLiftCard.title'),
      description: i18n.t('tutorial.homeFirstLiftCard.description'),
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
      title: i18n.t('tutorial.liftDetailsFormGraph.title'),
      description: i18n.t('tutorial.liftDetailsFormGraph.description'),
      targetId: 'lift_details_form_graph',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Programmatically switch to depth graph (second card)
          try { global.setLiftDetailsGraphsIndex?.(1); } catch {}
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'lift_details_depth_graph',
      title: i18n.t('tutorial.liftDetailsDepthGraph.title'),
      description: i18n.t('tutorial.liftDetailsDepthGraph.description'),
      targetId: 'lift_details_depth_graph',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Continue to the next step (review feedback)
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'lift_details_review_feedback',
      title: i18n.t('tutorial.liftDetailsReviewFeedback.title'),
      description: i18n.t('tutorial.liftDetailsReviewFeedback.description'),
      targetId: 'lift_details_review_feedback',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Open the feedback slideshow as if user clicked on it
          if (global.openFeedbackSlideshow) global.openFeedbackSlideshow();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'how_it_works_modal',
      title: i18n.t('tutorial.howItWorksModal.title'),
      description: i18n.t('tutorial.howItWorksModal.description'),
      targetId: 'how_it_works_modal',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          if (global.navigateToFeedbackPage) global.navigateToFeedbackPage();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to lift details - this will be handled by the component's navigation
          // The tutorial will go back to the previous step
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'feedback_slideshow',
      title: i18n.t('tutorial.feedbackSlideshow.title'),
      description: i18n.t('tutorial.feedbackSlideshow.description'),
      targetId: 'feedback_slideshow',
      tooltipPlacement: 'bottom',
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
          // Go back to how it works step within the feedback slideshow
          // This will be handled by the component's internal state
          if (global.navigateToHowItWorksStep) global.navigateToHowItWorksStep();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'feedback_issues',
      title: i18n.t('tutorial.feedbackIssues.title'),
      description: i18n.t('tutorial.feedbackIssues.description'),
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
          // Go back to image view by triggering the left chevron
          // This will move from flaws/issues view back to image view
          if (global.navigateToImage) global.navigateToImage();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'feedback_tips',
      title: i18n.t('tutorial.feedbackTips.title'),
      description: i18n.t('tutorial.feedbackTips.description'),
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
          // Go back to issues page by triggering the left chevron
          // This will move from improvement/tips view back to flaws/issues view
          if (global.navigateToIssues) global.navigateToIssues();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'home_see_all_lifts',
      title: i18n.t('tutorial.homeSeeAllLifts.title'),
      description: i18n.t('tutorial.homeSeeAllLifts.description'),
      targetId: 'home_see_all_lifts',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Navigate to library screen
          if ((global as any).navigateToLibrary) (global as any).navigateToLibrary();
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
      id: 'library_screen',
      title: i18n.t('tutorial.libraryScreen.title'),
      description: i18n.t('tutorial.libraryScreen.description'),
      targetId: 'library_screen',
      tooltipPlacement: 'bottom',
      onNext: () => {
        try {
          // Navigate back to home screen
          if ((global as any).navigateToHome) (global as any).navigateToHome();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      onPrev: () => {
        try {
          // Go back to home see all lifts step
          // This will be handled by the tutorial navigation
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
    },
    {
      id: 'home_performance_icon',
      title: i18n.t('tutorial.homePerformanceIcon.title'),
      description: i18n.t('tutorial.homePerformanceIcon.description'),
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
      id: 'performance_metrics',
      title: i18n.t('tutorial.performanceMetrics.title'),
      description: i18n.t('tutorial.performanceMetrics.description'),
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
      
    },
    {
      id: 'performance_over_weight',
      title: i18n.t('tutorial.performanceChartsOverWeight.title'),
      description: i18n.t('tutorial.performanceChartsOverWeight.description'),
      targetId: 'performance_over_weight',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Scroll to the bottom so the next section is fully visible
          try { (global as any).scrollToPerformanceBottom?.(); } catch {}
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'performance_over_time',
      title: i18n.t('tutorial.performanceChartsOverTime.title'),
      description: i18n.t('tutorial.performanceChartsOverTime.description'),
      targetId: 'performance_charts_over_time',
      tooltipPlacement: 'top',
      onNext: () => {
        try {
          // Navigate to settings screen
          if (global.navigateToSettings) global.navigateToSettings();
        } catch (error) {
          console.warn('Tutorial step error:', error);
        }
      },
      
    },
    {
      id: 'settings_first_card',
      title: i18n.t('tutorial.settingsFirstCard.title'),
      description: i18n.t('tutorial.settingsFirstCard.description'),
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
      
    },
    {
      id: 'settings_support_email',
      title: i18n.t('tutorial.settingsSupportEmail.title'),
      description: i18n.t('tutorial.settingsSupportEmail.description'),
      targetId: 'settings_support_email',
      tooltipPlacement: 'bottom',
      onNext: async () => {
        try {
          // Clear seeded lifts
          try { global.clearTemporaryLifts?.(); } catch {}
          // Show the all done modal immediately
          if ((global as any).showTutorialAllDoneModal) {
            (global as any).showTutorialAllDoneModal();
          }
          // Persist walkthrough completion to backend
          try { await (global as any).completeTutorial?.(); } catch {}
          try { (global as any).navigateToHome?.(); } catch {}
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
        await new Promise(resolve => setTimeout(resolve, 800));
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
      
      // Wait for animations and interactions to finish (e.g., scroll) before measuring
      await new Promise<void>(resolve => {
        try { InteractionManager.runAfterInteractions(() => resolve()); } catch { resolve(); }
      });
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
  const start = useCallback(async () => {
    try {
      // Clear any pending timeouts first
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Clear any previous tutorial completion flags
      await AsyncStorage.removeItem('justFinishedTutorial');
      
      setIsActive(true);
      setIsTransitioning(true); // Start with transition state
      setCurrentStepIndex(0);
      
      // Small delay to ensure smooth first step appearance
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        timeoutRef.current = null;
      }, 200);
    } catch (error) {
      console.warn('Failed to start tutorial:', error);
    }
  }, []);

  const next = useCallback(async () => {
    try {
      const step = steps[currentStepIndex];
      
      if (step?.onNext) {
        try {
          setIsProcessingStep(true);
          const maybePromise = step.onNext();
          if (maybePromise && typeof (maybePromise as any).then === 'function') {
            await (maybePromise as Promise<void>);
          }
        } finally {
          setIsProcessingStep(false);
        }
      }
      
      // Instantly hide overlay during step change (no fade)
      setIsTransitioning(false);
      setCurrentRect(null);
      
      // Immediately clear all registrations to prevent old overlays from being measured
      registrationsRef.current.clear();
      
      // Add a delay to ensure any UI changes from onNext are complete
      const isModalOpeningStep = step?.id === 'add_button' || step?.id === 'add_options_upload';
      const isFeedbackStep = step?.id === 'feedback_slideshow' || step?.id === 'feedback_issues' || step?.id === 'feedback_tips';
      const isNavigateHomeStep = step?.id === 'settings_support_email';
      const delay = isModalOpeningStep ? 300 : isFeedbackStep ? 300 : isNavigateHomeStep ? 100 : 100;
      
      timeoutRef.current = setTimeout(() => {
        const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
        setCurrentStepIndex(nextIndex);
        // Keep overlay hidden until measurement happens; no fade back-in here
      }, delay);
    } catch (error) {
      console.warn('Failed to go to next tutorial step:', error);
      setIsTransitioning(false);
    }
  }, [currentStepIndex, steps]);



  const stop = useCallback(async() => {
    try {
      // Clear any pending timeouts first
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Immediately stop all tutorial activity
      setIsActive(false);
      setIsTransitioning(false);
      setIsProcessingStep(false);
      setCurrentStepIndex(0);
      setCurrentRect(null);
      
      // Clear all registrations to prevent any pending measurements
      registrationsRef.current.clear();
      
      // Update local state immediately to prevent delayed UI updates
      updateUserDetails('walkthroughCompleted', true);
      // Then make the API call
      await editUserDetails({ walkthrough_completed: true });
      await refetchUserDetails();
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
    isProcessingStep,
    currentStepIndex,
    steps,
    currentRect,
    start,
    next,
    stop,
    registerTarget,
    unregisterTarget,
    cleanupStaleRegistrations,
    getStepNumber,
    setCurrentStepIndex,
    setCurrentRect,
  }), [isActive, isTransitioning, isProcessingStep, currentStepIndex, steps, currentRect, start, next, stop, registerTarget, unregisterTarget, cleanupStaleRegistrations, getStepNumber, setCurrentStepIndex, setCurrentRect]);

  // Expose stop method globally for tutorial completion
  React.useEffect(() => {
    global.completeTutorial = stop;
    return () => {
      global.completeTutorial = undefined;
    };
  }, [stop]);

  // Expose a remeasure helper so screens can force recalculation after scrolls/transitions
  const remeasure = React.useCallback(async () => {
    try {
      await measureCurrentTarget(currentStepIndex);
    } catch (error) {
      console.warn('Failed to remeasure tutorial target:', error);
    }
  }, [currentStepIndex, measureCurrentTarget]);

  React.useEffect(() => {
    (global as any).remeasureTutorialTarget = () => {
      try { void remeasure(); } catch {}
    };
    return () => {
      try { delete (global as any).remeasureTutorialTarget; } catch {}
    };
  }, [remeasure]);

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
                   targetId === 'feedback_slideshow' ? 300 :
                   targetId === 'home_see_all_lifts' ? 500 :
                   targetId === 'home_performance_icon' ? 500 : 
                   targetId === 'upload_practices_cta' ? 500 :
                   targetId === 'home_first_lift_card' ? 500 :
                   targetId === 'library_screen' ? 500 :
                   targetId === 'lift_details_depth_graph' ? 300 :
                   targetId === 'performance_over_weight' ? 500 :
                   targetId === 'performance_charts_over_time' ? 500 :
                   100;
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
    Alert.alert('Error', 'An error occurred with the tutorial. Please try again.');
    // Return a fallback ref if there's an error
    return { ref: React.useRef<any>(null) };
  }
}



