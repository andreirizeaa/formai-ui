import axios from 'axios';
import { OnboardingData } from '../types/onboarding';
import { API_CONFIG } from './api';

interface OnboardingApiResponse {
  success: boolean;
  message: string;
  user_id: string;
}

export async function saveOnboardingProgress(
  data: OnboardingData,
  authToken?: string
): Promise<OnboardingApiResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post<OnboardingApiResponse>(
      `${API_CONFIG.baseURL}/auth/submit/onboarding`,
      data,
      {
        headers,
        timeout: API_CONFIG.timeout,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     `HTTP error! status: ${error.response?.status}`;
      throw new Error(message);
    }
    
    throw error;
  }
}