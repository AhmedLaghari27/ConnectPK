import {Navigation} from '../../components/navigation';
import Link from 'next/link';
import {requireStaff} from '../../lib/auth';
import {signOut} from '../actions';
export const dynamic='force-dynamic';
export default async function StaffLayout({children}:{children:React.ReactNode}){
 const {profile}=await requireStaff();return <div className="shell"><a className="skip" href="#main">Skip to content</a><aside className="sidebar"><Link className="brand" href="/"><span>C</span>ConnectPK</Link><p className="eyebrow">MODERATION DESK</p><Navigation/><div className="staff"><strong>{profile.full_name}</strong><span className="badge">{profile.role}</span><p className="muted">Private staff workspace</p><form action={signOut}><button className="secondary">Sign out</button></form></div></aside><main id="main" className="main">{children}</main></div>;
}
