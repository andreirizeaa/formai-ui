import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Share, Zap, BicepsFlexed, Video } from 'lucide-react-native';
import i18n from '../../utils/i18n';
import { hapticFeedback } from '../../utils/haptic';
import { track } from '../../services/analytics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { FormAILogo } from './FormAILogo';

interface LiftData {
  liftDate: string; // DD-MM-YYYY format
  metricWeight: number;
  reps: number;
  liftType: string;
  analysis?: {
    accuracy: number;
  };
}

interface WrappedProps {
  totalVideos: number;
  totalReps: number;
  totalWeightMoved: number;
  favouriteLift: string | null;
  unitSystem?: 'metric' | 'imperial';
  liftData?: LiftData[];
}

export function Wrapped({
  totalVideos,
  totalReps,
  totalWeightMoved,
  favouriteLift,
  unitSystem = 'metric',
  liftData = [],
}: WrappedProps) {
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    // Always default to current year
    return new Date().getFullYear().toString();
  });
  const [showShareOverlay, setShowShareOverlay] = useState(false);
  const shareAreaRef = useRef<View>(null);

  // Extract unique years from lift data
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    
    if (!liftData || !Array.isArray(liftData) || liftData.length === 0) {
      // If no data, show current year
      return [currentYear];
    }
    
    const years = new Set<string>();
    // Always include current year
    years.add(currentYear);
    
    liftData.forEach(lift => {
      // Extract year from DD-MM-YYYY format
      const year = lift.liftDate.split('-')[2];
      if (year) {
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)
  }, [liftData]);

  // Filter lift data by selected year
  const filteredLiftData = useMemo(() => {
    if (!liftData || !Array.isArray(liftData)) {
      return [];
    }
    if (selectedYear === 'all') return liftData;
    return liftData.filter(lift => lift.liftDate.split('-')[2] === selectedYear);
  }, [liftData, selectedYear]);

  // Recalculate metrics based on filtered data
  const filteredMetrics = useMemo(() => {
    // If no lift data available, use the original props
    if (!liftData || liftData.length === 0) {
      return {
        totalVideos,
        totalReps,
        totalWeightMoved,
        favouriteLift: null, // No favourite lift when no data
        averageAccuracy: 0, // No accuracy when no data
      };
    }

    const videos = filteredLiftData.length;
    const reps = filteredLiftData.reduce((sum, lift) => sum + (lift.reps || 0), 0);
    const weightMoved = filteredLiftData.reduce((sum, lift) => {
      const weight = lift.metricWeight || 0;
      const reps = lift.reps || 0;
      return sum + (weight * reps);
    }, 0);

    const liftTypeCounts = new Map<string, number>();
    filteredLiftData.forEach(lift => {
      const liftType = lift.liftType;
      if (liftType) {
        liftTypeCounts.set(liftType, (liftTypeCounts.get(liftType) || 0) + 1);
      }
    });

    let favouriteLiftName = 'Bench Press'; // default
    let maxCount = 0;
    liftTypeCounts.forEach((count, liftType) => {
      if (count > maxCount) {
        maxCount = count;
        favouriteLiftName = liftType;
      }
    });

    // Calculate average accuracy
    const validAccuracies = filteredLiftData
      .map(lift => lift.analysis?.accuracy)
      .filter((accuracy): accuracy is number => typeof accuracy === 'number' && !isNaN(accuracy));
    
    const averageAccuracy = validAccuracies.length > 0
      ? Math.round(validAccuracies.reduce((sum, acc) => sum + acc, 0) / validAccuracies.length)
      : 0;

    return {
      totalVideos: videos,
      totalReps: reps,
      totalWeightMoved: weightMoved,
      favouriteLift: favouriteLiftName,
      averageAccuracy,
    };
  }, [filteredLiftData, totalVideos, totalReps, totalWeightMoved, favouriteLift]);

  const handleYearChange = (year: string) => {
    if (year !== selectedYear) {
      hapticFeedback.selection();
      track('Wrapped year filter', { year });
      setSelectedYear(year);
    }
  };

  // Render function for the cards (screen version - no title, logo, year)
  const renderCards = () => (
    <>
      {/* Videos and Reps Row */}
      <View style={styles.statsRow}>
        {/* Videos Card */}
        <View style={[styles.statCard, styles.cardShadow]}>
          <LinearGradient
            colors={['#e2e8f0', '#f5f3ff']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.statHeaderRow}>
              <Text style={styles.statTitle}>{i18n.t('performance.videos')}</Text>
            </View>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{filteredMetrics.totalVideos}</Text>
              <Video width={24} height={24} color="#000000" />
            </View>
          </LinearGradient>
        </View>

        {/* Reps Card */}
        <View style={[styles.statCard, styles.cardShadow]}>
          <LinearGradient
            colors={['#e2e8f0', '#f5f3ff']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.statHeaderRow}>
              <Text style={styles.statTitle}>{i18n.t('performance.reps')}</Text>
            </View>
            <Text style={styles.statValue}>{filteredMetrics.totalReps}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Total Weight and Accuracy Row */}
      <View style={styles.weightAccuracyRow}>
        {/* Total Weight Moved Card - 70% */}
        <View style={[styles.totalWeightCard, styles.cardShadow, styles.weightCard70]}>
          <LinearGradient
            colors={['#f5f3ff', '#e2e8f0']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
          <View style={styles.totalWeightHeaderRow}>
            <Text style={styles.totalWeightTitle}>{i18n.t('performance.totalWeight')}</Text>
          </View>
            <View style={styles.totalWeightValueContainer}>
              <Text style={styles.totalWeightValue}>
                {unitSystem === 'imperial'
                  ? Math.round(filteredMetrics.totalWeightMoved * 2.20462).toLocaleString()
                  : Math.round(filteredMetrics.totalWeightMoved).toLocaleString()
                } {unitSystem === 'imperial' ? i18n.t('feedback.lbs') : i18n.t('feedback.kg')}
              </Text>
              <BicepsFlexed width={24} height={24} color="#000000" />
            </View>
          </LinearGradient>
        </View>

        {/* Accuracy Card - 30% */}
        <View style={[styles.accuracyCard, styles.cardShadow, styles.accuracyCard30]}>
          <LinearGradient
            colors={['#e2e8f0', '#f5f3ff']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.accuracyHeaderRow}>
              <Text style={styles.accuracyTitle}>{i18n.t('performance.accuracy')}</Text>
            </View>
            <View style={styles.accuracyValueContainer}>
              <Text style={styles.accuracyValue}>{filteredMetrics.averageAccuracy}%</Text>
              <Zap width={24} height={24} color="#000000" />
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Favourite Exercise Card - always show */}
      <View style={[styles.favouriteLiftCard, styles.cardShadow]}>
        <LinearGradient
          colors={['#e2e8f0', '#f5f3ff']}
          locations={[0, 0.3]}
          style={styles.gradientFill}
          start={{ x: 0.6, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.favouriteLiftHeaderRow}>
            <Text style={styles.favouriteLiftTitle}>{i18n.t('performance.favouriteExercise')}</Text>
          </View>
          <View style={styles.favouriteLiftValueRow}>
            <Text style={styles.favouriteLiftValue}>
              {filteredMetrics.favouriteLift || i18n.t('performance.noData')}
            </Text>
            {filteredMetrics.favouriteLift && <Crown width={28} height={28} color="#000000" />}
          </View>
        </LinearGradient>
      </View>
    </>
  );

  // Render function for shareable content (includes overview title, logo, year)
  const renderShareableCards = () => (
    <LinearGradient
      colors={['#e2e8f0', '#ffffff']}
      locations={[0, 0.9]}
      style={styles.shareableBackground}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Overview Title */}
      <Text style={styles.overviewTitle}>{i18n.t('performance.myOverview')}</Text>
      
      {/* Videos and Reps Row */}
      <View style={styles.statsRow}>
        {/* Videos Card */}
        <View style={[styles.statCard, styles.cardShadow]}>
          <LinearGradient
            colors={['#e2e8f0', '#f5f3ff']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.statHeaderRow}>
              <Text style={styles.statTitle}>{i18n.t('performance.videos')}</Text>
            </View>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{filteredMetrics.totalVideos}</Text>
              <Video width={24} height={24} color="#000000" />
            </View>
          </LinearGradient>
        </View>

        {/* Reps Card */}
        <View style={[styles.statCard, styles.cardShadow]}>
          <LinearGradient
            colors={['#e2e8f0', '#f5f3ff']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.statHeaderRow}>
              <Text style={styles.statTitle}>{i18n.t('performance.reps')}</Text>
            </View>
            <Text style={styles.statValue}>{filteredMetrics.totalReps}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Total Weight and Accuracy Row */}
      <View style={styles.weightAccuracyRow}>
        {/* Total Weight Moved Card - 70% */}
        <View style={[styles.totalWeightCard, styles.cardShadow, styles.weightCard70]}>
          <LinearGradient
            colors={['#f5f3ff', '#e2e8f0']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
          <View style={styles.totalWeightHeaderRow}>
            <Text style={styles.totalWeightTitle}>{i18n.t('performance.totalWeight')}</Text>
          </View>
            <View style={styles.totalWeightValueContainer}>
              <Text style={styles.totalWeightValue}>
                {unitSystem === 'imperial'
                  ? Math.round(filteredMetrics.totalWeightMoved * 2.20462).toLocaleString()
                  : Math.round(filteredMetrics.totalWeightMoved).toLocaleString()
                } {unitSystem === 'imperial' ? i18n.t('feedback.lbs') : i18n.t('feedback.kg')}
              </Text>
              <BicepsFlexed width={24} height={24} color="#000000" />
            </View>
          </LinearGradient>
        </View>

        {/* Accuracy Card - 30% */}
        <View style={[styles.accuracyCard, styles.cardShadow, styles.accuracyCard30]}>
          <LinearGradient
            colors={['#e2e8f0', '#f5f3ff']}
            locations={[0, 0.3]}
            style={styles.gradientFill}
            start={{ x: 0.6, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={styles.accuracyHeaderRow}>
              <Text style={styles.accuracyTitle}>{i18n.t('performance.accuracy')}</Text>
            </View>
            <View style={styles.accuracyValueContainer}>
              <Text style={styles.accuracyValue}>{filteredMetrics.averageAccuracy}%</Text>
              <Zap width={24} height={24} color="#000000" />
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Favourite Exercise Card - always show */}
      <View style={[styles.favouriteLiftCard, styles.cardShadow]}>
        <LinearGradient
          colors={['#e2e8f0', '#f5f3ff']}
          locations={[0, 0.3]}
          style={styles.gradientFill}
          start={{ x: 0.6, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.favouriteLiftHeaderRow}>
            <Text style={styles.favouriteLiftTitle}>{i18n.t('performance.favouriteExercise')}</Text>
          </View>
          <View style={styles.favouriteLiftValueRow}>
            <Text style={styles.favouriteLiftValue}>
              {filteredMetrics.favouriteLift || i18n.t('performance.noData')}
            </Text>
            {filteredMetrics.favouriteLift && <Crown width={28} height={28} color="#000000" />}
          </View>
        </LinearGradient>
      </View>

      {/* Footer with FormAILogo and Year - only for shareable */}
      <View style={styles.footerRow}>
        <FormAILogo iconSize={24} textStyle={styles.footerLogoText} />
        <Text style={styles.yearText}>
          {selectedYear === 'all' ? i18n.t('performance.timeRanges.allTime') : selectedYear}
        </Text>
      </View>
    </LinearGradient>
  );

  const handleShare = async () => {
    try {
      hapticFeedback.selection();
      track('Wrapped share tapped', { year: selectedYear });

      setShowShareOverlay(true); // mount the hidden white version
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))); // wait a frame

      const uri = await captureRef(shareAreaRef, {
        format: 'png',
        quality: 1,
        fileName: `lift-wrapped-${selectedYear}`,
        result: 'tmpfile',
      });

      setShowShareOverlay(false);

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available on this device.');
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: i18n.t('performance.shareWrapped') || 'Share your Wrapped',
        mimeType: 'image/png',
        UTI: 'public.png', // iOS
      });
    } catch (e: any) {
      setShowShareOverlay(false);
      Alert.alert('Could not share', e?.message ?? 'Unknown error');
    }
  };
  return (
    <View style={styles.container}>
      {/* Title row + Share button */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{i18n.t('performance.wrapped')}</Text>
        {liftData && liftData.length > 0 && (
          <TouchableOpacity
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share this summary"
            style={styles.shareBtn}
            activeOpacity={0.8}
          >
            <Share width={22} height={22} color="#000" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Year Segmented Control */}
      {availableYears.length > 0 && (
        <View style={styles.segmentedWrapper}>
          <View style={styles.segmented}>
            {/* Only show "All Time" if there's actual lift data */}
            {liftData && liftData.length > 0 && (
              <TouchableOpacity
                style={[styles.segment, selectedYear === 'all' ? styles.segmentActive : styles.segmentInactive]}
                activeOpacity={0.9}
                onPress={() => handleYearChange('all')}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedYear === 'all' }}
              >
                <Text style={[styles.segmentText, selectedYear === 'all' && styles.segmentTextActive]}>
                  All Time
                </Text>
              </TouchableOpacity>
            )}
            {availableYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.segment, selectedYear === year ? styles.segmentActive : styles.segmentInactive]}
                activeOpacity={0.9}
                onPress={() => handleYearChange(year)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedYear === year }}
              >
                <Text style={[styles.segmentText, selectedYear === year && styles.segmentTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Visible Cards */}
      {renderCards()}

      {/* Hidden white overlay used only for capture */}
      {showShareOverlay && (
        <View
          ref={shareAreaRef}
          collapsable={false}
          pointerEvents="none"
          style={styles.shareOverlay}
        >
          {renderShareableCards()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'left',
    flex: 1,
  },
  shareBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 10,
  },
  shareableTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    textAlign: 'center',
    marginBottom: 16,
  },
  shareOverlay: {
    position: 'absolute',
    left: -9999, // offscreen so it won't flash
    top: 0,
    width: 390, // optional: force export size
    borderRadius: 20,
  },
  shareableBackground: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  statCard: {
    flex: 0,
    flexGrow: 1,
    flexShrink: 1,
    borderRadius: 20,
    alignItems: 'center',
  },
  statHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    flex: 1,
    flexShrink: 0,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  weightAccuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
  },
  totalWeightCard: {
    borderRadius: 20,
  },
  weightCard70: {
    flex: 0.65,
  },
  accuracyCard: {
    borderRadius: 20,
  },
  accuracyCard30: {
    flex: 0.35,
  },
  accuracyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accuracyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    flex: 1,
  },
  accuracyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accuracyValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  totalWeightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalWeightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    flex: 1,
  },
  totalWeightValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalWeightValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  totalWeightUnit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    alignSelf: 'flex-start',
  },
  favouriteLiftCard: {
    borderRadius: 20,
    marginBottom: 8,
  },
  favouriteLiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favouriteLiftTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  favouriteLiftValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  favouriteLiftValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    flex: 1,
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gradientFill: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
  },
  // Segmented control styles
  segmentedWrapper: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    // Platform-specific shadow optimization
    ...(Platform.OS === 'android' ? { elevation: 1 } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    }),
  },
  segment: {
    flexGrow: 1,
    flexShrink: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 1, // Small margin between segments
  },
  segmentInactive: {},
  segmentActive: {
    backgroundColor: '#FFFFFF',
    // Platform-specific shadow optimization
    ...(Platform.OS === 'android' ? { elevation: 2 } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  segmentTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  footerLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});
