export function qrImageSource(value:string):string{
 // Supabase prefixes raw SVG; encode only the SVG, never the whole data URL.
 const prefix='data:image/svg+xml;utf-8,';
 const svg=value.startsWith(prefix)?value.slice(prefix.length):value;
 if(svg.trimStart().startsWith('<'))return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
 return value;
}
