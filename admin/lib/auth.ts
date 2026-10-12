import 'server-only';
import {redirect} from 'next/navigation';
import {serverClient} from './supabase';
export async function requireStaff(mfa=true){
 const client=await serverClient();const {data,error}=await client.auth.getUser();
 if(error||!data.user)redirect('/login');
 const {data:profile,error:profileError}=await client.from('profiles').select('id,full_name,role,status').eq('id',data.user.id).single();
 if(profileError)throw new Error('Unable to verify staff access.');
 if(!profile||!['moderator','admin'].includes(profile.role)||profile.status!=='approved')redirect('/login?denied=1');
 if(mfa){const {data:claims,error:claimsError}=await client.auth.getClaims();if(claimsError||claims?.claims.aal!=='aal2')redirect('/mfa');}
 return {client,profile};
}
