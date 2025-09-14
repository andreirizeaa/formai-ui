import { OnboardingData } from '../types/onboarding';
import { supabase } from '../lib/supabase';

interface OnboardingApiResponse {
  success: boolean;
  message: string;
  user_id: string;
}

function isoDateOrNull(value?: string | null): string | null {
  if (!value) return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  return m?.[1] ?? null;
}

function buildOnboardingPayload(input: OnboardingData): { info: Record<string, any>; onboarding: Record<string, any> } {
  if (!input?.userId || !input.userId.trim()) throw new Error('userId is required');
  const userId = input.userId.trim();
  const info: Record<string, any> = { user_id: userId };
  const onboarding: Record<string, any> = { user_id: userId };
  const raw: Record<string, any> = { ...input };
  const infoMapping: Record<string, string> = {
    language: 'language',
    gender: 'gender',
    unitSystem: 'unit_system',
    metricHeight: 'metric_height',
    metricWeight: 'metric_weight',
    birthDate: 'birth_date',
    hasRated: 'has_rated',
    onboardingCompleted: 'walkthrough_completed',
  };
  const onboardingMapping: Record<string, string> = {
    workoutsPerWeek: 'workouts_per_week',
    discoverySource: 'discovery_source',
    trainingReason: 'training_reason',
    gymChallenge: 'gym_challenge',
    lifterType: 'lifter_type',
    perfectFormGoal: 'perfect_form_goal',
    formConfidence: 'form_confidence',
    threeMonthGoal: 'three_month_goal',
    hasPersonalTrainer: 'has_personal_trainer',
    onboardingCompleted: 'onboarding_completed',
    signInMethod: 'sign_in_method',
  };

  for (const [frontendKey, dbKey] of Object.entries(infoMapping)) {
    const val = raw[frontendKey];
    if (val === undefined || val === null) continue;
    if (dbKey === 'birth_date') {
      const normalized = isoDateOrNull(String(val));
      if (!normalized) continue;
      info[dbKey] = normalized;
    } else {
      info[dbKey] = val;
    }
  }

  for (const [frontendKey, dbKey] of Object.entries(onboardingMapping)) {
    const val = raw[frontendKey];
    if (val === undefined || val === null) continue;
    onboarding[dbKey] = val;
  }

  return { info, onboarding };
}

async function upsertWithRetry(
  table: string,
  payload: Record<string, any>,
  attempts = 2,
  delayMs = 250
): Promise<void> {
  let lastError: string | null = null;
  for (let i = 1; i <= attempts; i++) {
    const { error } = await supabase.from(table).upsert(payload, { onConflict: 'user_id' });
    if (!error) return;
    lastError = error.message;
    if (i < attempts) await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error(lastError || 'Database error');
}

export async function saveOnboardingProgress(
  data: OnboardingData,
  authToken?: string
): Promise<OnboardingApiResponse> {
  // Optional token verification: ensure the token, if present, matches the userId
  if (authToken) {
    const { data: authUser, error: authErr } = await supabase.auth.getUser(authToken);
    if (authErr) throw new Error('Invalid token');
    if (authUser?.user?.id && authUser.user.id !== data.userId) throw new Error('User mismatch');
  }

  const { info, onboarding } = buildOnboardingPayload(data);
  // Ensure walkthrough_completed defaults to false on first creation if not provided
  if (info.walkthrough_completed === undefined) info.walkthrough_completed = false;
  // 1) Ensure parent row exists in public.users (FK target) and not soft-deleted
  await upsertWithRetry('users', { user_id: data.userId });
  // If a previously soft-deleted row exists, revive it by clearing flags
  await supabase
    .from('users')
    .update({ has_deleted: false, has_deleted_at: null })
    .eq('user_id', data.userId);
  // 2) Upsert dependent tables
  await upsertWithRetry('user_info', info);
  await upsertWithRetry('user_onboarding', onboarding);

  return {
    success: true,
    message: 'Onboarding data submitted successfully',
    user_id: data.userId as string,
  };
}

export async function deleteUser(
  userId: string,
  authToken?: string
): Promise<OnboardingApiResponse> {
  if (!userId || !userId.trim()) throw new Error('userId is required');

  // Ensure user exists
  const { data: userRow, error: userErr } = await supabase
    .from('user_info')
    .select('user_id')
    .eq('user_id', userId.trim())
    .maybeSingle();
  if (userErr) throw new Error(userErr.message);
  if (!userRow) throw new Error('User not found');

  // Optional token verification
  if (authToken) {
    const { data: authUser, error: authErr } = await supabase.auth.getUser(authToken);
    if (authErr) throw new Error('Invalid token');
    if (authUser?.user?.id && authUser.user.id !== userId) throw new Error('User mismatch');
  }

  const payload = {
    has_deleted: true,
    has_deleted_at: new Date().toISOString(),
    full_name: 'DELETED',
    email: 'DELETED',
  };

  const { error: updateErr } = await supabase
    .from('user_info')
    .update(payload)
    .eq('user_id', userId.trim());
  if (updateErr) throw new Error(updateErr.message);

  return {
    success: true,
    message: 'User successfully marked as deleted',
    user_id: userId,
  };
}