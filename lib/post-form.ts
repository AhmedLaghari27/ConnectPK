export const postKinds = ['building','career_step','need_opinion','need_help','offering_help'] as const;
export const postCities = ['Karachi','Lahore','Islamabad'] as const;
export type PostDraft = { post_type: string; title: string; body: string; tags: string; city: string };
export type PostErrors = Partial<Record<keyof PostDraft,string>>;
export const postPrompts = {
  building: 'What are you building?', career_step: 'What step are you taking?',
  need_opinion: 'What would you like an opinion on?', need_help: 'What help do you need?', offering_help: 'How can you help others?',
};
export const professionalWarning = 'Let’s keep this professional. Please remove romantic or sexual wording.';
export const moneyWarning = 'Please remove requests to send money or promises of guaranteed returns. Describe your professional project or the guidance you need instead.';
export const parseTags = (text: string) => [...new Set(text.split(',').map(t=>t.trim().replace(/^#/,'').toLowerCase()).filter(Boolean))];
export function validatePost(draft: PostDraft): PostErrors {
  const errors: PostErrors = {};
  if (!postKinds.includes(draft.post_type as typeof postKinds[number])) errors.post_type='Choose a post type.';
  if (!postCities.includes(draft.city as typeof postCities[number])) errors.city='Choose your city.';
  if (!draft.title.trim() || draft.title.trim().length>160) errors.title='Add a title of 1–160 characters.';
  if (!draft.body.trim() || draft.body.trim().length>5000) errors.body='Add a body of 1–5,000 characters.';
  const tags=parseTags(draft.tags);
  if(tags.length>5 || tags.some(t=>t.length>40)) errors.tags='Use up to 5 tags, each at most 40 characters, separated by commas.';
  for(const key of ['title','body','tags'] as const) {
    const text=draft[key].normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'');
    if(/\b(dating|romance|romantic|hook[\s-]*up|sexting|sexual|sex|sexy|nudes?|porn|boyfriend|girlfriend|soulmate|flirt(?:ing)?)\b/i.test(text)) errors[key]=professionalWarning;
    if(/\b(send|transfer|wire)\s+(me\s+|us\s+)?(money|cash|funds|crypto)\b|\bguaranteed\s+(returns?|profits?)\b|\bdouble\s+your\s+money\b|\b(pay|send)\s+(an?\s+)?(upfront|advance)\s+(fee|payment)\b/i.test(text)) errors[key]=moneyWarning;
  }
  return errors;
}
