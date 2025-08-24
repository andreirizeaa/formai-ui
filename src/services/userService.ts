import axios from 'axios';
import { supabase } from '../lib/supabase';
import { API_CONFIG } from './api';
import { getUserId } from './storageService';

export interface UserRow {
	id: string;
	active_subscription: string | null;
    onboarding_completed: boolean;
}

export interface UserDetailsRow {
  id: string;
  unit_system: 'metric' | 'imperial' | null;
  metric_height: number | null;
  metric_weight: number | null;
  birth_date: string | null;
  gender: string | null;
  language: string | null;
  current_streak: number | null;
  walkthrough_completed: boolean | null;
}

export interface UserFetchResult {
	user: UserRow | null;
	error?: string;
}

export async function fetchUserById(userId: string): Promise<UserFetchResult> {
	try {
		const { data, error } = await supabase
			.from('users')
			.select('id, active_subscription, onboarding_completed')
			.eq('id', userId)
			.maybeSingle();

		if (error) return { user: null, error: error.message };
		return { user: data ?? null };
	} catch (e: any) {
		return { user: null, error: e?.message ?? 'Unknown error' };
	}
}

export function requiresOnboarding(user: UserRow | null): boolean {
	if (!user) return false;
	return !user.onboarding_completed;
} 

export function requiresPayment(user: UserRow | null): boolean {
	if (!user) return false;
	return user.active_subscription === null;
} 

// --- Edit user details API ---

export interface EditUserDetailsPayload {
  height?: number; // in cm
  weight?: number; // in kg
  birth_date?: string; // YYYY-MM-DD
  gender?: string;
  language?: string; // e.g., 'en'
  unit_system?: 'metric' | 'imperial';
}

export interface EditUserDetailsResponse {
  success: boolean;
  message: string;
  user_id: string;
  updated_fields: Record<string, any>;
}

export async function editUserDetails(
  partial: EditUserDetailsPayload
): Promise<EditUserDetailsResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  } catch (_) {
    // ignore token fetch errors
  }

  const userId = await getUserId();
  if (!userId) {
    throw new Error('Missing user_id');
  }

  const body = {
    user_id: userId,
    ...partial,
  };

  const response = await axios.put<EditUserDetailsResponse>(
    `${API_CONFIG.baseURL}/user/details/edit`,
    body,
    {
      headers,
      timeout: API_CONFIG.timeout,
    }
  );

  return response.data;
}

export async function fetchUserDetailsById(userId: string): Promise<UserDetailsRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, unit_system, metric_height, metric_weight, birth_date, gender, language, current_streak, walkthrough_completed')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as UserDetailsRow) ?? null;
}

// --- Walkthrough helpers ---
export async function markWalkthroughCompleted(): Promise<void> {
  const userId = await getUserId();
  if (!userId) throw new Error('Missing user_id');
  const { error } = await supabase
    .from('users')
    .update({ 'walkthrough_completed': true })
    .eq('id', userId);
  if (error) throw new Error(error.message);
}