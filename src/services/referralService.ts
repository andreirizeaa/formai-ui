import { supabase } from '../lib/supabase';

export interface ReferralCode {
  id: string;
  referral_code: string;
  type: 'DISCOUNT' | 'SKIP_PAYWALL';
  inserted_at: string;
  updated_at: string;
}

export interface ReferralValidationResult {
  isValid: boolean;
  referralCode?: ReferralCode;
  error?: string;
}

export async function validateReferralCode(code: string): Promise<ReferralValidationResult> {
  try {
    if (!code || code.trim().length === 0) {
      return {
        isValid: false,
        error: 'Referral code is required'
      };
    }

    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('referral_code', code.trim().toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return {
          isValid: false,
          error: 'Referral code not found'
        };
      }
      throw error;
    }

    if (!data) {
      return {
        isValid: false,
        error: 'Referral code not found'
      };
    }

    return {
      isValid: true,
      referralCode: data as ReferralCode
    };

  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      isValid: false,
      error: 'Failed to validate referral code'
    };
  }
}

export async function getReferralCodeType(code: string): Promise<{ type?: 'DISCOUNT' | 'SKIP_PAYWALL'; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('type')
      .eq('referral_code', code)
      .single();

    if (error && error.code === 'PGRST116') { // No rows found
      return { error: 'Referral code not found' };
    } else if (error) {
      console.error('Supabase error fetching referral code type:', error);
      return { error: error.message };
    }

    if (data && data.type) {
      return { type: data.type as 'DISCOUNT' | 'SKIP_PAYWALL' };
    } else {
      return { error: 'Invalid referral code type' };
    }
  } catch (e) {
    console.error('Unexpected error fetching referral code type:', e);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getUserReferralCode(userId: string): Promise<{ referralCode?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_info')
      .select('referral_code')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase error fetching user referral code:', error);
      return { error: error.message };
    }

    if (data && data.referral_code) {
      return { referralCode: data.referral_code };
    } else {
      return { referralCode: undefined };
    }
  } catch (e) {
    console.error('Unexpected error fetching user referral code:', e);
    return { error: 'An unexpected error occurred' };
  }
}