export type Conversation={id:string;other_id:string;other_name:string;post_title:string;last_message:string|null;activity_at:string};
export type ChatMessage={id:string;sender_id:string;body:string;created_at:string};
export const chatSafety='Never send money to anyone you haven’t verified; meet in public places.';
export function validateMessage(body:string){return body.trim().length>0&&body.trim().length<=4000;}
export function parseConversations(value:unknown):Conversation[]{
 if(!Array.isArray(value)||value.some(r=>!r||!['id','other_id','other_name','post_title','activity_at'].every(k=>typeof r[k]==='string')||(r.last_message!==null&&typeof r.last_message!=='string')))throw new Error('Invalid conversations');
 return value as Conversation[];
}
export function parseMessages(value:unknown):ChatMessage[]{
 if(!Array.isArray(value)||value.some(r=>!r||!['id','sender_id','body','created_at'].every(k=>typeof r[k]==='string')))throw new Error('Invalid messages');
 return value as ChatMessage[];
}
export function mergeMessages(previous:ChatMessage[],next:ChatMessage[]){
 return [...new Map([...previous,...next].map(row=>[row.id,row])).values()].sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id));
}
