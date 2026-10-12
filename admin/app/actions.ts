'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {serverClient} from '../lib/supabase';
import {requireStaff} from '../lib/auth';
import {validNote,type FormState} from '../lib/model';
import {qrImageSource} from '../lib/mfa';
export async function signIn(_state:FormState,form:FormData):Promise<FormState>{
 const email=String(form.get('email')??'').trim();const password=String(form.get('password')??'');
 if(!email||email.length>254||!password||password.length>128)return {error:'Enter your staff email and password.'};
 const client=await serverClient();const {error}=await client.auth.signInWithPassword({email,password});
 if(error)return {error:'Unable to sign in. Check your credentials or try again shortly.'};
 const {profile}=await requireStaff(false);if(profile)redirect('/mfa');return {};
}
export async function signOut(){const client=await serverClient();const {error}=await client.auth.signOut({scope:'local'});if(error)throw new Error('Could not sign out. Please retry.');redirect('/login');}
export async function enroll():Promise<FormState>{
 const {client}=await requireStaff(false);const {data:factors,error}=await client.auth.mfa.listFactors();if(error)return {error:'Could not load authenticators.'};
 if(factors.totp.some(f=>f.status==='verified'))return {error:'Use your existing authenticator, or refresh this page.'};
 for(const f of factors.all.filter(f=>f.factor_type==='totp'&&f.status==='unverified')){const {error}=await client.auth.mfa.unenroll({factorId:f.id});if(error)return {error:'Could not reset unfinished setup.'};}
 const {data,error:enrollError}=await client.auth.mfa.enroll({factorType:'totp',friendlyName:'ConnectPK staff'});
 if(enrollError)return {error:'Could not set up an authenticator. Try again.'};
 return {factorId:data.id,qr:qrImageSource(data.totp.qr_code),secret:data.totp.secret};
}
export async function verify(_state:FormState,form:FormData):Promise<FormState>{
 const {client}=await requireStaff(false);const code=String(form.get('code')??'');const factorId=String(form.get('factorId')??'');
 if(!/^\d{6}$/.test(code))return {error:'Enter the six-digit authenticator code.'};
 const {error}=await client.auth.mfa.challengeAndVerify({factorId,code});if(error)return {error:'That code could not be verified. Try the newest code.'};redirect('/');
}
export async function review(_state:FormState,form:FormData):Promise<FormState>{
 const {client}=await requireStaff();const kind=String(form.get('kind')??'');const target=String(form.get('target')??'');const decision=String(form.get('decision')??'');const note=String(form.get('note')??'');
 if(!validNote(note)||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(target))return {error:'Add a review note of 1–2,000 characters.'};
 const expected=String(form.get('expected')??'');
 const request=kind==='verification'?client.rpc('admin_review_verification',{target,expected_updated:expected,decision,note})
 :kind==='reports'?client.rpc('admin_review_report',{target,expected_updated:expected,decision,note})
 :kind==='hidden'?client.rpc('admin_review_hidden',{target,expected_version:Number(expected),decision,note}):null;
 if(!request)return {error:'Invalid review.'};
 const {error}=await request;
 if(error)return {error:error.code==='40001'?'Someone already reviewed or changed this item. Refresh the queue.':'Couldn’t save this decision. Check your permissions, connection, and whether the item is still available.'};
 revalidatePath('/','layout');return {success:'Decision saved and recorded in the audit log.'};
}
