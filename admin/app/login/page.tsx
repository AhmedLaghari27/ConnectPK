import {LoginForm} from '../../components/forms';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{denied?:string}>}){
 const {denied}=await searchParams;const configured=!!process.env.SUPABASE_URL&&!!process.env.SUPABASE_PUBLISHABLE_KEY;
 return <main className="auth"><section className="auth-card stack"><div className="brand"><span>C</span>ConnectPK</div><p className="eyebrow">STAFF ACCESS</p><h1>A trusted space starts here.</h1><p>Sign in with your moderator or admin account. An authenticator code is required next.</p>{denied?<p role="alert" className="error">This account does not have approved moderator or admin access.</p>:null}{configured?<LoginForm/>:<p role="alert" className="error">Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to admin/.env.local, then restart the portal.</p>}<p className="muted">Member accounts cannot access this portal.</p></section></main>;
}
