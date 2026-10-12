import {redirect} from 'next/navigation';
import {MfaForm} from '../../components/forms';
import {requireStaff} from '../../lib/auth';
import {signOut} from '../actions';
export default async function Mfa(){const {client}=await requireStaff(false);const {data:claims}=await client.auth.getClaims();if(claims?.claims.aal==='aal2')redirect('/');const {data,error}=await client.auth.mfa.listFactors();if(error)throw new Error('Could not load authenticators.');return <main className="auth"><section className="auth-card stack"><p className="eyebrow">STAFF SECURITY</p><h1>One more check.</h1><MfaForm factors={data.totp.filter(f=>f.status==='verified').map(f=>({id:f.id,name:f.friendly_name||'Authenticator'}))}/><form action={signOut}><button className="secondary">Sign out</button></form></section></main>;}
