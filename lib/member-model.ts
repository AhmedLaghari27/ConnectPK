export type MemberProfile={id:string;full_name:string;avatar_path:string|null;verified:boolean;professional_role:string|null;organization:string|null;independent:boolean;city:string;skills:string[];vision:string|null;can_help:string|null;photoUrl?:string};
export type MemberDraft={full_name:string;avatar_path:string;professional_role:string;organization:string;independent:boolean;city:string;skills:string;vision:string;can_help:string};
export function memberDraft(p:MemberProfile):MemberDraft{return {full_name:p.full_name,avatar_path:p.avatar_path??'',professional_role:p.professional_role??'',organization:p.organization??'',independent:p.independent,city:p.city,skills:p.skills.join(', '),vision:p.vision??'',can_help:p.can_help??''};}
export function validateMember(d:MemberDraft){
 const errors:Partial<Record<keyof MemberDraft,string>>={};
 const fields=[['full_name',2,120],['professional_role',2,100],['organization',d.independent?0:2,120],['skills',1,810],['vision',20,300],['can_help',20,500]] as const;
 for(const [key,min,max] of fields){const text=d[key].trim();if(text.length<min||text.length>max)errors[key]=`Enter ${min}–${max} characters.`;
 else if(/\b(dating|romance|romantic|hook[\s-]*up|sexting|sexual|sex|sexy|nudes?|porn|boyfriend|girlfriend|soulmate|flirt(?:ing)?)\b/i.test(text.normalize('NFKC')))errors[key]='Please keep your profile professional.';}
 if(!['Karachi','Lahore','Islamabad'].includes(d.city))errors.city='Choose your city.';
 if(!d.avatar_path)errors.avatar_path='Choose a profile photo.';
 const skills=d.skills.split(',').map(x=>x.trim());if(skills.length>10||skills.some(x=>!x||x.length>80))errors.skills='Use 1–10 skills, up to 80 characters each.';
 return errors;
}
export function parseMember(value:unknown):MemberProfile|null{
 if(!Array.isArray(value))throw new Error('Invalid profile');const p=value[0];if(!p)return null;
 if(!['id','full_name','city'].every(k=>typeof p[k]==='string')||!['avatar_path','professional_role','organization','vision','can_help'].every(k=>p[k]===null||typeof p[k]==='string')||typeof p.verified!=='boolean'||typeof p.independent!=='boolean'||!Array.isArray(p.skills)||!p.skills.every((s:unknown)=>typeof s==='string'))throw new Error('Invalid profile');
 return p as MemberProfile;
}
