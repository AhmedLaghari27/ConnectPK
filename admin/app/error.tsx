'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="auth"><section className="auth-card stack"><h1>Unable to load this page.</h1><p>Check your connection and portal configuration, then retry. Your decision may already have saved; refresh before submitting again.</p><button onClick={reset}>Try again</button></section></main>;}
