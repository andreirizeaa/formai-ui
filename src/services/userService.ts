import { supabase } from '../lib/supabase';
import { getUserId } from './storageService';

export interface UserRow {
	id: string;
  onboarding_completed: boolean;
}

export interface UserDetailsRow {
  id: string;
  unit_system: 'metric' | 'imperial' | null;
  metric_height: number | null;
  metric_weight: number | null;
  age_range: string | null;
  gender: string | null;
  language: string | null;
  current_streak: number | null;
  walkthrough_completed: boolean | null;
  has_rated: boolean | null;
}

export interface UserFetchResult {
	user: UserRow | null;
	error?: string;
}

export async function fetchUserById(userId: string): Promise<UserFetchResult> {
	try {
		const { data, error } = await supabase
			.from('user_onboarding')
			.select('user_id, onboarding_completed')
			.eq('user_id', userId)
			.maybeSingle();
		if (error) return { user: null, error: error.message };
		if (!data) return { user: null };
		return { user: { id: (data as any).user_id, onboarding_completed: Boolean((data as any).onboarding_completed) } };
	} catch (e: any) {
		return { user: null, error: e?.message ?? 'Unknown error' };
	}
}

export function requiresOnboarding(user: UserRow | null): boolean {
	if (!user) return false;
	return !user.onboarding_completed;
} 

// --- Edit user details API ---

export interface EditUserDetailsPayload {
  height?: number; // in cm
  weight?: number; // in kg
  age_range?: string; // age range like "18-24"
  gender?: string;
  language?: string; // e.g., 'en'
  unit_system?: 'metric' | 'imperial';
  walkthrough_completed?: boolean;
  has_rated?: boolean;
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
  // Helpers (mirror backend normalization/sanitization)
  function isoDateOrNull(value?: string | null): string | null {
    if (!value) return null;
    const m = /^\d{4}-\d{2}-\d{2}/.exec(value);
    return m?.[0] ?? null;
  }

  function buildUpdatePayload(req: EditUserDetailsPayload): Record<string, any> {
    const payload: Record<string, any> = {};
    if (req.height != null) payload.metric_height = req.height;
    if (req.weight != null) payload.metric_weight = req.weight;
    if (req.age_range != null) payload.age_range = req.age_range;
    if (req.gender != null) payload.gender = req.gender;
    if (req.language != null) payload.language = req.language;
    if (req.unit_system != null) payload.unit_system = req.unit_system;
    if (req.walkthrough_completed != null) payload.walkthrough_completed = req.walkthrough_completed;
    return payload;
  }

  const userId = await getUserId();
  if (!userId) throw new Error('Missing user_id');

  const updatePayload = buildUpdatePayload(partial);
  if (!Object.keys(updatePayload).length) throw new Error('No valid fields to update');

  // Ensure user row exists in user_info
  const { data: userRow, error: userErr } = await supabase
    .from('user_info')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (userErr) throw new Error(userErr.message);
  if (!userRow) throw new Error('User not found');

  // Perform update only (avoids requiring INSERT RLS)
  const { error: updateErr } = await supabase
    .from('user_info')
    .update(updatePayload)
    .eq('user_id', userId);
  if (updateErr) throw new Error(updateErr.message);

  // Then fetch the updated row explicitly (more reliable across PostgREST modes)
  const { data: updated, error: selErr } = await supabase
    .from('user_info')
    .select('user_id, metric_height, metric_weight, age_range, gender, language, unit_system, walkthrough_completed')
    .eq('user_id', userId)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);
  if (!updated) throw new Error('Failed to retrieve updated user details');

  const updatedFields: Record<string, any> = {};
  for (const field of Object.keys(updatePayload)) {
    if (field === 'metric_height') updatedFields.height = (updated as any).metric_height;
    else if (field === 'metric_weight') updatedFields.weight = (updated as any).metric_weight;
    else if (field === 'age_range') updatedFields.age_range = (updated as any).age_range;
    else if (field === 'gender') updatedFields.gender = (updated as any).gender;
    else if (field === 'language') updatedFields.language = (updated as any).language;
    else if (field === 'unit_system') updatedFields.unit_system = (updated as any).unit_system;
    else if (field === 'walkthrough_completed') updatedFields.walkthrough_completed = (updated as any).walkthrough_completed;
  }
  return {
    success: true,
    message: 'User details updated successfully',
    user_id: userId,
    updated_fields: updatedFields,
  };
}

export async function fetchUserDetailsById(userId: string): Promise<UserDetailsRow | null> {
  const { data, error } = await supabase
    .from('user_info')
    .select('user_id, unit_system, metric_height, metric_weight, age_range, gender, language, walkthrough_completed, has_rated')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: (data as any).user_id,
    unit_system: (data as any).unit_system,
    metric_height: (data as any).metric_height,
    metric_weight: (data as any).metric_weight,
    age_range: (data as any).age_range,
    gender: (data as any).gender,
    language: (data as any).language,
    current_streak: null,
    walkthrough_completed: (data as any).walkthrough_completed,
    has_rated: (data as any).has_rated,
  };
}


