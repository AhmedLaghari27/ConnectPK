'use client';
import {useActionState,useState} from 'react';
import {enroll,review,signIn,verify} from '../app/actions';
import type {FormState} from '../lib/model';
const initial:FormState={};
function Feedback({state}:{state:FormState}){return <>{state.error?<p className="error" role="alert">{state.error}</p>:null}{state.success?<p className="success" role="status">{state.success}</p>:null}</>;}
export function LoginForm(){const [state,action,pending]=useActionState(signIn,initial);return <form action={action} className="stack"><label>Email<input name="email" type="email" autoComplete="username" required maxLength={254}/></label><label>Password<input name="password" type="password" autoComplete="current-password" required maxLength={128}/></label><Feedback state={state}/><button disabled={pending}>{pending?'Signing in…':'Sign in'}</button></form>;}
export function MfaForm({factors}:{factors:{id:string;name:string}[]}){
 const [setup,setupAction,settingUp]=useActionState(enroll,initial);const [state,verifyAction,pending]=useActionState(verify,initial);
 return <div className="stack">{!factors.length?<form action={setupAction} className="stack"><p>Connect an authenticator app to protect private member evidence.</p><button disabled={settingUp||!!setup.factorId}>{settingUp?'Preparing…':'Set up authenticator'}</button><Feedback state={setup}/></form>:null}
  {setup.qr?<div className="qr"><p>Scan this QR code in your authenticator app. Keep it private.</p>{/* The QR must stay local and must not pass through an image optimizer. */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={setup.qr} alt="Private authenticator enrollment QR code" width={220} height={220}/></div>:null}
  {setup.secret?<details><summary>Can’t scan? Enter a setup key instead</summary><p>In your authenticator, add a time-based account named ConnectPK staff using this private key.</p><code style={{overflowWrap:'anywhere',userSelect:'all'}}>{setup.secret}</code><p>Keep this key private. Enter the app’s six-digit code below.</p></details>:null}
  {factors.length||setup.factorId?<form action={verifyAction} className="stack">
   {factors.length?<label>Authenticator<select name="factorId">{factors.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label>:<input type="hidden" name="factorId" value={setup.factorId}/>}
   <label>Six-digit code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required/></label><Feedback state={state}/><button disabled={pending}>{pending?'Verifying…':'Verify and continue'}</button>
  </form>:null}
 </div>;
}
export function ReviewForm({kind,id,expected,options}:{kind:'verification'|'reports'|'hidden';id:string;expected:string;options:{value:string;label:string}[]}){
 const [state,action,pending]=useActionState(review,initial);const [decision,setDecision]=useState('');const destructive=['remove','suspend','ban'].includes(decision);
 return <form action={action} className="review stack"><input type="hidden" name="kind" value={kind}/><input type="hidden" name="target" value={id}/><input type="hidden" name="expected" value={expected}/>
  <label>Decision<select name="decision" value={decision} onChange={e=>setDecision(e.target.value)} required disabled={pending}><option value="">Choose an action</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
  <label>{decision==='warn'?'Warning shown to the member':'Review note'}<textarea name="note" required maxLength={2000} rows={3} disabled={pending} placeholder="Explain the decision. Do not copy private evidence here."/></label>
  {destructive?<label className="check"><input key={decision} type="checkbox" required disabled={pending}/>I reviewed the content and confirm this action.</label>:null}
  {decision==='ban'?<p className="muted">A ban disables member participation permanently. This portal cannot reverse bans.</p>:null}
  {decision==='suspend'?<p className="muted">Participation stays disabled until a trusted administrator reinstates the account.</p>:null}
  <Feedback state={state}/><button disabled={pending||!decision}>{pending?'Saving…':'Save decision'}</button>
 </form>;
}
