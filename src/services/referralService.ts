import { supabase } from '../lib/supabase';

export interface ReferralCodeValidationResult {
  isValid: boolean;
  error?: string;
}

export class ReferralService {
  /**
   * Validates a referral code against the referral_codes table
   * @param code - The referral code to validate
   * @returns Promise<ReferralCodeValidationResult>
   */
  static async validateReferralCode(code: string): Promise<ReferralCodeValidationResult> {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('code', code.trim().toUpperCase())
        .maybeSingle();

      if (error) {
        return {
          isValid: false,
          error: 'Database error occurred while validating referral code'
        };
      }

      // Check if code exists by checking if data is returned
      if (data) {
        return {
          isValid: true
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid referral code'
        };
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      return {
        isValid: false,
        error: 'Network error occurred while validating referral code'
      };
    }
  }
} 