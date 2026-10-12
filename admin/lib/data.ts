import 'server-only';
import {requireStaff} from './auth';
import type {Dashboard} from './model';
export async function queue<T>(name:'verification'|'reports'|'hidden',page:number){
 const {client}=await requireStaff();const {data,error}=await client.rpc('admin_queue',{queue:name,page_number:page});
 if(error||!Array.isArray(data))throw new Error('Queue unavailable. Check the migration and your connection.');
 return {rows:data.slice(0,20) as T[],more:data.length>20};
}
export async function dashboard(){const {client}=await requireStaff();const {data,error}=await client.rpc('admin_dashboard');if(error||!data)throw new Error('Dashboard unavailable.');return data as Dashboard;}
