import {requireStaff} from '../../../../lib/auth';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string;kind:string}>}){
 const {client}=await requireStaff();const {id,kind}=await params;
 if(!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)||!['selfie','work','university','legacy'].includes(kind))return new Response('Not found',{status:404});
 const {data:path,error}=await client.rpc('admin_evidence',{target:id,kind});
 if(error||typeof path!=='string')return new Response('Evidence unavailable',{status:404});
 const {data,error:downloadError}=await client.storage.from('verification').download(path);
 if(downloadError||!data)return new Response('Evidence unavailable. Please retry.',{status:502});
 if(!['image/jpeg','image/png'].includes(data.type))return new Response('Unsupported evidence format',{status:415});
 return new Response(await data.arrayBuffer(),{headers:{'Content-Type':data.type,'Cache-Control':'private, no-store, max-age=0','Content-Disposition':'inline','X-Content-Type-Options':'nosniff'}});
}
