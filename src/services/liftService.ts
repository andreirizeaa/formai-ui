import { API_CONFIG } from './api';
import { getUserId } from './storageService';
import { LoadingLiftData, AnalyzeLiftPayload, AnalyzeLiftResponse, RetryStage } from '../types/Lifts.d';
import { ILiftData } from '../context/LiftDataContext';
import { supabase } from '../lib/supabase';

export async function analyzeLift(
  userId: string, 
  liftData: LoadingLiftData, 
  retryStage?: RetryStage
): Promise<AnalyzeLiftResponse> {
  if (!userId) return { success: false, data: null };

  const payload: AnalyzeLiftPayload = {
    userId,
    liftId: liftData.id,
    lift: {
      id: liftData.id,
      videoLink: liftData.videoLink,
      thumbnailUri: liftData.thumbnailUri,
      movementType: liftData.movementType,
      weightValue: liftData.weightValue,
      reps: liftData.reps,
      dateToday: liftData.dateToday,
      timeToday: liftData.timeToday,
      assetId: liftData.assetId,
    },
    ...(retryStage && { stage: retryStage }),
  };

  try {
    const response = await fetch(`${API_CONFIG.baseURL}/lifts/analyse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) return { success: false, data: null };
    
    const json = (await response.json().catch(() => null)) as AnalyzeLiftResponse | null;
    if (json && typeof json.success === 'boolean') return json;
    return { success: true, data: null };
  } catch (_) {
    return { success: false, data: null };
  }
}

export async function favouriteLift(liftId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/lifts/favourite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, liftId }),
    });
    if (!response.ok) return false;
    const json = (await response.json().catch(() => null)) as { success?: boolean } | null;
    return !!json?.success;
  } catch (_) {
    return false;
  }
}

export async function deleteLift(liftId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/lifts/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, liftId }),
    });
    if (!response.ok) return false;
    const json = (await response.json().catch(() => null)) as { success?: boolean } | null;
    return !!json?.success;
  } catch (_) {
    return false;
  }
}

export async function deleteUserStorage(liftId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/lifts/storage/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, liftId }),
    });
    console.log(' >>>>>>> <<<<<<<< delete lift response', response);

    if (!response.ok) return false;
    const json = (await response.json().catch(() => null)) as { success?: boolean } | null;
    return !!json?.success;
  } catch (_) {
    return false;
  }
}

export async function checkDuplicateAssetId(assetId: string): Promise<boolean> {
  const userId = await getUserId();
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('lifts')
      .select('asset_id')
      .eq('user_id', userId)
      .eq('asset_id', assetId)
      .limit(1);

      console.log(' >>>>>>> <<<<<<<< check duplicate asset ID', assetId);
    
    if (error) {
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    return false;
  }
}

export async function searchLiftByAssetId(assetId: string): Promise<ILiftData | null> {
  const userId = await getUserId();
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('lifts')
      .select('id, is_favourite, lift_type, lift_date, lift_time, weight_value, reps, raw_video_url, pose_video_url, thumbnail_url, analysis')
      .eq('user_id', userId)
      .eq('asset_id', assetId)
      .limit(1);

    console.log(' >>>>>>> <<<<<<<< search lift by asset ID', assetId);
    
    if (error) {
      return null;
    }
    
    if (data && data.length > 0) {
      const lift = data[0];
      // Convert the database lift to ILiftData format
      return {
        id: lift.id,
        liftType: lift.lift_type,
        liftDate: (() => {
          const date = new Date(lift.lift_date);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        })(),
        liftTime: lift.lift_time,
        weightValue: Number(lift.weight_value),
        reps: Number(lift.reps),
        rawVideoURL: lift.raw_video_url,
        poseVideoURL: lift.pose_video_url || null,
        isFavourite: !!lift.is_favourite,
        analysis: lift.analysis || {
          accuracy: 0,
          lineGraphValues: [],
          feedback: []
        },
        thumbnailURL: lift.thumbnail_url,
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

export async function updateLiftWeight(liftId: string, weightValue: number, unitSystem: 'metric' | 'imperial'): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'NO_USER_ID' };

  try {
    // Convert to metric if imperial
    const metricWeight = unitSystem === 'imperial' ? weightValue / 2.20462 : weightValue;

    const response = await fetch(`${API_CONFIG.baseURL}/lifts/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId, 
        liftId, 
        metricWeight 
      }),
    });

    if (!response.ok) return { success: false, error: 'API_ERROR' };
    
    const json = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
    return { success: !!json?.success, error: json?.error };
  } catch (error) {
    return { success: false, error: 'NETWORK_ERROR' };
  }
}


