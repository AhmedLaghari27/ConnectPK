'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
const links=[['/','Overview'],['/verification','Verification queue'],['/reports','Reports queue'],['/hidden','Hidden posts']];
export function Navigation(){const path=usePathname();return <nav aria-label="Main navigation">{links.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>;}
