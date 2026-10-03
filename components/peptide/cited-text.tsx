import type {Source} from '@/lib/peptides';
import {Citation} from './citations';
export type CitedSentence = {text:string;sources:Source[]};
export function SourceMarkers({citations,references}:{citations:Source[];references:Source[]}) {
 return <>{citations.map(source=>{const index=references.findIndex(s=>s.url===source.url)+1;if(!index)throw new Error(`Missing reference: ${source.url}`);return <Citation key={source.url} source={source} index={index} href={`#ref-${index}`}/>;})}</>;
}
export function CitedText({sentences,references}:{sentences:CitedSentence[];references:Source[]}) {
 return <>{sentences.map((sentence,i)=>{const split=sentence.text.lastIndexOf(' ');return <span key={i}>{i>0?' ':''}{sentence.text.slice(0,split+1)}<span className="citation-tail">{sentence.text.slice(split+1)}<SourceMarkers citations={sentence.sources} references={references}/></span></span>})}</>;
}
export function References({sources}:{sources:Source[]}) {
 return <section id="studies" className="source-section"><h3 className="wp-block-heading">References</h3><ol className="rgbc-references">{sources.map((s,i)=><li className="rgbc-references__item" id={`ref-${i+1}`} key={s.url}><a className="rgbc-references__link" href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span>({s.year||`Accessed ${s.accessedAt||'2026-10-03'}`})</span><span className="source-kind">{s.kind}</span></li>)}</ol></section>;
}
