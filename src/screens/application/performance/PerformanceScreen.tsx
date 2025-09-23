import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, Dimensions, InteractionManager } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { SwipeableLineGraphCard } from '../../../components/ui/SwipeableLineGraphCard';
import { StreakCalendar } from '../../../components/ui/StreakCalendar';
import { useLiftData } from '../../../context/LiftDataContext';
import { useUserDetails } from '../../../context/UserDetailsContext';
import { useUserCheckIns } from '../../../context/UserCheckInsContext';
import { hapticFeedback } from '../../../utils/haptic';
import i18n from '../../../utils/i18n';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { CircleQuestionMark, X, MailPlus } from 'lucide-react-native';
import { CircularProgressChart } from '../../../components/icons/icons';
import { openMetricsFeedbackEmail } from '../../../services/emailService';
import { track } from '../../../services/analytics';

interface PerformanceScreenProps {
  onTriggerAddOptions?: () => void;
}



export function PerformanceScreen({ onTriggerAddOptions }: PerformanceScreenProps) {
  const { liftData } = useLiftData();
  const { userDetails } = useUserDetails();
  const { currentStreak } = useUserCheckIns();
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; message: string }>({ title: '', message: '' });
  
  // Track screen view on mount
  useEffect(() => {
    track('Screen viewed', { screen_name: 'Progress' });
  }, []);
  
  // Tutorial target registration
  const { ref: performanceMetricsRef } = useTutorialTarget('performance_metrics');
  const { ref: performanceOverWeightRef } = useTutorialTarget('performance_over_weight');
  const { ref: performanceOverTimeRef } = useTutorialTarget('performance_charts_over_time');

  // Expose scroll helpers for tutorial to bring charts into view
  React.useEffect(() => {
    (global as any).scrollToPerformanceOverWeight = () => {
      try {
        (performanceOverWeightRef as any)?.current?.measure?.((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
          try { (scrollRef as any)?.current?.scrollTo({ y: Math.max(0, pageY - 120), animated: true }); } catch {}
        });
      } catch {}
    };
    // Removed scrollToPerformanceOverTime in favor of scrollToPerformanceBottom
    (global as any).scrollToPerformanceBottom = () => {
      try {
        // Scroll down by 50% of the viewport height from current offset, clamped to max
        const halfScreen = Math.max(0, Math.round(viewHeightRef.current * 0.6));
        const maxScroll = Math.max(0, contentHeightRef.current - viewHeightRef.current);
        const nextY = Math.min(maxScroll, Math.max(0, currentScrollYRef.current + halfScreen));
        (scrollRef as any)?.current?.scrollTo?.({ y: nextY, animated: true });

        // After the animated scroll, force tutorial to remeasure to get final position
        setTimeout(() => {
          try {
            InteractionManager.runAfterInteractions(() => {
              try { (global as any).remeasureTutorialTarget?.(); } catch {}
            });
          } catch {
            try { (global as any).remeasureTutorialTarget?.(); } catch {}
          }
        }, 700);
      } catch {}
    };
    (global as any).scrollToPerformanceTop = () => {
      try { (scrollRef as any)?.current?.scrollTo({ y: 0, animated: true }); } catch {}
    };
    return () => {
      try { delete (global as any).scrollToPerformanceOverWeight; } catch {}
      // Removed cleanup for scrollToPerformanceOverTime
      try { delete (global as any).scrollToPerformanceBottom; } catch {}
      try { delete (global as any).scrollToPerformanceTop; } catch {}
    };
  }, [performanceOverWeightRef, performanceOverTimeRef]);
  
  // Scroll ref for gesture coordination
  const scrollRef = useRef(null);
  const streakCardRef = useRef<any>(null);
  const streakTopYRef = useRef(0);
  const contentHeightRef = useRef(0);
  const viewHeightRef = useRef(0);
  const currentScrollYRef = useRef(0);

  // Memoize liftData to ensure stable reference
  const stableLiftData = useMemo(() => liftData, [liftData]);

  // Helpers: compute summary stats (moved from SwipeableSummaryCard)
  function parseDateDDMMYYYY(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }

  function calculateAverageFormImprovement(lifts: Array<{ liftDate?: string; analysis?: { accuracy?: number } }>): number {
    if (!Array.isArray(lifts) || lifts.length < 2) return 0;

    const sorted = [...lifts]
      .map(l => ({
        date: parseDateDDMMYYYY((l as any).liftDate as string),
        accuracy: typeof (l as any)?.analysis?.accuracy === 'number' ? (l as any).analysis.accuracy : null,
      }))
      .filter(it => it.date && typeof it.accuracy === 'number')
      .sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());

    if (sorted.length < 2) return 0;

    const segment = Math.max(1, Math.floor(sorted.length / 3));
    const early = sorted.slice(0, segment);
    const recent = sorted.slice(-segment);

    const avg = (arr: Array<{ accuracy: number | null }>) => {
      const vals = arr.map(x => x.accuracy as number).filter(v => typeof v === 'number');
      if (vals.length === 0) return 0;
      return vals.reduce((s, v) => s + v, 0) / vals.length;
    };

    const earlyAvg = avg(early);
    const recentAvg = avg(recent);
    return recentAvg - earlyAvg;
  }

  const { averageAccuracy, improvementValue, accuracyColor, improvementColor, isImprovementNegative } = useMemo(() => {
    const validAccuracies = stableLiftData
      .map(l => (typeof (l as any)?.analysis?.accuracy === 'number' ? (l as any).analysis.accuracy as number : null))
      .filter((v): v is number => typeof v === 'number');
    const averageAccuracyRaw = validAccuracies.length > 0
      ? Math.round(validAccuracies.reduce((s, v) => s + v, 0) / validAccuracies.length)
      : 0;
    const accColor = averageAccuracyRaw > 80 ? '#00a63e' : averageAccuracyRaw < 50 ? '#fb2c36' : '#fe9a00';

    const improvementRaw = Math.round(calculateAverageFormImprovement(stableLiftData as any));
    const impColor = improvementRaw >= 0 ? '#00a63e' : '#fb2c36';
    const isNegative = improvementRaw < 0;

    return {
      averageAccuracy: averageAccuracyRaw,
      improvementValue: improvementRaw,
      accuracyColor: accColor,
      improvementColor: impColor,
      isImprovementNegative: isNegative,
    };
  }, [stableLiftData]);


  // Info handlers
  const openInfoModal = (key: 'accuracyPerWeight' | 'accuracyOverTime' | 'accuracy' | 'improvement') => {
    hapticFeedback.selection();
    
    // Track progress screen clicks only for the metric cards (not the chart cards)
    switch (key) {
      case 'accuracy':
        track('Progress screen clicks', { event: 'Accuracy info' });
        break;
      case 'improvement':
        track('Progress screen clicks', { event: 'Improvement info' });
        break;
      // Note: accuracyPerWeight and accuracyOverTime are now tracked in SwipeableLineGraphCard
    }
    
    let title = '';
    let message = '';
    switch (key) {
      case 'accuracyPerWeight':
        title = i18n.t('performance.info.accuracyPerWeight.title');
        message = i18n.t('performance.info.accuracyPerWeight.message');
        break;
      case 'accuracyOverTime':
        title = i18n.t('performance.info.accuracyOverTime.title');
        message = i18n.t('performance.info.accuracyOverTime.message');
        break;
      case 'accuracy':
        title = i18n.t('performance.info.accuracy.title');
        message = i18n.t('performance.info.accuracy.message');
        break;
      case 'improvement':
        title = i18n.t('performance.info.improvement.title');
        message = i18n.t('performance.info.improvement.message');
        break;
    }
    setInfoModalContent({ title, message });
    setInfoModalVisible(true);
  };
  const closeInfoModal = () => {
    hapticFeedback.selection();
    setInfoModalVisible(false);
  };

  const handleMetricsFeedbackPress = async () => {
    hapticFeedback.selection();
    track('Progress screen clicks', { event: 'More features' });
    await openMetricsFeedbackEmail();
  };

  return (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        nestedScrollEnabled
        directionalLockEnabled
        contentInsetAdjustmentBehavior="automatic"
        onLayout={(e) => { try { viewHeightRef.current = e.nativeEvent.layout.height; } catch {} }}
        onContentSizeChange={(w, h) => { try { contentHeightRef.current = h; } catch {} }}
        onScroll={(e) => { try { currentScrollYRef.current = e.nativeEvent.contentOffset.y; } catch {} }}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{i18n.t('performance.title')}</Text>
          
          {/* Metric Cards Row: Accuracy | Improvement */}
          <View style={styles.metricsRow} ref={performanceMetricsRef}>
            {/* Accuracy Card */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeaderRow}>
                <Text style={styles.metricTitle}>{i18n.t('performance.accuracy')}</Text>
                <TouchableOpacity onPress={() => openInfoModal('accuracy')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Show accuracy information" style={styles.metricTitleIcon}>
                  <CircleQuestionMark width={20} height={20} color="#000000" />
                </TouchableOpacity>
              </View>
              <View style={styles.progressWrapper}>
                <CircularProgressChart
                  width={100}
                  height={100}
                  percentage={Math.max(0, Math.min(100, averageAccuracy))}
                  progressColor={accuracyColor}
                  backgroundColor="#E5E5E5"
                  strokeWidth={10}
                  radius={40}
                  clockwise={true}
                />
                <Text style={styles.progressText} accessibilityLabel="Accuracy value">
                  {`${averageAccuracy}%`}
                </Text>
              </View>
            </View>

            {/* Improvement Card */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeaderRow}>
                <Text style={styles.metricTitle}>{i18n.t('performance.trend')}</Text>
                <TouchableOpacity onPress={() => openInfoModal('improvement')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Show improvement information" style={styles.metricTitleIcon}>
                  <CircleQuestionMark width={20} height={20} color="#000000" />
                </TouchableOpacity>
              </View>
              <View style={styles.progressWrapper}>
                <CircularProgressChart
                  width={100}
                  height={100}
                  percentage={Math.max(0, Math.min(100, Math.abs(improvementValue)))}
                  progressColor={improvementColor}
                  backgroundColor="#E5E5E5"
                  strokeWidth={10}
                  radius={40}
                  clockwise={!isImprovementNegative}
                />
                <Text style={styles.progressText} accessibilityLabel="Improvement value">
                  {`${improvementValue}%`}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Performance Cards */}
          <SwipeableLineGraphCard 
            ref={performanceOverWeightRef}
            cardData={stableLiftData}
            onTriggerAddOptions={onTriggerAddOptions}
            hasNoLifts={stableLiftData.length === 0}
            chartType="accuracyPerWeight"
            unitPreference={userDetails?.unitSystem ?? 'metric'}
            onInfoPress={() => openInfoModal('accuracyPerWeight')}
            externalScrollGestureRef={scrollRef}
          />

          {/* Accuracy Over Time Cards */}
          <SwipeableLineGraphCard 
            ref={performanceOverTimeRef}
            cardData={stableLiftData}
            hasNoLifts={stableLiftData.length === 0}
            chartType="accuracyOverTime"
            unitPreference={userDetails?.unitSystem ?? 'metric'}
            onInfoPress={() => openInfoModal('accuracyOverTime')}
            externalScrollGestureRef={scrollRef}
          />

          {/* Streak Calendar Card */}
          <View style={styles.streakCardContainer} ref={streakCardRef} onLayout={(e) => { try { streakTopYRef.current = e.nativeEvent.layout.y; } catch {} }}>
            <View style={styles.streakCard}>
              {/* Streak Badge */}
              <View style={styles.streakBadgeContainer}>
                <View style={styles.streakBadge}>
                  <Image
                    source={require('../../../../assets/icons/fire.png')}
                    style={styles.streakBadgeIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.streakBadgeText}>{currentStreak}</Text>
                </View>
              </View>
              
              {/* Calendar */}
              <View style={styles.streakCalendarWrapper}>
                <StreakCalendar />
              </View>
            </View>
          </View>

          {/* Metrics Feedback Card */}
          <View style={styles.metricsFeedbackCard}>
            <TouchableOpacity 
              style={styles.metricsFeedbackRow} 
              onPress={handleMetricsFeedbackPress}
              activeOpacity={0.7}
            >
              <View style={styles.metricsFeedbackIconContainer}>
                <MailPlus size={26} color="#000000" />
              </View>
              <View style={styles.metricsFeedbackTextContainer}>
                <Text style={styles.metricsFeedbackTitle}>
                  {i18n.t('performance.metricsFeedback.title')}
                </Text>
                <Text style={styles.metricsFeedbackSubtitle}>
                  {i18n.t('performance.metricsFeedback.subtitle')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent
        onRequestClose={closeInfoModal}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeInfoModal}>
          <TouchableOpacity style={styles.infoModalContainer} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.infoTitle}>{infoModalContent.title}</Text>
            <Text style={styles.infoMessage}>{infoModalContent.message}</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeInfoModal}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>{i18n.t('close')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    marginBottom: -30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  closeButton: {
    width: '100%',
    height: 60,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },

  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  performanceCardContent: {
    alignItems: 'center',
  },
  performanceCardHeader: {
  },
  performanceCardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  metricHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 12,
  },
  metricTitleIcon: {
    marginLeft: 4,
    marginBottom: 10,
  },
  progressWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  infoModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'left',
  },
  infoMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    lineHeight: 20,
  },
  streakCardContainer: {
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
  },
  streakBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 26,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  streakBadgeIcon: {
    width: 18,
    height: 18,
  },
  streakBadgeText: {
    marginLeft: 2,
    marginTop: 4,
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  streakCalendarWrapper: {
    alignItems: 'center',
  },
  metricsFeedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  metricsFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsFeedbackIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metricsFeedbackTextContainer: {
    flex: 1,
  },
  metricsFeedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  metricsFeedbackSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    marginTop: 2,
  },
}); 
