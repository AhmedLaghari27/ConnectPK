export const notificationText={moderation_warning:'A moderator has sent you a warning.',new_comment:'New opinion on your post',new_offer:'New offer of help on your post',offer_accepted:'Your offer was accepted',offer_declined:'Thank you for offering to help. Your offer was declined.',new_message:'New message'} as const;
export type Notice={id:string;type:keyof typeof notificationText;data:Record<string,unknown>;read_at:string|null;created_at:string};
export function parseNotices(data:unknown):Notice[]{
 if(!Array.isArray(data)||data.some(n=>!n||typeof n.id!=='string'||typeof n.created_at!=='string'||(n.read_at!==null&&typeof n.read_at!=='string')||!Object.hasOwn(notificationText,n.type)||!n.data||typeof n.data!=='object'))throw new Error('Invalid notifications');
 return data as Notice[];
}
export function notificationDestination(n:Notice):{pathname:'/chat/[id]'|'/post/[id]';params:{id:string}}|null{
 const chat=n.type==='new_message'||n.type==='offer_accepted';const id=chat?n.data.conversation_id:n.data.post_id;
 return typeof id==='string'&&/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)?{pathname:chat?'/chat/[id]':'/post/[id]',params:{id}}:null;
}

export function warningMessage(n:Notice){return n.type==='moderation_warning'&&typeof n.data.message==='string'?n.data.message.slice(0,2000):null;}
