import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTutorial } from '../context/TutorialContext';
import Svg, { Path, Rect } from 'react-native-svg';
import { hapticFeedback } from '../utils/haptic';

export function TutorialOverlay() {
  const { isActive, isTransitioning, steps, currentStepIndex, currentRect, next, prev } = useTutorial();
  
  // Don't render anything if tutorial is not active, is transitioning, or has no current rect
  if (!isActive || isTransitioning || !currentRect) return null;

  // Ensure we have a valid step index
  if (currentStepIndex < 0 || currentStepIndex >= steps.length) {
    console.warn('Invalid step index in TutorialOverlay:', currentStepIndex);
    return null;
  }

  const step = steps[currentStepIndex];
  if (!step) return null; // Safety check
  
  const hasPrev = currentStepIndex > 0;
  const hasNext = currentStepIndex < steps.length - 1; // Changed to prevent going beyond last step

  const { width: screenW, height: screenH } = Dimensions.get('window');
  const highlight = currentRect
    ? {
        x: Math.max(currentRect.x - 8, 0),
        y: Math.max(currentRect.y - 8, 0),
        w: Math.min(currentRect.width + 16, screenW),
        h: Math.min(currentRect.height + 16, screenH),
      }
    : null;

  // Add a small delay before rendering to prevent flickering during transitions
  const [shouldRender, setShouldRender] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      setShouldRender(false);
    };
  }, [currentStepIndex, currentRect]);
  
  // Special case for review feedback step: ensure overlay stays stable
  const isReviewFeedbackStep = step?.id === 'lift_details_review_feedback';
  const shouldForceRender = isReviewFeedbackStep && currentRect;
  
  if (!shouldRender && !shouldForceRender) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Dim with cut-out around the target */}
        {highlight && (
          <Svg style={styles.mask} pointerEvents="none">
            <Path
              fill="rgba(0,0,0,0.45)"
              fillRule="evenodd"
              d={`M0 0 H${screenW} V${screenH} H0 Z M${highlight.x} ${highlight.y} H${highlight.x + highlight.w} V${highlight.y + highlight.h} H${highlight.x} Z`}
            />
            <Rect
              x={highlight.x}
              y={highlight.y}
              width={highlight.w}
              height={highlight.h}
              rx={12}
              ry={12}
              stroke="#FFFFFF"
              strokeWidth={2}
              fill="transparent"
            />
          </Svg>
        )}

        {/* Step number badge */}
        {highlight && (
          <View style={[styles.stepBadge, { top: highlight.y - 12, left: highlight.x - 12 }]}>
            <Text style={styles.stepBadgeText}>{currentStepIndex + 1}</Text>
          </View>
        )}

        {/* Tooltip container */}
        <View pointerEvents="box-none" style={[
          styles.tooltipContainer,
          {
            // Position based on tooltipPlacement parameter
            ...(step.tooltipPlacement === 'inside-bottom' ? {
              // For inside-bottom placement: position tooltip inside the bottom portion of the highlight
              top: currentRect ? currentRect.y + currentRect.height - 200 : undefined,
              bottom: undefined,
            } : step.tooltipPlacement === 'bottom' ? {
              // For bottom placement: top edge of tooltip on bottom edge of highlight + gap
              top: currentRect ? currentRect.y + currentRect.height + 20 : 40,
              bottom: undefined,
            } : {
              // For top placement (default): bottom edge of tooltip above the highlight
              bottom: undefined,
              top: currentRect ? currentRect.y - 160 : 40, // 160px above the component to avoid overlap
              // If there's not enough space above, position below instead
              ...(currentRect && currentRect.y < 200 && {
                top: undefined,
                bottom: currentRect.y + currentRect.height + 20,
              }),
            }),
            // Add subtle transform for smooth appearance
            transform: [{ scale: 1 }],
          }
        ]}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.navButton, !hasPrev && styles.navButtonDisabled]}
              onPress={() => {
                hapticFeedback.selection();
                prev();
              }}
              disabled={!hasPrev}
              activeOpacity={0.8}
            >
              <Text style={[styles.navButtonText, !hasPrev && styles.navButtonTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButtonPrimary}
              onPress={() => {
                hapticFeedback.selection();
                next();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.navButtonPrimaryText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 999999,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
  },
  highlight: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.08)',
},
  stepBadge: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tooltipContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  description: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navButtonDisabled: {
    borderColor: '#C7C7CC',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  navButtonTextDisabled: {
    color: '#C7C7CC',
  },
  navButtonPrimary: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});


