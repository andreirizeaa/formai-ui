import axios from 'axios';
import { API_CONFIG } from './api';

export interface CheckInsResponse {
  success: boolean;
  message: string;
  user_id: string;
  check_in_dates: string[];
  current_streak: number;
}

function formatDateAsDDMMYYYY(dateIso: string): string {
  // dateIso expected as 'YYYY-MM-DD'
  const [year, month, day] = dateIso.split('-');
  if (!year || !month || !day) return dateIso;
  return `${day}-${month}-${year}`;
}

export async function fetchUserCheckIns(userId: string): Promise<CheckInsResponse> {
  try {
    const response = await axios.get(`${API_CONFIG.baseURL}/check-ins/get`, {
      params: { user_id: userId },
      timeout: API_CONFIG.timeout,
    });
    
    // Validate response structure
    const data = response.data;
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Request was not successful');
    }
    
    // Ensure required fields are present
    if (!data.user_id || !Array.isArray(data.check_in_dates) || typeof data.current_streak !== 'number') {
      throw new Error('Missing required fields in response');
    }
    
    return data as CheckInsResponse;
  } catch (error: any) {
    if (error.response) {
      const errorMessage = error.response.data?.detail || 
                          error.response.data?.message || 
                          `HTTP ${error.response.status}: ${error.response.statusText}`;
      throw new Error(errorMessage);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check your connection');
    }
    throw new Error(error.message || 'Network error occurred');
  }
}

// Legacy function for backward compatibility
export async function fetchUserCheckInDays(userId: string): Promise<string[]> {
  const response = await fetchUserCheckIns(userId);
  return response.check_in_dates.map(formatDateAsDDMMYYYY);
}
