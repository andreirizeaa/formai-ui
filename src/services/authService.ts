import { supabase } from '../lib/supabase';

interface DeleteUserResponse {
  success: boolean;
  message: string;
  user_id: string;
}

export async function deleteUserAccount(userId: string): Promise<DeleteUserResponse> {
  if (!userId || !userId.trim()) throw new Error('userId is required');

  // Verify current session user matches userId (mimics backend JWT check)
  const { data: sess } = await supabase.auth.getSession();
  const sessionUserId = sess?.session?.user?.id;
  if (sessionUserId && sessionUserId !== userId) throw new Error('User mismatch');

  // Ensure user exists in users and is not soft-deleted
  const { data: existing, error: selErr } = await supabase
    .from('users')
    .select('user_id, has_deleted')
    .eq('user_id', userId.trim())
    .eq('has_deleted', false)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);
  if (!existing) throw new Error('User not found or deleted');

  // Soft delete flags
  const payload = {
    has_deleted: true,
    has_deleted_at: new Date().toISOString(),
  } as const;

  const { error: updErr } = await supabase
    .from('user_info')
    .update(payload)
    .eq('user_id', userId.trim());
  if (updErr) throw new Error(updErr.message);

  // Soft delete flags on user_onboarding as well
  const { error: updOnboardingErr } = await supabase
    .from('user_onboarding')
    .update(payload)
    .eq('user_id', userId.trim());
  if (updOnboardingErr) throw new Error(updOnboardingErr.message);

  // Also mask PII in users table and set deletion flags there as well
  const payloadUsers = {
    full_name: 'DELETED',
    email: 'DELETED',
    has_deleted: true,
    has_deleted_at: new Date().toISOString(),
  } as const;
  const { error: updUsersErr } = await supabase
    .from('users')
    .update(payloadUsers)
    .eq('user_id', userId.trim());
  if (updUsersErr) throw new Error(updUsersErr.message);

  return {
    success: true,
    message: 'User successfully marked as deleted',
    user_id: userId,
  };
}