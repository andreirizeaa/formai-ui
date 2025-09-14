// services/liftApi.ts
import { API_CONFIG } from './api';

const API = API_CONFIG.baseURL;

export async function enqueueLiftAnalysis(body: {
  userId: string; 
  liftId: string; 
  lift: any;
  hasHdVideos?: boolean;
}): Promise<{ job_id: string; lift_id: string }> {
  const res = await fetch(`${API}/lifts/analyse`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(()=>"");
    throw new Error(`enqueue failed (${res.status}): ${t}`);
  }
  const j = await res.json();
  return { job_id: j.job_id ?? body.lift.assetId ?? body.liftId, lift_id: j.lift_id ?? body.liftId };
}

export async function getJobStatus(jobId: string, userId: string, liftId: string) {
  const u = new URL(`${API}/lifts/jobs/${encodeURIComponent(jobId)}`);
  u.searchParams.set('userId', userId);
  u.searchParams.set('liftId', liftId);

  const res = await fetch(u.toString());
  if (!res.ok) return null;
  const j = await res.json();
  // Merge top-level is_streak into the returned object for convenience
  if (!j) return null;
  const data = j.data || null;
  if (!data) return null;
  return { ...data, is_streak: j.is_streak ?? data.is_streak };
}

export async function deleteJob(jobId: string, userId: string): Promise<boolean> {
  const u = new URL(`${API}/lifts/jobs/${encodeURIComponent(jobId)}`);
  u.searchParams.set('userId', userId);
  try {
    const res = await fetch(u.toString(), { method: 'DELETE' });
    return res.ok;
  } catch (_) {
    return false;
  }
}
