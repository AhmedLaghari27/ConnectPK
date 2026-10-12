export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';
export function verificationStatus(value: unknown): VerificationStatus {
  if (value === 'unverified' || value === 'pending' || value === 'approved' || value === 'rejected') return value;
  throw new Error('Invalid verification status');
}
export function validEvidenceLink(value: string, linkedin = false): boolean {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return value.length <= 500 && url.protocol === 'https:' && !url.username && !url.password
      && (!linkedin || url.hostname === 'linkedin.com' || url.hostname === 'www.linkedin.com')
      && url.hostname.includes('.');
  } catch { return false; }
}
