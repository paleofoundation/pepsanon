import {questions,peptides,type Source} from './peptides';
import {guideContent,guideQuestions} from './guide-sections';
import {stacks,stackReferences} from './stacks';
import bpcPilot from './data/bpc-pilot.json';
const guideSources=Object.values(guideContent).flatMap(entries=>Object.values(entries).flatMap(entry=>entry.sentences.flatMap(sentence=>sentence.sources)));

// The canonical source URL is the durable favorite key. The hash is only an HTML anchor.
export function sourceAnchor(url:string) {
  let hash=2166136261;
  for (const character of url) hash=Math.imul(hash^character.charCodeAt(0),16777619);
  return `study-${(hash>>>0).toString(16)}`;
}
export const studies=Array.from(new Map([...stacks.flatMap(stackReferences).filter(source=>!source.kind.startsWith('Commercial description')),...questions.flatMap(q=>q.sources),...guideSources,...bpcPilot.studies.map(s=>s.source as Source)].map(s=>[s.url,s])).values()).map(source=>({
  ...source,
  id:source.url,
  href:`/sources#${sourceAnchor(source.url)}`,
  peptideIds:peptides.filter(p=>(p.id==='bpc-157'&&bpcPilot.studies.some(s=>s.source.url===source.url))||questions.some(q=>q.peptideId===p.id&&q.sources.some(s=>s.url===source.url))||Object.values(guideContent[p.id]||{}).some(entry=>entry.sentences.some(sentence=>sentence.sources.some(s=>s.url===source.url)))).map(p=>p.id),
}));
export function studyHref(source:Source) {return `/sources#${sourceAnchor(source.url)}`;}
export type SearchItem={kind:'peptide'|'study'|'question'|'stack';id:string;title:string;description:string;href:string;meta:string};
export const searchItems:SearchItem[]=[
  ...stacks.map(stack=>({kind:'stack' as const,id:stack.slug,title:stack.name,description:`${stack.description} ${stack.aliases}`,href:`/stacks/${stack.slug}`,meta:'Peptide stack guide'})),
  ...stacks.flatMap(stack=>stack.faqs.map(faq=>({kind:'question' as const,id:`${stack.slug}-${faq.id}`,title:faq.question,description:faq.paragraphs.map(p=>p.text).join(' '),href:`/stacks/${stack.slug}#${faq.id}`,meta:stack.name}))),
  ...peptides.map(p=>({kind:'peptide' as const,id:p.id,title:p.name,description:`${p.subtitle}. ${p.description} ${p.aliases}`,href:`/peptides/${p.id}`,meta:p.category})),
  ...studies.map(s=>({kind:'study' as const,id:s.id,title:s.title,description:`${s.kind} ${s.peptideIds.map(id=>peptides.find(p=>p.id===id)?.name).join(' ')}`,href:s.href,meta:`${s.kind}${s.year?` · ${s.year}`:''}`})),
  ...[...questions,...guideQuestions.map(q=>({...q,outcome:q.section}))].map(q=>({kind:'question' as const,id:q.id,title:q.question,description:`${q.outcome} ${q.answer}`,href:`/peptides/${q.peptideId}#${q.id}`,meta:peptides.find(p=>p.id===q.peptideId)?.name||''})),
];
export function searchLibrary(query:string) {
  const words=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [];
  return searchItems.filter(item=>words.every(word=>`${item.title} ${item.description} ${item.meta}`.toLocaleLowerCase().includes(word)))
    .sort((a,b)=>Number(b.title.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()))-Number(a.title.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())));
}
