import Link from 'next/link';
export function PageTitle({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){return <header className="page-title"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;}
export function Pagination({path,page,more}:{path:string;page:number;more:boolean}){return <nav className="pagination" aria-label="Queue pages">{page>0?<Link className="button secondary" href={`${path}?page=${page-1}`}>Previous</Link>:null}<span>Page {page+1}</span>{more?<Link className="button secondary" href={`${path}?page=${page+1}`}>Next</Link>:null}</nav>;}
export function Empty(){return <div className="empty"><span aria-hidden="true">✓</span><h2>Queue clear</h2><p>No items on this page. Check earlier pages or refresh for new submissions.</p></div>;}
export function Badge({children,tone='neutral'}:{children:React.ReactNode;tone?:'neutral'|'danger'}){return <span className={`badge ${tone}`}>{children}</span>;}
export function timestamp(value:string){return new Intl.DateTimeFormat('en-PK',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Karachi'}).format(new Date(value));}
