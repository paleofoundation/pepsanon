import {glossaryIndex} from '@/lib/glossary-index';
import {peptides} from '@/lib/peptides';
import {stacks} from '@/lib/stacks';
import {siteUrl} from '@/lib/seo';
export function GET(){
 const paths=['/glossary',...glossaryIndex.map(term=>`/glossary/${term.slug}`),'/','/peptides','/stacks','/questions','/sources','/methodology','/medical-disclaimer',...peptides.map(p=>`/peptides/${p.id}`),...stacks.map(s=>`/stacks/${s.slug}`)];
 const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${siteUrl(path)}</loc><lastmod>2026-10-04</lastmod></url>`).join('')}</urlset>`;
 return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
