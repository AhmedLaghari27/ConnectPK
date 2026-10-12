import {VerificationStatusCard} from '../components/verification-status-card';
import {DetailButton as ActionButton} from '../components/post-detail-ui';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ErrorMessage, LoadingSkeleton, useUiStyles } from '../components/onboarding-ui';
import { ProfileField } from '../components/profile-fields';
import { SignOutButton } from '../components/sign-out-button';
import { verificationCopy as c } from '../constants/verification-copy';
import { useTheme } from '../constants/theme';
import { validEvidenceLink, type VerificationStatus } from '../lib/verification';
import { beginVerification, getVerificationStatus, submitVerification, uploadEvidence } from '../lib/verification-service';

export default function VerificationScreen() {
  const s = useUiStyles(); const t = useTheme();
  const [status, setStatus] = useState<VerificationStatus>();
  const [busy, setBusy] = useState(false); const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<ImagePicker.ImagePickerAsset>();
  const [work, setWork] = useState<ImagePicker.ImagePickerAsset>();
  const [university, setUniversity] = useState<ImagePicker.ImagePickerAsset>();
  const [linkedin, setLinkedin] = useState(''); const [portfolio, setPortfolio] = useState('');
  const uploadId = useRef<string | null>(null);
  async function refresh() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try { setStatus(await getVerificationStatus()); } catch { setError(c.error); }
    finally { lock.current = false; setBusy(false); }
  }
  useEffect(() => { void refresh(); }, []);
  async function pick(kind: 'selfie' | 'work' | 'university') {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try {
      let result: ImagePicker.ImagePickerResult;
      if (kind === 'selfie') {
        if (Platform.OS === 'web') { setError(c.mobile); return; }
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setError(c.permission); return; }
        result = await ImagePicker.launchCameraAsync({ cameraType: ImagePicker.CameraType.front, mediaTypes: ['images'], quality: 0.7, base64: true, exif: false });
      } else result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, base64: true, exif: false });
      if (!result.canceled && result.assets[0]) {
        uploadId.current = null;
        (kind === 'selfie' ? setSelfie : kind === 'work' ? setWork : setUniversity)(result.assets[0]);
      }
    } catch { setError(c.error); }
    finally { lock.current = false; setBusy(false); }
  }
  async function submit() {
    if (lock.current) return;
    if (!selfie) { setError(c.missing); return; }
    if (!validEvidenceLink(linkedin, true) || !validEvidenceLink(portfolio)) { setError(c.linkError); return; }
    lock.current = true; setBusy(true); setError(null);
    try {
      uploadId.current ??= await beginVerification();
      await uploadEvidence(uploadId.current, 'selfie', selfie);
      if (work) await uploadEvidence(uploadId.current, 'work', work);
      if (university) await uploadEvidence(uploadId.current, 'university', university);
      await submitVerification(uploadId.current, linkedin, portfolio);
      setSelfie(undefined); setWork(undefined); setUniversity(undefined); setLinkedin(''); setPortfolio('');
      setStatus(await getVerificationStatus());
    } catch { setError(c.error); }
    finally { lock.current = false; setBusy(false); }
  }
  const editable = status === 'unverified' || status === 'rejected';
  return <OnboardingFrame title="Let’s verify it’s you." subtitle={c.subtitle}>
    {!status && !error ? <LoadingSkeleton /> : status ? <VerificationStatusCard status={status}/> : null}
    <Text style={s.body}>{c.privacy}</Text>
    {editable ? <>
      <View style={{gap:t.spacing.sm}}><Text style={s.label}>1 · Capture a fresh selfie</Text><Text style={s.note}>Use the mobile app in good light, with your face clearly visible.</Text></View>
      {selfie ? <Image accessibilityLabel={c.selected} source={{ uri: selfie.uri }} style={{ width: '100%', maxWidth: t.avatar.hero*2, aspectRatio: 1, alignSelf:'center', borderRadius: t.radius.md }} /> : null}
      <ActionButton label={selfie ? c.retake : c.selfie} onPress={() => pick('selfie')} disabled={busy} secondary />
      <Text style={s.label}>2 · Add professional evidence (optional)</Text>
      <ProfileField label={c.linkedin} value={linkedin} onChangeText={setLinkedin} autoCapitalize="none" keyboardType="url" maxLength={500} editable={!busy} />
      <ProfileField label={c.portfolio} value={portfolio} onChangeText={setPortfolio} autoCapitalize="none" keyboardType="url" maxLength={500} editable={!busy} />
      <Text style={s.note}>{c.formats}</Text>
      <ActionButton label={work ? c.workReady : c.work} onPress={() => pick('work')} disabled={busy} secondary />
      {work ? <ActionButton label={c.removeWork} onPress={() => { setWork(undefined); uploadId.current = null; }} disabled={busy} secondary /> : null}
      <ActionButton label={university ? c.universityReady : c.university} onPress={() => pick('university')} disabled={busy} secondary />
      {university ? <ActionButton label={c.removeUniversity} onPress={() => { setUniversity(undefined); uploadId.current = null; }} disabled={busy} secondary /> : null}
      <Text style={s.label}>3 · Send for private review</Text>
      <Text style={s.note}>Your submission will show as pending while it is reviewed.</Text>
      <ActionButton label={c.submit} onPress={submit} loading={busy} />
    </> : null}
    <ErrorMessage message={error} />
    <ActionButton label={status ? c.refresh : c.retry} onPress={refresh} disabled={busy} secondary />
    {status === 'approved' ? <ActionButton label={c.home} onPress={() => router.replace('/home')} /> : null}
    {!busy ? <SignOutButton /> : null}
  </OnboardingFrame>;
}
