import { API_CONFIG } from './api';
import type { LoadingLiftData } from '../context/LoadingLiftsContext';
import { getUserId } from './storageService';

interface AnalyzeLiftPayload {
  userId: string;
  lift: {
    id: string;
    videoLink: string;
    thumbnailUri: string;
    movementType: string;
    weightValue: number;
    reps: number;
    dateToday: string;
  };
}

export interface AnalyzeLiftResponse<T = any> {
  success: boolean;
  data?: T | null;
}

export async function analyzeLift(userId: string, liftData: LoadingLiftData): Promise<AnalyzeLiftResponse> {
  if (!userId) return { success: false, data: null };

  const payload: AnalyzeLiftPayload = {
    userId,
    lift: {
      id: liftData.id,
      videoLink: liftData.videoLink,
      thumbnailUri: liftData.thumbnailUri,
      movementType: liftData.movementType,
      weightValue: liftData.weightValue,
      reps: liftData.reps,
      dateToday: liftData.dateToday,
    },
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


