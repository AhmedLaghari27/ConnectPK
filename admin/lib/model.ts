export type FormState={error?:string;success?:string;qr?:string;secret?:string;factorId?:string};
export type Verification={id:string;full_name:string;city:string;member_status:string;updated_at:string;submission_id:string|null;linkedin_url:string|null;portfolio_url:string|null;selfie:boolean;work:boolean;university:boolean;legacy:boolean;banned:boolean};
export type Report={id:string;reported_id:string|null;full_name:string|null;category:string|null;reason:string;severity:string;status:string;created_at:string;updated_at:string;kind:string;content:Record<string,unknown>|null};
export type HiddenPost={id:string;title:string;body:string;author_id:string;full_name:string;created_at:string;moderation_hold:boolean;report_count:number;review_version:number};
export type Dashboard={members:number;offers:number;accepted_offers:number;reports:number;scam_reports:number;pending_verifications:number;open_reports:number;hidden_posts:number;posts_per_day:{day:string;count:number}[]};
export function validNote(note:string){return note.trim().length>0&&note.length<=2000;}
export function safeLink(value:string|null){try{if(!value)return null;const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null;}catch{return null;}}
export function pageIndex(value:string|string[]|undefined){const n=typeof value==='string'?Number(value):0;return Number.isInteger(n)&&n>=0&&n<=100000?n:0;}
export function readable(value:unknown):string{return typeof value==='string'?value:Array.isArray(value)?value.filter(v=>typeof v==='string').join(', '):value==null?'':JSON.stringify(value);}
