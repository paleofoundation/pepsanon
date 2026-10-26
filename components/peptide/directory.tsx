'use client';
import {useState} from 'react';
import {Search,X} from 'lucide-react';
import {peptides,categories,questions} from '@/lib/peptides';
import {corpusForPeptide} from '@/lib/corpus';
import {EvidenceExplainer} from './evidence';
import {FavoriteButton} from './account';

export function Directory(){
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('All peptides');
 const [order,setOrder]=useState('priority');
 const results=peptides.filter(p=>(category==='All peptides'||p.category===category)&&`${p.name} ${p.subtitle} ${p.description} ${p.aliases}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>order==='priority'?a.priority-b.priority:a.name.localeCompare(b.name));
 const letters=[...new Set(results.map(p=>p.name[0]))];
 function entry(p:(typeof peptides)[number]){
  const count=corpusForPeptide(p.id).length;
  return <div><a className="rgbc-archive__link" href={`/peptides/${p.id}`}>{p.name}</a><p>{p.subtitle}</p><p className="focus-packet-status">{count?`${count} local study records`:'Topic-specific study record: NOT IN CORPUS'}</p><FavoriteButton kind="peptide" itemId={p.id} title={p.name}/></div>;
 }
 return <><div className="directory-intro"><h1>Peptides</h1><p>Find every peptide in the research library. Each page shows its available local studies or identifies the evidence missing from the packet.</p></div>
 <div className="search-field"><Search size={21}/><input aria-label="Search peptides" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a peptide or research topic"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={18}/></button>}</div>
 <div className="filters" aria-label="Filter by topic">{categories.map(c=><button className={c===category?'active':''} key={c} onClick={()=>setCategory(c)} aria-pressed={c===category}>{c}</button>)}</div>
 <div className="directory-order"><label htmlFor="peptide-order">Order</label><select id="peptide-order" value={order} onChange={e=>setOrder(e.target.value)}><option value="priority">Priority</option><option value="alphabetical">A–Z</option></select><p className="result-count" aria-live="polite">{results.length} {results.length===1?'peptide':'peptides'}{query&&` matching “${query}”`}</p></div>
 {order==='alphabetical'&&<div className="rgbc-archive__letters">{letters.map(l=><a key={l} href={`#letter-${l}`} className="rgbc-archive__item">{l}</a>)}</div>}
 <section className="peptide-archive" aria-label="Peptide directory">{order==='priority'?results.map(p=><div className="focus-directory-row" key={p.id}><span aria-label={`Priority ${p.priority}`}>{String(p.priority).padStart(2,'0')}</span>{entry(p)}</div>):letters.map(l=><div className="archive-letter-group" id={`letter-${l}`} key={l}><div className="rgbc-archive__header"><span className="rgbc-archive__letter">{l}</span></div><div className="archive-links">{results.filter(p=>p.name[0]===l).map(p=><div key={p.id}>{entry(p)}</div>)}</div></div>)}</section>
 {!results.length&&<div className="empty-state"><p>No peptides match this search.</p><button onClick={()=>{setQuery('');setCategory('All peptides')}}>Reset filters</button></div>}
 <EvidenceExplainer/><section className="questions-preview"><h2>Questions & answers</h2><p>Questions raised in public discussions, with source-linked answers.</p>{questions.slice(0,4).map(q=><div className="preview-question" key={q.id}><a href={`/peptides/${q.peptideId}#${q.id}`}>{q.question}</a></div>)}<a className="text-link" href="/questions">See all questions</a></section></>;
}
