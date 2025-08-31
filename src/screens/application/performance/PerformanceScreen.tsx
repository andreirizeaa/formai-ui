import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { SwipeableLineGraphCard } from '../../../components/ui/SwipeableLineGraphCard';
import { useLiftData } from '../../../context/LiftDataContext';
import { useUserDetails } from '../../../context/UserDetailsContext';
import { hapticFeedback } from '../../../utils/haptic';
import i18n from '../../../utils/i18n';
import { useTutorialTarget } from '../../../context/TutorialContext';
import { CircleQuestionMark, X } from 'lucide-react-native';
import { CircularProgressChart } from '../../../components/icons/icons';

interface PerformanceScreenProps {
  onTriggerAddOptions?: () => void;
}



export function PerformanceScreen({ onTriggerAddOptions }: PerformanceScreenProps) {
  const { liftData } = useLiftData();
  const { userDetails } = useUserDetails();
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; message: string }>({ title: '', message: '' });
  
  // Tutorial target registration
  const { ref: performanceMetricsRef } = useTutorialTarget('performance_metrics');
  const { ref: performanceChartsRef } = useTutorialTarget('performance_charts');
  


  // Check if there are no lifts
  const hasNoLifts = liftData.length === 0;

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
    const validAccuracies = liftData
      .map(l => (typeof (l as any)?.analysis?.accuracy === 'number' ? (l as any).analysis.accuracy as number : null))
      .filter((v): v is number => typeof v === 'number');
    const averageAccuracyRaw = validAccuracies.length > 0
      ? Math.round(validAccuracies.reduce((s, v) => s + v, 0) / validAccuracies.length)
      : 0;
    const accColor = averageAccuracyRaw > 80 ? '#00a63e' : averageAccuracyRaw < 50 ? '#fb2c36' : '#fe9a00';

    const improvementRaw = Math.round(calculateAverageFormImprovement(liftData as any));
    const impColor = improvementRaw >= 0 ? '#00a63e' : '#fb2c36';
    const isNegative = improvementRaw < 0;

    return {
      averageAccuracy: averageAccuracyRaw,
      improvementValue: improvementRaw,
      accuracyColor: accColor,
      improvementColor: impColor,
      isImprovementNegative: isNegative,
    };
  }, [liftData]);

  // Info handlers
  const openInfoModal = (key: 'accuracyPerWeight' | 'accuracyOverTime' | 'accuracy' | 'improvement') => {
    hapticFeedback.selection();
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

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{i18n.t('performance.title')}</Text>
          


          {/* Metric Cards Row: Accuracy | Improvement */}
          {!hasNoLifts && (
            <View style={styles.metricsRow} ref={performanceChartsRef}>
              {/* Accuracy Card */}
              <View style={styles.metricCard}>
                <View style={styles.metricHeaderRow}>
                  <Text style={styles.metricTitle}>Accuracy</Text>
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
                  <Text style={styles.metricTitle}>Improvement</Text>
                  <TouchableOpacity onPress={() => openInfoModal('improvement')} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Show improvement information" style={styles.metricTitleIcon}>
                    <CircleQuestionMark width={20} height={20} color="#000000" />
                  </TouchableOpacity>
                </View>
                <View style={styles.progressWrapper}>
                  <CircularProgressChart
                    width={100}
                    height={100}
                    percentage={Math.abs(improvementValue)}
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
          )}
          
          {/* Performance Cards */}
          {hasNoLifts ? (
            <TouchableOpacity 
              style={styles.performanceCard}
              activeOpacity={0.7}
            >
              <View style={styles.performanceCardContent}>
                <View style={styles.performanceCardHeader}>
                  <Text style={styles.performanceCardLabel}>
                    {i18n.t('common.noLiftsFound')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <SwipeableLineGraphCard 
              ref={performanceMetricsRef}
              cardData={liftData}
              onTriggerAddOptions={onTriggerAddOptions}
              hasNoLifts={hasNoLifts}
              chartType="accuracyPerWeight"
              unitPreference={userDetails?.unitSystem ?? 'metric'}
              onInfoPress={() => openInfoModal('accuracyPerWeight')}
            />
          )}

          {/* Accuracy Over Time Cards */}
          {!hasNoLifts && (
            <SwipeableLineGraphCard 
              cardData={liftData}
              hasNoLifts={false}
              chartType="accuracyOverTime"
              unitPreference={userDetails?.unitSystem ?? 'metric'}
              onInfoPress={() => openInfoModal('accuracyOverTime')}
            />
          )}
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
            <TouchableOpacity style={styles.closeButton} onPress={closeInfoModal}>
              <X width={20} height={20} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.infoTitle}>{infoModalContent.title}</Text>
            <Text style={styles.infoMessage}>{infoModalContent.message}</Text>
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
    marginBottom: -24,
    
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'left',
  },
  infoMessage: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
}); 
