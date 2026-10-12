export const postTypes = ['building','career_step','need_opinion','need_help','offering_help'] as const;
export type PostType = typeof postTypes[number];
export type FeedFilters = { type: PostType | null; city: string | null; tag: string };
export type FeedPost = {
  id: string; author_id: string; post_type: PostType; title: string; body: string; tags: string[]; city: string;
  created_at: string; author_name: string; author_photo: string | null; author_role: string | null; author_verified: boolean;
  useful_count: number; inspiring_count: number; support_count: number; comment_count: number; offer_count: number;
  photoUrl?: string;
};
export type FeedCursor = { time: string; id: string };
export function feedCursor(posts: FeedPost[]): FeedCursor | null {
  const last = posts.at(-1); return last ? { time: last.created_at, id: last.id } : null;
}
export function mergeFeedPosts(previous: FeedPost[], next: FeedPost[]) {
  const seen = new Set(previous.map(p => p.id)); return [...previous, ...next.filter(p => !seen.has(p.id))];
}
export function normalizeTag(value: string) { return value.trim().replace(/^#/, '').toLowerCase().slice(0,80); }
export function parseFeedPosts(value: unknown): FeedPost[] {
  if (!Array.isArray(value)) throw new Error('Invalid feed');
  for (const row of value) {
    if (!row || typeof row !== 'object' || !postTypes.includes(row.post_type)
      || !['id','author_id','title','body','city','created_at','author_name'].every(key=>typeof row[key]==='string')
      || !Number.isFinite(Date.parse(row.created_at))
      || !Array.isArray(row.tags) || !row.tags.every((tag: unknown)=>typeof tag==='string')
      || typeof row.author_verified!=='boolean'
      || !['author_photo','author_role'].every(key=>row[key]===null||typeof row[key]==='string')
      || !['useful_count','inspiring_count','support_count','comment_count','offer_count'].every(key=>Number.isSafeInteger(row[key])&&row[key]>=0)) throw new Error('Invalid feed');
  }
  return value as FeedPost[];
}
