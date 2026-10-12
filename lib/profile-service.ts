import type { ImagePickerAsset } from 'expo-image-picker';
import { supabase } from './supabase';
import { emptyProfile, listItems, professionalMessage, type ProfileForm } from './profile-form';

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}
async function userId() {
  const { data, error } = await client().auth.getUser();
  if (error || !data.user) throw new Error('Please sign in again.');
  return data.user.id;
}
export async function loadProfileDraft() {
  const id = await userId();
  const { data, error } = await client().from('profile_setup').select('data,step').eq('user_id', id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
  if (error) throw error;
  if (data) return { form: { ...emptyProfile, ...data.data } as ProfileForm, step: data.step as number };
  const { data: profile, error: profileError } = await client().from('profiles')
    .select('full_name,date_of_birth,city,intention').eq('id', id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
  if (profileError) throw profileError;
  return { form: { ...emptyProfile, ...profile }, step: 1 };
}
export async function saveProfileDraft(form: ProfileForm, nextStep: number, finish = false) {
  const payload = { ...form, organization: form.independent ? '' : form.organization };
  for (const key of ['skills', 'interests', 'languages'] as const) payload[key] = listItems(form[key]).join(', ');
  const { error } = await client().rpc('save_profile_setup', { payload, next_step: nextStep, finish })
    .abortSignal(AbortSignal.timeout(20000));
  if (error) throw error;
}
export async function photoPreview(path: string) {
  const { data, error } = await client().storage.from('profile-photos').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}
export async function uploadProfilePhoto(asset: ImagePickerAsset, unique = false) {
  const id = await userId();
  // ArrayBuffer works on both native and web; native Blob uploads are unreliable.
  const bytes = asset.file ? new Uint8Array(await asset.file.arrayBuffer())
    : Uint8Array.from(atob(asset.base64 ?? ''), c => c.charCodeAt(0));
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if ((!jpeg && !png) || !bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('Invalid photo');
  const path = `${id}/profile${unique ? `-${Date.now()}-${Math.random().toString(36).slice(2)}` : ''}.${jpeg ? 'jpg' : 'png'}`;
  const { error } = await client().storage.from('profile-photos').upload(path, bytes.buffer, {
    contentType: jpeg ? 'image/jpeg' : 'image/png', upsert: true, cacheControl: '0',
  });
  if (error) throw error;
  return path;
}
export function profileSaveError(error: unknown, fallback: string) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P0001'
    ? professionalMessage : fallback;
}
