import axios from 'axios';
import { supabase } from '../lib/supabase';
import { API_CONFIG } from './api';

interface DeleteUserResponse {
  success: boolean;
  message: string;
  user_id: string;
}

export async function deleteUserAccount(userId: string): Promise<DeleteUserResponse> {
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

  const response = await axios.post<DeleteUserResponse>(
    `${API_CONFIG.baseURL}/auth/delete`,
    { userId },
    { headers }
  );

  return response.data;
} 