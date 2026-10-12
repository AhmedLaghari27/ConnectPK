import {deliver,type PushJob} from './worker.ts';
Deno.serve(async(request:Request)=>{
 const secret=Deno.env.get('PUSH_WORKER_SECRET');
 if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return new Response('Unauthorized',{status:401});
 if(request.method!=='POST')return new Response('Method not allowed',{status:405});
 const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return new Response('Missing worker configuration',{status:503});
 async function rpc(name:string,args:unknown){
  const response=await fetch(`${url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:key!,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Database request failed');
  const text=await response.text();return text?JSON.parse(text):null;
 }
 try{
  const jobs:PushJob[]=await rpc('claim_push_jobs',{});
  for(let offset=0;offset<jobs.length;offset+=5){
   await Promise.all(jobs.slice(offset,offset+5).map(async job=>{
    const result=await deliver(job,fetch,Deno.env.get('EXPO_ACCESS_TOKEN'));
    await rpc('finish_push_job',{target:job.job_id,expected_lease:job.job_lease,outcome:result.outcome,expo_ticket:result.expo_ticket??null,failure:result.failure??null});
   }));
  }
  return Response.json({processed:jobs.length});
 }catch{return new Response('Worker failed; leased jobs will retry',{status:503});}
});
