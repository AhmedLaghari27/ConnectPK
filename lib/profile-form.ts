export const cities = ['Karachi', 'Lahore', 'Islamabad'] as const;
export const intentions = ['exchange_ideas', 'grow_professionally', 'build_together'] as const;
export const experiences = ['Starting out', '1–3 years', '4–7 years', '8+ years'] as const;
export const modes = ['online', 'public_venue', 'either'] as const;
export const professionalMessage = 'Let’s keep this professional. Please replace romantic or sexual wording with your professional interests and goals.';
export const restrictedPattern = /\b(dating|romance|romantic|hookup|hook[\s-]*up|sexting|sexual|sex|sexy|nudes?|porn|boyfriend|girlfriend|soulmate|flirt(?:ing)?)\b/i;
export type ProfileForm = {
  full_name: string; date_of_birth: string; avatar_path: string; city: string; broad_area: string;
  professional_role: string; independent: boolean; organization: string; industry: string; experience: string;
  skills: string; interests: string; languages: string; can_help: string; wants_to_meet: string; vision: string;
  intention: string; meeting_preference: string; slots: { date: string; start: string; end: string }[];
};
export const emptyProfile: ProfileForm = {
  full_name: '', date_of_birth: '', avatar_path: '', city: '', broad_area: '', professional_role: '',
  independent: false, organization: '', industry: '', experience: '', skills: '', interests: '', languages: '',
  can_help: '', wants_to_meet: '', vision: '', intention: '', meeting_preference: '', slots: [{ date: '', start: '', end: '' }],
};
export type ProfileErrors = Partial<Record<keyof ProfileForm, string>>;
export const listItems = (value: string) => [...new Set(value.split(',').map(s => s.trim()).filter(Boolean).map(s => s.toLowerCase()))];
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function isAdult(value: string, now = new Date()) {
  if (!validDate(value)) return false;
  const today = new Date(now.getTime() + 5 * 3600000).toISOString().slice(0, 10);
  const cutoff = `${Number(today.slice(0, 4)) - 18}${today.slice(4)}`;
  return value <= cutoff && value >= '1900-01-01';
}
export function validateProfileStep(form: ProfileForm, step: number, now = new Date()): ProfileErrors {
  const errors: ProfileErrors = {};
  const text = (key: keyof ProfileForm, min: number, max: number) => {
    const value = String(form[key]).trim();
    if (value.length < min || value.length > max) errors[key] = `Please enter ${min}–${max} characters.`;
    else if (restrictedPattern.test(value.normalize('NFKC'))) errors[key] = professionalMessage;
  };
  if (step === 1) {
    text('full_name', 2, 120); text('broad_area', 2, 80);
    if (!isAdult(form.date_of_birth, now)) errors.date_of_birth = 'Enter a valid birth date (YYYY-MM-DD). You must be 18 or older.';
    if (!cities.includes(form.city as typeof cities[number])) errors.city = 'Choose Karachi, Lahore, or Islamabad.';
    if (!form.avatar_path) errors.avatar_path = 'Please choose a profile photo.';
  }
  if (step === 2) {
    text('professional_role', 2, 100); text('industry', 2, 80);
    if (!form.independent) text('organization', 2, 120);
    if (!experiences.includes(form.experience as typeof experiences[number])) errors.experience = 'Choose your experience level.';
  }
  if (step === 3) for (const key of ['skills', 'interests', 'languages'] as const) {
    text(key, 1, 810);
    const items = listItems(form[key]);
    if (items.length < 1 || items.length > 10 || items.some(s => s.length > 80)) errors[key] = 'Add 1–10 comma-separated items, up to 80 characters each.';
  }
  if (step === 4) {
    text('can_help', 20, 500); text('wants_to_meet', 20, 500); text('vision', 20, 300);
    if (!intentions.includes(form.intention as typeof intentions[number])) errors.intention = 'Choose one networking intention.';
  }
  if (step === 5) {
    if (!modes.includes(form.meeting_preference as typeof modes[number])) errors.meeting_preference = 'Choose how you would like to meet.';
    const windows = form.slots.map(s => ({ start: Date.parse(`${s.date}T${s.start}:00+05:00`), end: Date.parse(`${s.date}T${s.end}:00+05:00`) }));
    if (!form.slots.length || form.slots.length > 5 || form.slots.some((s, i) => !validDate(s.date)
      || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.end)
      || windows[i].start <= now.getTime() || windows[i].end - windows[i].start < 30 * 60000)
      || windows.some((a, i) => windows.some((b, j) => i < j && a.start < b.end && b.start < a.end))) {
      errors.slots = 'Add 1–5 future, non-overlapping windows of at least 30 minutes, using YYYY-MM-DD and 24-hour HH:MM (Pakistan time).';
    }
  }
  return errors;
}
export function firstInvalidStep(form: ProfileForm) {
  for (let step = 1; step <= 5; step++) if (Object.keys(validateProfileStep(form, step)).length) return step;
  return null;
}
