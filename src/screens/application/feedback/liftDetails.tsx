import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, TextInput, Keyboard, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Ellipsis, Heart, Trash2, X, Pencil, Download } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeableLiftDetailsGraphs from '../../../components/ui/swipeables/SwipeableLiftDetailsGraphs';
import { OrangeGradientButton } from '../../../components/ui/buttons/OrangeGradientButton';
import { useQueryClient } from '@tanstack/react-query';
import { hapticFeedback } from '../../../utils/haptic';
import { useLiftData, ILiftData, extractObjectKeyFromUrl, signPath } from '../../../context/LiftDataContext';
import { useLoadingLifts } from '../../../context/LoadingLiftsContext';
import { favouriteLift as favouriteLiftApi, updateLiftWeight } from '../../../services/lifts/liftService';
import { deleteLift } from '../../../services/lifts/liftDeletionService';
import { showAlert } from '../../../services/alertService';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { useUserDetails } from '../../../context/UserDetailsContext';
import { useUserCheckIns } from '../../../context/UserCheckInsContext';
import i18n from '../../../utils/i18n';
import { VideoPlayerComponentProps, LiftDetailsProps } from '../../../types/Lifts';
import { track } from '../../../services/analytics';
import { PermissionContainer } from '../../../components/ui/PermissionContainer';
import { openAppSettings } from '../../../utils/openAppSettings';
import * as MediaLibrary from 'expo-media-library';
import { downloadVideoToLibrary } from '../../../services/downloadVideoService';

function VideoPlayerComponent({ videoUri, onReady }: { videoUri: string | number; onReady: () => void }) {
  const player = useVideoPlayer(videoUri as any, (player) => {
    player.loop = false;
    player.showNowPlayingNotification = false;
    player.play();
  });

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onReady();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [onReady]);

  return (
    <VideoView
      player={player}
      style={styles.video}
    />
  );
}

export function LiftDetails({ onClose, onShowFeedbackSlideshow, liftData: initialLiftData }: LiftDetailsProps) {
  const { removeLift, updateLift, refreshLifts, liftData: contextLiftData, favouriteLiftAndRefresh } = useLiftData();
  const { removeLift: removeLoadingLift } = useLoadingLifts();
  const { userDetails } = useUserDetails();
  const { invalidateAndRefetch, optimisticRemoveToday } = useUserCheckIns();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditWeightModal, setShowEditWeightModal] = useState(false);
  const [resolvedPoseUrl, setResolvedPoseUrl] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [editWeight, setEditWeight] = useState('');
  const editWeightInputRef = useRef<TextInput>(null);
  const [showMediaPermission, setShowMediaPermission] = useState(false);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editWeightShouldRender, setEditWeightShouldRender] = useState(showEditWeightModal);
  const editWeightOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation value for finger icon
  const fingerTranslateY = useMemo(() => new Animated.Value(0), []);
  
  // Track screen view on mount
  useEffect(() => {
    track('Screen viewed', { screen_name: 'Lift Details' });
  }, []);
  
  // Tutorial target for the review feedback button
  const { ref: reviewFeedbackRef } = useTutorialTarget('lift_details_review_feedback');
  
  // Tutorial targets for graphs
  const { ref: formGraphRef } = useTutorialTarget('lift_details_form_graph');
  const { ref: depthGraphRef } = useTutorialTarget('lift_details_depth_graph');
  
  // Simple boolean for favourite state - starts with the initial value
  const [isFavourite, setIsFavourite] = useState(initialLiftData.isFavourite);

  // Get the current lift data from context, falling back to the prop if not found
  const currentLiftData = contextLiftData.find(lift => lift.id === initialLiftData.id) || initialLiftData;

  // Update local state when context data changes
  useEffect(() => {
    const freshData = contextLiftData.find(lift => lift.id === initialLiftData.id);
    if (freshData) {
      setIsFavourite(freshData.isFavourite);
    }
  }, [contextLiftData, initialLiftData.id]);

  // Re-sign pose video URL on open for fresh access
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const source = (contextLiftData.find(l => l.id === initialLiftData.id)?.poseVideoURL) || initialLiftData.poseVideoURL;
      if (!source) { setResolvedPoseUrl(null); return; }
      // If this is a static require() number, use it directly
      if (typeof source === 'number') { setResolvedPoseUrl(source); return; }
      try {
        const key = await extractObjectKeyFromUrl(typeof source === 'string' ? source : undefined);
        if (key) {
          const signed = await signPath(key);
          if (!cancelled) setResolvedPoseUrl(signed || (typeof source === 'string' ? source : null));
        } else {
          // If we can't extract a key, the source might already be a valid URL or path
          if (!cancelled) setResolvedPoseUrl(typeof source === 'string' ? source : null);
        }
      } catch (error) {
        console.warn('Failed to resolve pose video URL:', error);
        if (!cancelled) setResolvedPoseUrl(typeof source === 'string' ? source : null);
      }
    })();
    return () => { cancelled = true; };
  }, [contextLiftData, initialLiftData.id]);

  // Auto-focus input when edit weight modal opens
  useEffect(() => {
    if (showEditWeightModal) {
      setEditWeightShouldRender(true);
      editWeightOpacity.setValue(0);
      Animated.timing(editWeightOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
      const timer = setTimeout(() => {
        editWeightInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    Animated.timing(editWeightOpacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setEditWeightShouldRender(false);
    });
  }, [showEditWeightModal]);

  const handleClose = () => {
    hapticFeedback.selection();
    onClose();
  };

  const handleReviewFeedback = () => {
    hapticFeedback.selection();
    // Track lift details clicks for review feedback
    track('Lift details clicks', { event: 'Review feedback' });
    // Navigate to HowItWorks screen instead of directly to FeedbackSlideshow
    // The navigation will be handled by the parent component
    onShowFeedbackSlideshow();
  };

  // Check if feedback array is empty
  const hasFeedback = currentLiftData.analysis.feedback && currentLiftData.analysis.feedback.length > 0;

  const handleDeleteLift = () => {
    hapticFeedback.selection();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    // Track lift details clicks for delete submit
    track('Lift details clicks', { event: 'Delete submit' });
    setIsDeleting(true);
    try {
      const success = await deleteLift(currentLiftData.id, currentLiftData);
      if (success) {
        // Remove from both contexts to ensure UI updates immediately
        removeLift(currentLiftData.id);
        removeLoadingLift(currentLiftData.id);
        // Invalidate LiftDataContext to refresh lift data
        refreshLifts();
        // Optimistically update check-ins if deleting today's lift
        try {
          const today = new Date().toISOString().slice(0, 10);
          const m = currentLiftData.liftDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
          if (m) {
            const [, dd, mm, yyyy] = m;
            const iso = `${yyyy}-${mm}-${dd}`;
            if (iso === today) optimisticRemoveToday();
          }
        } catch (_) {}
        invalidateAndRefetch();
        setShowDeleteModal(false);
        onClose();
      }
    } catch (error) {
      // Error handling is done in the manualDeleteLiftCardData function
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    hapticFeedback.selection();
    // Track lift details clicks for delete cancel
    track('Lift details clicks', { event: 'Delete cancel' });
    setShowDeleteModal(false);
  };

  const handleStarPress = async () => {
    hapticFeedback.selection();
    // Track lift details clicks for favourite
    track('Lift details clicks', { event: 'Favourite' });
    
    // Immediately toggle the favourite state
    setIsFavourite(prev => !prev);
    
    // Make API call in background - no need to wait for response
    favouriteLiftAndRefresh(currentLiftData.id);
    
    // Ensure the main lifts list refetches with the correct key
    void refreshLifts();
  };

  const handleActionSheet = () => {
    hapticFeedback.selection();
    // Track lift details clicks for open menu
    track('Lift details clicks', { event: 'Open menu' });
    setShowDropdown(!showDropdown);
  };

  const handleFavourite = () => {
    hapticFeedback.success();
    track('Lift details clicks', { event: 'Favourite' });
    handleStarPress();
    setShowDropdown(false);
  };

  const handleDelete = () => {
    hapticFeedback.selection();
    // Track lift details clicks for delete
    track('Lift details clicks', { event: 'Delete' });
    setShowDropdown(false);
    handleDeleteLift();
  };

  const handleEditWeight = () => {
    hapticFeedback.selection();
    // Track lift details clicks for edit weight
    track('Lift details clicks', { event: 'Edit weight' });
    // Initialize edit weight with current weight value
    const currentWeight = userDetails?.unitSystem === 'imperial' 
      ? Math.round((currentLiftData.metricWeight || 0) * 2.20462).toString()
      : (currentLiftData.metricWeight || 0).toString();
    setEditWeight(currentWeight);
    setShowEditWeightModal(true);
  };

  const handleEditWeightCancel = () => {
    hapticFeedback.selection();
    // Track lift details clicks for edit weight reset
    track('Lift details clicks', { event: 'Edit weight cancel' });
    setShowEditWeightModal(false);
    setEditWeight('');
  };

  const handleEditWeightApply = async () => {
    hapticFeedback.selection();
    // Track lift details clicks for edit weight apply
    track('Lift details clicks', { event: 'Edit weight apply' });
    const metricWeight = parseFloat(editWeight);
    if (metricWeight > 0 && !isUpdatingWeight) {
      setIsUpdatingWeight(true);
      try {
        const result = await updateLiftWeight(
          currentLiftData.id, 
          metricWeight, 
          userDetails?.unitSystem || 'metric'
        );
        
        if (result.success) {
          // Update the lift data immediately for instant UI feedback
          updateLift(currentLiftData.id, { metricWeight: userDetails?.unitSystem === 'imperial' ? metricWeight / 2.20462 : metricWeight });
          
          // Invalidate the specific lift query to refresh data
          queryClient.invalidateQueries({ queryKey: ['lift', currentLiftData.id] });
          
          // Ensure the main lifts list refetches with the correct key
          void refreshLifts();
          
          hapticFeedback.success();
          setShowEditWeightModal(false);
          setEditWeight('');
        } else {
          hapticFeedback.error();
          setShowEditWeightModal(false);
          setEditWeight('');
          showAlert(
            i18n.t('feedback.updateFailed.weight'), 
            i18n.t('feedback.updateFailed.message'),
            undefined,
            'Weight edit failed'
          );
        }
      } catch (error) {
        hapticFeedback.error();
        setShowEditWeightModal(false);
        setEditWeight('');
        showAlert(
          i18n.t('feedback.updateFailed.weight'), 
          i18n.t('feedback.updateFailed.message'),
          undefined,
          'Weight edit failed'
        );
      } finally {
        setIsUpdatingWeight(false);
      }
    }
  };

  // Check media library permission
  const checkMediaPermission = async () => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      setHasMediaPermission(status === 'granted');
    } catch (e) {
      setHasMediaPermission(false);
    }
  };

  // Request media library permission
  const requestMediaPermissionFromUser = async () => {
    try {
      const result = await MediaLibrary.requestPermissionsAsync();
      if (!result.granted && result.canAskAgain === false) {
        openAppSettings();
        setHasMediaPermission(false);
        return;
      }
      setHasMediaPermission(result.granted);
      if (result.granted) {
        setShowMediaPermission(false);
        // Retry download after permission is granted
        handleDownload();
      }
    } catch (e) {
      setHasMediaPermission(false);
    }
  };

  // Finger animation effect
  useEffect(() => {
    if (showMediaPermission) {
      const startFingerAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(fingerTranslateY, {
              toValue: -15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(fingerTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      
      startFingerAnimation();
    } else {
      // Reset animation when not showing permission screen
      fingerTranslateY.setValue(0);
    }
  }, [showMediaPermission, fingerTranslateY]);

  const handleDownload = async () => {
    hapticFeedback.selection();
    // Track lift details clicks for download
    track('Lift details clicks', { event: 'Download' });
    
    setIsDownloading(true);
    
    try {
      // Check permission first
      await checkMediaPermission();
      
      if (hasMediaPermission === false) {
        setShowMediaPermission(true);
        return;
      }
      
      const success = await downloadVideoToLibrary({
        videoUrl: resolvedPoseUrl,
        onSuccess: () => {
          // Video downloaded successfully
        },
        onError: (error: any) => {
          // Video download failed
        },
        onPermissionRequired: () => {
          setShowMediaPermission(true);
        }
      });
    } finally {
      setIsDownloading(false);
      setShowDropdown(false);
    }
  };

  const isEditWeightValid = () => {
    const metricWeight = parseFloat(editWeight);
    if (metricWeight <= 0) return false;
    
    // Get current weight in the same unit system as the input
    const currentWeight = userDetails?.unitSystem === 'imperial' 
      ? Math.round((currentLiftData.metricWeight || 0) * 2.20462)
      : (currentLiftData.metricWeight || 0);
    
    return metricWeight !== currentWeight;
  };

  // Format date to "Aug 25th, 2025" format
  function formatDate(dateString: string | null) {
    if (!dateString) return 'Aug 25th, 2025';
    
    // Parse dd-mm-yyyy format
    const parts = dateString.split('-');
    if (parts.length !== 3) return 'Aug 25th, 2025';
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date constructor
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Aug 25th, 2025';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[month];
    
    // Add ordinal suffix to day
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    
    return `${monthName} ${day}${suffix}, ${year}`;
  }

  // No chart data computed here; handled by SwipeableLiftDetailsGraphs
  
  // Show permission screen if no media library permission
  if (showMediaPermission) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: '#1d293d' }
        ]}
      >
        <PermissionContainer
          title={i18n.t('upload.permissionTitle')}
          dialogText={i18n.t('upload.permissionMessage')}
          fingerTranslateY={fingerTranslateY}
          allowButtonText={i18n.t('upload.allow')}
          dontAllowButtonText={i18n.t('upload.dontAllow')}
          onDontAllow={() => {
            // Don't allow just stays in this state
          }}
          onAllow={requestMediaPermissionFromUser}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerCard}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{i18n.t('feedback.liftDetails')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.ellipsisButton} 
            onPress={handleActionSheet}
            activeOpacity={0.7}
          >
            <Ellipsis size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {/* Video Player */}
          <View style={styles.videoContainer}>
            {resolvedPoseUrl ? (
              <VideoPlayerComponent
                key={String(resolvedPoseUrl)} // force remount when URL changes
                videoUri={resolvedPoseUrl}
                onReady={() => {}}
              />
            ) : (
              <View style={styles.videoLoadingOverlay}>
                <ActivityIndicator />
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Container with Chart, Cards, and Review Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomBackground}>
          {/* Pills Row */}
          <View style={styles.pillsRow}>
            <View style={styles.pillWithMaxWidth}>
              <Text 
                style={styles.pillTextEllipsis}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentLiftData.liftType || 'Bench Press'}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{formatDate(currentLiftData.liftDate)}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{currentLiftData.liftTime || '--:--'}</Text>
            </View>
          </View>
          {/* Swipeable graphs (line + bar) */}
          <SwipeableLiftDetailsGraphs data={currentLiftData} formGraphRef={formGraphRef} depthGraphRef={depthGraphRef} />

          {/* Weight, Reps, and Accuracy Cards Row */}
          <View style={[styles.cardsRow, styles.bottomCardsRow]}>
            {/* Weight Card - Wider */}
            <View style={[styles.infoCard, styles.weightCard]}>
              <View style={styles.weightCardTitleRow}>
                <Text style={styles.infoCardTitle}>{i18n.t('feedback.weight')}</Text>
                <TouchableOpacity 
                  style={styles.editWeightButton}
                  onPress={handleEditWeight}
                  activeOpacity={0.7}
                >
                  <Pencil size={12} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              <Text style={styles.infoCardValue}>
                {userDetails?.unitSystem === 'imperial' 
                  ? `${Math.round((currentLiftData.metricWeight || 0) * 2.20462)} ${i18n.t('feedback.lbs')}`
                  : `${currentLiftData.metricWeight || '--'} ${i18n.t('feedback.kg')}`
                }
              </Text>
            </View>
            
            {/* Reps Card */}
            <View style={[styles.infoCard, styles.repsCard]}>
              <Text style={styles.infoCardTitle}>{i18n.t('feedback.reps')}</Text>
              <Text style={styles.infoCardValue}>
                {currentLiftData.reps || '--'}
              </Text>
            </View>

            {/* Accuracy Card */}
            <View style={[styles.infoCard, styles.accuracyCard]}>
              <Text style={styles.infoCardTitle}>{i18n.t('feedback.accuracy')}</Text>
              <Text style={styles.infoCardValue}>
                {Math.round(currentLiftData.analysis.accuracy)}%
              </Text>
            </View>
          </View>

          {/* Review Feedback Button Card */}
          <View style={styles.feedbackButtonCard}>
            <View ref={reviewFeedbackRef}>
              <TouchableOpacity
                style={[styles.reviewFeedbackButton, !hasFeedback && styles.reviewFeedbackButtonDisabled]}
                onPress={hasFeedback ? handleReviewFeedback : undefined}
                activeOpacity={hasFeedback ? 0.8 : 1}
                disabled={!hasFeedback}
              >
                <Text style={[styles.reviewFeedbackButtonText, !hasFeedback && styles.reviewFeedbackButtonTextDisabled]}>
                  {hasFeedback ? i18n.t('feedback.reviewFeedback') : i18n.t('feedback.noFeedback')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Custom Dropdown Modal */}
      {showDropdown && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={handleDownload}
              activeOpacity={0.7}
              disabled={isDownloading}
            >
              <Text style={[styles.dropdownOptionText, isDownloading && styles.dropdownOptionTextDisabled]}>
                {i18n.t('feedback.download')}
              </Text>
              <View style={styles.dropdownIconContainer}>
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Download size={22} color="#ffffff" />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={handleFavourite}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownOptionText}>{i18n.t('feedback.favourite')}</Text>
              <View style={styles.dropdownIconContainer}>
                <Heart size={22} color="#FF3B30" fill={isFavourite ? "#FF3B30" : "none"} />
              </View>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownOption} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownOptionTextDestructive}>{i18n.t('feedback.manualDeleteLiftCardData')}</Text>
              <View style={styles.dropdownIconContainer}>
                <Trash2 size={22} color="#FF3B30" />
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Delete Lift Modal */}
      {showDeleteModal && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleDeleteCancel}
        >
          <TouchableOpacity 
            style={styles.modalContainer} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={handleDeleteCancel}
            >
              <X size={20} color="#000000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.modalTitle}>{i18n.t('feedback.manualDeleteLiftCardData')}</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>{i18n.t('feedback.deleteLiftConfirmation')}</Text>

            {/* Action buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonOutlined]} 
                onPress={handleDeleteCancel}
                disabled={isDeleting}
              >
                <Text style={styles.modalButtonOutlinedText}>{i18n.t('feedback.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]} 
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>{i18n.t('feedback.delete')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Edit Weight Modal */}
      {editWeightShouldRender && (
        <Animated.View style={[styles.modalFadeWrapper, { opacity: editWeightOpacity }]}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={handleEditWeightCancel}
          >
            <TouchableOpacity 
              style={styles.modalContainer} 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
            >
            {/* Close button */}
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={handleEditWeightCancel}
            >
              <X size={20} color="#000000" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.modalTitle}>{i18n.t('feedback.editWeight')}</Text>

            {/* Weight Input Section */}
            <View style={styles.editWeightSection}>
              <View style={styles.editWeightInputContainer}>
                <TextInput
                  ref={editWeightInputRef}
                  style={styles.editWeightInput}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  placeholder="1"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  textContentType="none"
                  autoComplete="off"
                  autoCorrect={false}
                />
                <Text style={styles.editWeightUnitText}>
                  {userDetails?.unitSystem === 'imperial' ? 'lbs' : 'kg'}
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonOutlined]} 
                onPress={handleEditWeightCancel}
              >
                <Text style={styles.modalButtonOutlinedText}>{i18n.t('feedback.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary, (!isEditWeightValid() || isUpdatingWeight) && styles.modalButtonDisabled]} 
                onPress={handleEditWeightApply}
                disabled={!isEditWeightValid() || isUpdatingWeight}
              >
                {isUpdatingWeight ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonPrimaryText, (!isEditWeightValid() || isUpdatingWeight) && styles.modalButtonTextDisabled]}>{i18n.t('feedback.apply')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
        </Animated.View>
      )}
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
    backgroundColor: '#000',
    zIndex: 1000,
  },
  safeArea: {
    flex: 1,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: 'relative',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  ellipsisButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  titleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: 'auto',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SF Pro Display',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  videoContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'black',
    marginBottom: 4,
    marginTop: -10,
  },
  video: {
    width: '100%',
    height: '67%',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 4,
  },
  optionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  reviewFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewFeedbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginLeft: 12,
  },
  pillsRow: {
    marginTop: -8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6,
    gap: 12,
  },
  pill: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pillWithMaxWidth: {
    backgroundColor: '#000000',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'SF Pro Display',
  },
  pillTextEllipsis: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'SF Pro Display',
    flexShrink: 1,
  },
  orangePillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'SF Pro Display',
  },
  orangePill: {
    backgroundColor: '#ffb86a',
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    width: '100%',
    marginLeft: -24,
  },
  chart: {
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 180,
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 180, // Ensure container doesn't expand
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 30, // Ensure consistent height
    width: '100%', // Take full width of container
    maxWidth: 164, // Account for container padding (180 - 16)
  },
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Display',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
    maxWidth: 120, // Constrain text width to prevent pushing icon
  },
  dropdownOptionTextDisabled: {
    color: '#8E8E93',
    opacity: 0.6,
  },
  dropdownOptionTextDestructive: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
    fontFamily: 'SF Pro Display',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
    maxWidth: 120, // Constrain text width to prevent pushing icon
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 8,
  },
  dropdownIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 200,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'left',
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 60,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonOutlined: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  modalButtonPrimary: {
    backgroundColor: '#000000',
  },
  modalButtonOutlinedText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  modalButtonPrimaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.7,
  },
  modalButtonTextDisabled: {
    color: '#C7C7CC',
  },
  modalFadeWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  reviewFeedbackButton: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#000000',
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewFeedbackButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
  },
  reviewFeedbackButtonDisabled: {
    backgroundColor: '#8E8E93',
    opacity: 0.6,
  },
  reviewFeedbackButtonTextDisabled: {
    color: '#C7C7CC',
  },
  bottomContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f1f5f9',
  },
  bottomBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    height: height * 0.585,
  },
  bottomCard: {
    marginBottom: 20,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderColor: '#e2e8f0',
  },
  bottomCardsRow: {
    marginBottom: 10,
  },
  bottomButton: {
    marginTop: 10,
  },
  feedbackButtonCard: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: -10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    height: 70, // Fixed height for all info cards
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Display',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'SF Pro Display',
  },
  // Weight card styles
  weightCard: {
    width: "auto",
    marginRight: 8,
    height: 70, // Ensure consistent height
  },
  weightCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  repsCard: {
    width: "auto",
    flex: 0, // Override flex to use fixed width
    height: 70, // Ensure consistent height
  },
  editWeightButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    marginTop: -6,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyCard: {
    width: "auto",
    flex: 0, // Override flex to use fixed width
    marginBottom: 8,
    marginLeft: 8,
    height: 70, // Ensure consistent height
  },
  // Edit weight modal styles
  editWeightSection: {
    marginBottom: 24,
  },
  editWeightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'SF Pro Display',
  },
  editWeightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 40,
  },
  editWeightInput: {
    flex: 1,
    color: '#000000',
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'SF Pro Display',
    textAlign: 'center',
  },
  editWeightUnitText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 8,
    fontFamily: 'SF Pro Display',
  },
}); 