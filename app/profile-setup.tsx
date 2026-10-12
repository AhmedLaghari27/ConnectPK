import {DetailButton as ActionButton} from '../components/post-detail-ui';
import { OnboardingFrame } from '../components/onboarding-frame';
import { Input as ProfileField } from '../components/ui';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../components/auth-provider';
import { CheckBox, ErrorMessage, LoadingSkeleton, useUiStyles } from '../components/onboarding-ui';
import { ProfileChoices, ProfilePhoto, ProfileProgress } from '../components/profile-fields';
import { SignOutButton } from '../components/sign-out-button';
import { profileCopy as c } from '../constants/profile-copy';
import { cities, emptyProfile, experiences, firstInvalidStep, intentions, modes, validateProfileStep, type ProfileErrors, type ProfileForm } from '../lib/profile-form';
import { loadProfileDraft, photoPreview, profileSaveError, saveProfileDraft, uploadProfilePhoto } from '../lib/profile-service';

export default function ProfileSetup() {
  const s = useUiStyles(); const { retry } = useAuth();
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadFailed(false);
    loadProfileDraft().then(async draft => {
      if (!active) return;
      setForm(draft.form); setStep(draft.step);
      if (draft.form.avatar_path) {
        try { const uri = await photoPreview(draft.form.avatar_path); if (active) setPreview(uri); }
        catch { /* The saved photo remains valid if its preview cannot load. */ }
      }
    }).catch(() => { if (active) setLoadFailed(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm(old => ({ ...old, [key]: value }));
    setErrors(old => ({ ...old, [key]: undefined })); setError(null);
  }
  async function pickPhoto() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7, base64: true, exif: false });
      if (!result.canceled && result.assets[0]) {
        const path = await uploadProfilePhoto(result.assets[0]);
        update('avatar_path', path); setPreview(result.assets[0].uri);
      }
    } catch { setError(c.photoError); }
    finally { lock.current = false; setBusy(false); }
  }
  async function next() {
    if (lock.current) return;
    const invalidStep = step === 5 ? firstInvalidStep(form) : null;
    const target = invalidStep ?? step;
    const validation = validateProfileStep(form, target);
    setErrors(validation); setError(null);
    if (Object.keys(validation).length) { setStep(target); return; }
    lock.current = true; setBusy(true);
    try {
      await saveProfileDraft(form, Math.min(step + 1, 5), step === 5);
      if (step === 5) retry();
      else { setStep(step + 1); setErrors({}); }
    } catch (e) { setError(profileSaveError(e, c.saveError)); }
    finally { lock.current = false; setBusy(false); }
  }
  const field = (key: keyof typeof c.labels & keyof ProfileForm, maxLength: number, multiline = false, placeholder?: string) =>
    <ProfileField key={key} label={c.labels[key]} value={String(form[key])} onChangeText={value => update(key, value)}
      error={errors[key]} maxLength={maxLength} multiline={multiline} style={multiline?{minHeight:120}:undefined} placeholder={placeholder} editable={!busy} autoCorrect={key !== 'date_of_birth'} />;
  if (loading || loadFailed) return <OnboardingFrame title={c.loading}>
    {loading ? <LoadingSkeleton /> : <><ErrorMessage message={c.loadError} /><ActionButton label={c.retry} onPress={() => setAttempt(n => n + 1)} /><SignOutButton /></>}
  </OnboardingFrame>;
  return <OnboardingFrame key={step} title={c.title[step - 1]} subtitle={c.subtitle[step - 1]} progress={<ProfileProgress step={step} />} footer={<>
    <ActionButton label={step === 5 ? c.finish : c.next} onPress={next} loading={busy} />
    {step > 1 ? <><ActionButton label={c.back} disabled={busy} secondary onPress={() => { setStep(step - 1); setErrors({}); setError(null); }} /><Text style={s.note}>{c.saved}</Text></> : null}
    </>}>
    {step === 1 ? <>
      {field('full_name', 120)}
      {preview ? <ProfilePhoto uri={preview} /> : form.avatar_path ? <Text style={s.note}>{c.uploaded}</Text> : null}
      <ActionButton label={c.photo} onPress={pickPhoto} disabled={busy} secondary />
      <Text style={s.note}>{c.photoHint}</Text><ErrorMessage message={errors.avatar_path ?? null} />
      {field('date_of_birth', 10, false, '1995-04-23')}
      <ProfileChoices label={c.labels.city} values={cities} value={form.city} onChange={v => update('city', v)} error={errors.city} disabled={busy} />
      {field('broad_area', 80)}
    </> : null}
    {step === 2 ? <>
      {field('professional_role', 100)}
      <CheckBox label={c.independent} checked={form.independent} onChange={() => update('independent', !form.independent)} disabled={busy} />
      {!form.independent ? field('organization', 120) : null}
      {field('industry', 80)}
      <ProfileChoices label={c.labels.experience} values={experiences} value={form.experience} onChange={v => update('experience', v)} error={errors.experience} disabled={busy} />
    </> : null}
    {step === 3 ? <>{field('skills', 810, true, 'Project management, design')}{field('interests', 810, true, 'Entrepreneurship, education')}{field('languages', 810, false, 'Urdu, English')}</> : null}
    {step === 4 ? <>
      <ProfileChoices label={c.labels.intention} values={intentions} labels={c.intentions} value={form.intention} onChange={v => update('intention', v)} error={errors.intention} disabled={busy} />
      {field('can_help', 500, true)}{field('wants_to_meet', 500, true)}{field('vision', 300, true)}
    </> : null}
    {step === 5 ? <>
      <ProfileChoices label={c.labels.meeting_preference} values={modes} labels={c.modes} value={form.meeting_preference} onChange={v => update('meeting_preference', v)} error={errors.meeting_preference} disabled={busy} />
      {form.slots.map((slot, index) => <View style={s.card} key={index}>
        <Text style={s.label}>{`${c.window} ${index + 1} · ${c.pakistanTime}`}</Text>
        {(['date', 'start', 'end'] as const).map(key => <ProfileField key={key}
          label={c[key]}
          value={slot[key]} placeholder={key === 'date' ? 'YYYY-MM-DD' : key === 'start' ? '14:00' : '15:00'}
          maxLength={key === 'date' ? 10 : 5} editable={!busy}
          onChangeText={v => update('slots', form.slots.map((item, i) => i === index ? { ...item, [key]: v } : item))} />)}
        {form.slots.length > 1 ? <ActionButton label={c.remove} disabled={busy} secondary onPress={() => update('slots', form.slots.filter((_, i) => i !== index))} /> : null}
      </View>)}
      <ErrorMessage message={errors.slots ?? null} />
      {form.slots.length < 5 ? <ActionButton label={c.add} disabled={busy} secondary onPress={() => update('slots', [...form.slots, { date: '', start: '', end: '' }])} /> : null}
    </> : null}
    <ErrorMessage message={error} />
    {!busy ? <SignOutButton /> : null}
  </OnboardingFrame>;
}
