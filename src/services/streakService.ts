import { supabase } from '../lib/supabase';

function formatDateAsDDMMYYYY(dateIso: string): string {
  // dateIso expected as 'YYYY-MM-DD'
  const [year, month, day] = dateIso.split('-');
  if (!year || !month || !day) return dateIso;
  return `${day}-${month}-${year}`;
}

export async function fetchUserStreakDays(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('streaks')
    .select('date_logged')
    .eq('user_id', userId)
    .order('date_logged', { ascending: true });

  if (error) throw new Error(error.message);

  const dates: string[] = (data ?? [])
    .map((row: { date_logged: string }) => row?.date_logged)
    .filter((d: string | null | undefined): d is string => typeof d === 'string');

  // Convert to DD-MM-YYYY to match calendar expectations
  return dates.map(formatDateAsDDMMYYYY);
}


