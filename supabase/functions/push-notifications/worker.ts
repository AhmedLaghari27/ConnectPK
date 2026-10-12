export type PushJob={job_id:string;job_lease:string;device_token:string;notification_id:string;event_type:string;ticket_id:string|null};
export const pushBodies:Record<string,string>={new_comment:'Someone shared an opinion on your post.',new_offer:'You received an offer of help.',offer_accepted:'Your offer was accepted.',offer_declined:'Thank you for offering to help. Your offer was declined.',new_message:'You have a new message.'};
type Outcome={outcome:'pending'|'ticket'|'delivered'|'dead'|'skipped';expo_ticket?:string;failure?:string};
export async function deliver(job:PushJob,request:typeof fetch,accessToken?:string):Promise<Outcome>{
 const body=pushBodies[job.event_type];if(!body)return {outcome:'skipped'};
 const receipt=!!job.ticket_id;
 try{
  const response=await request(`https://exp.host/--/api/v2/push/${receipt?'getReceipts':'send'}`,{
   method:'POST',headers:{'Content-Type':'application/json',...(accessToken?{Authorization:`Bearer ${accessToken}`}:{})},
   body:JSON.stringify(receipt?{ids:[job.ticket_id]}:{to:job.device_token,title:'ConnectPK',body,sound:'default',channelId:'connectpk',data:{notification_id:job.notification_id}}),
   signal:AbortSignal.timeout(15000),
  });
  if(!response.ok)return {outcome:response.status===429||response.status>=500?(receipt?'ticket':'pending'):'dead',failure:`HTTP_${response.status}`};
  const payload=await response.json();const result=receipt?payload.data?.[job.ticket_id!]:payload.data;
  if(!result)return {outcome:receipt?'ticket':'pending',failure:'ResponseMissing'};
  if(result.status==='ok'){
   if(receipt)return {outcome:'delivered'};
   return typeof result.id==='string'?{outcome:'ticket',expo_ticket:result.id}:{outcome:'pending',failure:'TicketMissing'};
  }
  const code=typeof result.details?.error==='string'?result.details.error:'ExpoError';
  return {outcome:code==='MessageRateExceeded'?(receipt?'ticket':'pending'):'dead',failure:code};
 }catch{return {outcome:receipt?'ticket':'pending',failure:'NetworkError'};}
}
