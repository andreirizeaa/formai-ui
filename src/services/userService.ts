import { supabase } from '../lib/supabase';

export interface UserRow {
	id: string;
	active_subscription: string | null;
    onboarding_completed: boolean;
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