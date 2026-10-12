import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'ConnectPK · Staff',description:'Private ConnectPK moderation portal',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){
 // Extensions can add body attributes before React hydrates (e.g. cz-shortcut-listen).
 return <html lang="en"><body suppressHydrationWarning>{children}</body></html>;
}
