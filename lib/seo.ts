import type {Metadata} from 'next';
export const SITE_ORIGIN='https://pepsanon.com';
export const siteUrl=(path:string)=>`${SITE_ORIGIN}${path==='/'?'/':path}`;
export function pageMetadata(title:string,description:string,path:string):Metadata{
 return {title,description,alternates:{canonical:siteUrl(path)},openGraph:{type:'website',siteName:'Peptides Anonymous',locale:'en_US',url:siteUrl(path),title,description},twitter:{card:'summary',title,description},robots:{index:true,follow:true}};
}
export function breadcrumbs(items:{name:string;path:string}[]){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:siteUrl(item.path)}))};}
