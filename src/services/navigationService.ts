import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/MainAppNavigator';
import { ILiftData } from '../context/LiftDataContext';
import { supabase } from '../lib/supabase';
import { extractObjectKeyFromUrl, signPath } from '../context/LiftDataContext';

export const navigationRef = createNavigationContainerRef<MainStackParamList>();

// Handle pending lift ID and navigation date when navigation becomes ready
navigationRef.addListener('state', () => {
  if (navigationRef.isReady()) {
    // Handle pending lift ID
    if ((global as any).pendingLiftId) {
      const liftId = (global as any).pendingLiftId;
      delete (global as any).pendingLiftId;
      setTimeout(() => openLiftById(liftId), 1000); // Small delay to ensure navigation is fully ready
    }

    // Handle pending navigation date
    if ((global as any).pendingNavigationDate) {
      const date = (global as any).pendingNavigationDate;
      delete (global as any).pendingNavigationDate;
      setTimeout(() => navigateToHomeWithDate(date), 1000); // Small delay to ensure navigation is fully ready
    }

    // Handle pending failed lift navigation
    if ((global as any).pendingFailedLiftNavigation) {
      const { assetId, liftId } = (global as any).pendingFailedLiftNavigation;
      delete (global as any).pendingFailedLiftNavigation;
      setTimeout(() => navigateToFailedLiftDate(assetId, liftId), 1000); // Small delay to ensure navigation is fully ready
    }
  }
});

export function navigate(name: keyof MainStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

export function push(name: keyof MainStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(name as any, params));
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export function isReady() {
  return navigationRef.isReady();
}

// Global function to navigate to home screen with specific date
export function navigateToHomeWithDate(date: Date) {
  try {
    if (!navigationRef.isReady()) {
      // Store the date to navigate to later when navigation is ready
      (global as any).pendingNavigationDate = date;
      return;
    }

    // Set the global date navigation function to be called by HomeScreen
    if ((global as any).setHomeDateFromNotification) {
      (global as any).setHomeDateFromNotification(date);
    } else {
      // Store for later when HomeScreen mounts
      (global as any).pendingNavigationDate = date;
    }

    // Navigate to MainTabs (which includes Home)
    navigate('MainTabs');
  } catch (error) {
    console.warn('Error navigating to home with date:', error);
    (global as any).pendingNavigationDate = date;
  }
}

// Global function to navigate to failed lift date using assetId
export async function navigateToFailedLiftDate(assetId: string, liftId?: string) {
  try {
    // If navigation isn't ready, store for later processing
    if (!navigationRef.isReady()) {
      (global as any).pendingFailedLiftNavigation = { assetId, liftId };
      return;
    }

    // Try to get the lift date from loading lifts context first
    if ((global as any).getLoadingLiftDate) {
      const date = (global as any).getLoadingLiftDate(assetId);
      if (date) {
        navigateToHomeWithDate(date);
        return;
      }
    }

    // Fallback: if we have a liftId, try to get the date from the completed lift
    if (liftId && (global as any).getLiftFromContext) {
      const lift = (global as any).getLiftFromContext(liftId);
      if (lift && lift.liftDate) {
        // Parse DD-MM-YYYY format to Date
        const [day, month, year] = lift.liftDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        navigateToHomeWithDate(date);
        return;
      }
    }

    // Fallback: try to fetch from database using liftId or assetId
    if (liftId) {
      try {
        const { data, error } = await supabase
          .from('lifts')
          .select('lift_date')
          .eq('id', liftId)
          .maybeSingle();

        if (data && data.lift_date && !error) {
          // Parse YYYY-MM-DD format from database to Date
          const dbDate = new Date(data.lift_date);
          navigateToHomeWithDate(dbDate);
          return;
        }
      } catch (dbError) {
        console.warn('Database fallback failed:', dbError);
      }
    }

    // Alternative fallback: try to fetch using asset_id from lift_failures
    if (assetId) {
      try {
        const { data, error } = await supabase
          .from('lift_failures')
          .select('created_at')
          .eq('asset_id', assetId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.created_at && !error) {
          // Parse timestamp correctly: created_at is like "2025-10-18 19:07:21.02665+00"
          // Extract just the date part (YYYY-MM-DD) to avoid timezone issues
          const dateStr = data.created_at.split(' ')[0]; // "2025-10-18"
          // Parse as local midnight to get the correct calendar date
          const [year, month, day] = dateStr.split('-').map(Number);
          const failureDate = new Date(year, month - 1, day); // month is 0-indexed
          navigateToHomeWithDate(failureDate);
          new Date()
          return;
        }
      } catch (dbError) {
        console.warn('Asset fallback failed:', dbError);
      }
    }

    // If we can't find the date, just navigate to home with today's date
    navigateToHomeWithDate(new Date());
  } catch (error) {
    console.warn('Error navigating to failed lift date:', error);
    // Fallback to today's date
    navigateToHomeWithDate(new Date());
  }
}

// Global function to open lift details by ID
export async function openLiftById(liftId: string) {
  try {
    if (!navigationRef.isReady()) {
      (global as any).pendingLiftId = liftId;
      return;
    }

    // First ensure we're on the main tabs screen
    const currentRoute = navigationRef.getCurrentRoute();
    if (currentRoute?.name !== 'MainTabs') {
      navigate('MainTabs');
      // Add a small delay to let the navigation complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Try to get lift from context first (will be implemented by context)
    if ((global as any).getLiftFromContext) {
      const lift = (global as any).getLiftFromContext(liftId);
      if (lift) {
        navigate('LiftDetails', { liftData: lift });
        return;
      }
    }

    // Fallback: fetch the lift by id from Supabase
    const { data, error } = await supabase
      .from('lifts')
      .select('id, is_favourite, lift_type, lift_date, lift_time, metric_weight, reps, raw_video_url, pose_video_url, thumbnail_url, analysis')
      .eq('id', liftId)
      .maybeSingle();

    if (error || !data) {
      console.warn('Failed to fetch lift for notification:', error);
      (global as any).pendingLiftId = liftId;
      return;
    }

    // Sign URLs for secure access
    const thumbKey = await extractObjectKeyFromUrl(data.thumbnail_url);
    const rawKey = await extractObjectKeyFromUrl(data.raw_video_url);
    const poseKey = await extractObjectKeyFromUrl(data.pose_video_url);

    const [thumbnailURL, rawVideoURL, poseVideoURL] = await Promise.all([
      signPath(thumbKey),
      signPath(rawKey),
      signPath(poseKey),
    ]);

    // Process feedback images if they exist
    const rawFeedback = Array.isArray(data.analysis?.feedback) ? data.analysis.feedback : [];
    const signedFeedback = await Promise.all(
      rawFeedback.map(async (f: any) => {
        if (f.imageURL && typeof f.imageURL === 'string') {
          const feedbackKey = await extractObjectKeyFromUrl(f.imageURL);
          const signedUrl = await signPath(feedbackKey);
          return { ...f, imageURL: signedUrl || f.imageURL };
        }
        return f;
      })
    );

    // Map the data to the expected format
    const mapped: ILiftData = {
      id: data.id,
      isFavourite: !!data.is_favourite,
      liftType: data.lift_type,
      liftDate: new Date(data.lift_date).toLocaleDateString('en-GB').replace(/\//g, '-'),
      liftTime: data.lift_time,
      metricWeight: Number(data.metric_weight),
      reps: Number(data.reps),
      rawVideoURL: rawVideoURL || data.raw_video_url,
      poseVideoURL: poseVideoURL || data.pose_video_url,
      thumbnailURL: thumbnailURL || data.thumbnail_url,
      analysis: {
        accuracy: Number(data.analysis?.accuracy ?? 0),
        lineGraphValues: Array.isArray(data.analysis?.lineGraphValues) ? data.analysis.lineGraphValues : [],
        barChartValues: Array.isArray(data.analysis?.barChartValues) ? data.analysis.barChartValues : [],
        feedback: signedFeedback,
      },
    };

    navigate('LiftDetails', { liftData: mapped });
  } catch (error) {
    console.warn('Error opening lift details:', error);
    (global as any).pendingLiftId = liftId;
  }
}