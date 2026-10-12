import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {cookieOptions,cookieSecurity,settings,timedFetch} from './config';
export async function serverClient(){
 const jar=await cookies();const {url,key}=settings();
 return createServerClient(url,key,{global:{fetch:timedFetch},cookieOptions,cookies:{
  getAll:()=>jar.getAll(),
  setAll:values=>{try{values.forEach(({name,value,options})=>jar.set(name,value,{...options,...cookieSecurity}));}catch{/* Proxy refreshes cookies for Server Components. */}},
 }});
}
