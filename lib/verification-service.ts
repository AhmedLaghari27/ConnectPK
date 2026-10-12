import type { ImagePickerAsset } from 'expo-image-picker';
import { supabase } from './supabase';
import { verificationStatus } from './verification';
function client() { if (!supabase) throw new Error('Unavailable'); return supabase; }
export async function getVerificationStatus() {
  const { data, error } = await client().rpc('my_verification_status').abortSignal(AbortSignal.timeout(15000));
  if (error) throw error;
  return verificationStatus(data);
}
export async function beginVerification(): Promise<string> {
  const { data, error } = await client().rpc('begin_verification').abortSignal(AbortSignal.timeout(15000));
  if (error || typeof data !== 'string') throw error ?? new Error('Unavailable');
  return data;
}
export async function uploadEvidence(id: string, kind: 'selfie' | 'work' | 'university', asset: ImagePickerAsset) {
  const bytes = asset.file ? new Uint8Array(await asset.file.arrayBuffer()) : Uint8Array.from(atob(asset.base64 ?? ''), c => c.charCodeAt(0));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  if ((!jpeg && !png) || bytes.length > 5242880) throw new Error('Invalid image');
  const { error } = await client().storage.from('verification').upload(`${id}/${kind}`, bytes.buffer, { contentType: jpeg ? 'image/jpeg' : 'image/png', upsert: false });
  // An earlier upload may have succeeded before the connection dropped. Paths are immutable.
  if (error && !('statusCode' in error && String(error.statusCode) === '409')) throw error;
}
export async function submitVerification(id: string, linkedin: string, portfolio: string) {
  const { error } = await client().rpc('submit_verification', { upload_id: id, linkedin: linkedin.trim() ? new URL(linkedin.trim()).toString() : null, portfolio: portfolio.trim() ? new URL(portfolio.trim()).toString() : null }).abortSignal(AbortSignal.timeout(20000));
  if (error) throw error;
}
