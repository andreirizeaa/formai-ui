import { API_CONFIG } from './api';
import { getUserId } from './storageService';
import { LoadingLiftData, AnalyzeLiftPayload, AnalyzeLiftResponse, RetryStage } from '../types/Lifts.d';
import { ILiftData } from '../context/LiftDataContext';
import { supabase } from '../lib/supabase';

// Helper to merge two abort signals (timeout + external)
function mergeSignals(a?: AbortSignal, b?: AbortSignal) {
  if (!a && !b) return undefined;
  const ctrl = new AbortController();
  const relay = (s?: AbortSignal) => {
    if (!s) return;
    if (s.aborted) return ctrl.abort();
    s.addEventListener('abort', () => ctrl.abort(), { once: true });
  };
  relay(a); relay(b);
  return ctrl.signal;
}

// Helper: fetch with timeout and external abort signal
async function fetchWithTimeout(
  input: RequestInfo, 
  init: RequestInit = {}, 
  timeoutMs = 15000,
  externalSignal?: AbortSignal
) {
  const timeoutCtrl = new AbortController();
  const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs);
  try {
    const signal = mergeSignals(timeoutCtrl.signal, externalSignal);
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function analyzeLift(
  userId: string, 
  liftData: LoadingLiftData, 
  retryStage?: RetryStage,
  opts?: { signal?: AbortSignal }
): Promise<AnalyzeLiftResponse & { transient?: boolean }> {
  if (!userId) return { success: false, data: null, error: 'NO_USER_ID', transient: false };

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
  console.log('analyzinggggg Lift',);

  try {
    const response = await fetchWithTimeout(`${API_CONFIG.baseURL}/lifts/analyse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Idempotency key to prevent duplicate server calls
        'Idempotency-Key': liftData.id,
      },
      body: JSON.stringify(payload),
    }, 300000, // 5 minute timeout for analysis
    opts?.signal // Pass through external abort signal
    );

    if (!response.ok) {
      return { success: false, data: null, error: `HTTP_${response.status}`, transient: false };
    }

    const json = (await response.json().catch(() => null)) as AnalyzeLiftResponse | null;
    if (!json) {
      // server died mid-response, or empty body
      return { success: false, data: null, error: 'BAD_JSON', transient: false };
    }
    
    // Only treat as success if we actually have data
    if (json.success && json.data) return json;

    // Surface the server error if provided; otherwise fail hard
    return { success: false, data: null, error: json.error || 'EMPTY_DATA', transient: false };
  } catch (e: any) {
    // Distinguish abort/timeout vs other network errors (both should be transient)
    const msg = (e && e.name === 'AbortError') ? 'TIMEOUT' : 'NETWORK_ERROR';
    const isTransient = e?.name === 'AbortError' || /network|timeout|connection|abort|fetch|ECONN|ENET|EAI/i.test(String(e?.message || e || ''));
    return { success: false, data: null, error: msg, transient: isTransient };
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


