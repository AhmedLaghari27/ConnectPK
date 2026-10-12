export function settings(){
 const url=process.env.SUPABASE_URL;const key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in admin/.env.local.');
 return {url,key};
}
export const cookieSecurity={path:'/',httpOnly:true,sameSite:'lax' as const,secure:process.env.NODE_ENV==='production'};
export const cookieOptions={name:'connectpk-admin-auth',...cookieSecurity};
export const timedFetch:typeof fetch=(input,init)=>fetch(input,{...init,cache:'no-store',signal:init?.signal??AbortSignal.timeout(15000)});
