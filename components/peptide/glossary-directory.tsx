'use client';
import {useId, useState} from 'react';
import {Search, BookOpen} from 'lucide-react';
import {glossaryIndex, glossaryCategories, glossaryHref} from '@/lib/glossary-index';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export function GlossaryDirectory({initialQuery = ''}: {initialQuery?: string}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('All topics');
  const [letter, setLetter] = useState('All');
  const id = useId();
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matched = glossaryIndex.filter(term => (category === 'All topics' || term.category === category) && words.every(word => `${term.name} ${term.aliases.join(' ')} ${term.definition}`.toLowerCase().includes(word)));
  const availableLetters = new Set(matched.map(term => term.name[0].toUpperCase()));
  const terms = matched.filter(term => letter === 'All' || term.name[0].toUpperCase() === letter);
  function clear() {setQuery('');setCategory('All topics');setLetter('All');}
  return <>
    <div className="glossary-controls">
      <div className="glossary-search"><label htmlFor={`${id}-query`}>Find a term or abbreviation</label><div><Search size={20} aria-hidden="true"/><input id={`${id}-query`} type="search" value={query} placeholder="Try half-life, randomized, or GLP-1" onChange={event => {setQuery(event.target.value);setLetter('All');}}/></div></div>
      <div className="glossary-category"><label htmlFor={`${id}-category`}>Browse by topic</label><select id={`${id}-category`} value={category} onChange={event => {setCategory(event.target.value);setLetter('All');}}><option>All topics</option>{glossaryCategories.map(item => <option key={item}>{item}</option>)}</select></div>
    </div>
    <nav className="glossary-alphabet" aria-label="Filter glossary by first letter"><button type="button" aria-pressed={letter === 'All'} onClick={() => setLetter('All')}>All</button>{alphabet.map(item => <button key={item} type="button" aria-label={`Terms beginning with ${item}`} aria-pressed={letter === item} disabled={!availableLetters.has(item)} onClick={() => setLetter(item)}>{item}</button>)}</nav>
    <div className="glossary-result-count"><p role="status" aria-live="polite">{terms.length} {terms.length === 1 ? 'term' : 'terms'}{category !== 'All topics' ? ` in ${category.toLowerCase()}` : ''}{letter !== 'All' ? ` beginning with ${letter}` : ''}</p>{(query || category !== 'All topics' || letter !== 'All') && <button type="button" onClick={clear}>Clear filters</button>}</div>
    {terms.length ? <div className="glossary-list">{alphabet.filter(item => terms.some(term => term.name[0].toUpperCase() === item)).map(item => <section className="glossary-letter-group" key={item} aria-labelledby={`letter-${item}`}><h2 id={`letter-${item}`}>{item}</h2><div>{terms.filter(term => term.name[0].toUpperCase() === item).map(term => <article key={term.slug} className="glossary-card"><span className="glossary-topic">{term.category}</span><h3><a href={glossaryHref(term.slug)}>{term.name}</a></h3><p>{term.definition}{term.sources.map((source,index) => <sup key={source.id}><a className="glossary-citation" href={`${glossaryHref(term.slug)}#ref-${source.id}`} aria-label={`Source for ${term.name}: ${source.title}`}>[{index+1}]</a></sup>)}</p><a className="glossary-read" href={glossaryHref(term.slug)}>Read definition and research context</a></article>)}</div></section>)}</div> : <div className="glossary-empty"><BookOpen size={30} aria-hidden="true"/><h2>No matching terms</h2><p>Try an abbreviation, a shorter phrase, or a different topic.</p><button type="button" onClick={clear}>Show all terms</button></div>}
  </>;
}
