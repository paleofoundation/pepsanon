import {notFound} from 'next/navigation';
import {getGlossaryTerm, glossarySources, glossaryUpdatedAt, termCitations, type GlossaryParagraph} from '@/lib/glossary';
import {glossaryIndex, glossaryHref} from '@/lib/glossary-index';
import {glossaryUsage} from '@/lib/glossary-usage';
import {pageMetadata, siteUrl, breadcrumbs} from '@/lib/seo';
import {StructuredData} from '@/components/peptide/structured-data';
import {GlossaryText} from '@/components/peptide/glossary-text';

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;const term = getGlossaryTerm(slug);
  return term ? pageMetadata(`${term.name}: definition and research context`,term.definition.text,glossaryHref(slug)) : {title:'Term not found',robots:{index:false}};
}
export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;const term = getGlossaryTerm(slug);if (!term) notFound();
  const citations = termCitations(term);const sourceIds = [...new Set(citations.map(citation => citation.source))];
  const related = term.related.flatMap(id => {const entry = glossaryIndex.find(item=>item.slug===id);return entry ? [entry] : [];});
  const usedIn = glossaryUsage(slug);
  function renderParagraph(paragraph: GlossaryParagraph, key?: number) {return <p key={key}><GlossaryText text={paragraph.text} exclude={slug}/>{paragraph.citations.map(citation => <sup key={`${citation.source}:${citation.locator}`}><a className="glossary-citation" href={`#ref-${citation.source}`} title={`${glossarySources[citation.source].title}; ${citation.locator}`} aria-label={`Reference ${sourceIds.indexOf(citation.source)+1}: ${glossarySources[citation.source].title}; ${citation.locator}`}>[{sourceIds.indexOf(citation.source)+1}]</a></sup>)}</p>;}
  return <article className="glossary-term-page">
    <StructuredData data={[breadcrumbs([{name:'Home',path:'/'},{name:'Glossary',path:'/glossary'},{name:term.name,path:glossaryHref(slug)}]),{'@context':'https://schema.org','@type':'DefinedTerm','@id':siteUrl(glossaryHref(slug)),url:siteUrl(glossaryHref(slug)),name:term.name,alternateName:term.aliases,description:term.definition.text,inDefinedTermSet:siteUrl('/glossary'),citation:sourceIds.map(id=>glossarySources[id].url)}]}/>
    <header className="glossary-term-header"><nav className="glossary-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/glossary">Glossary</a><span>/</span><span>{term.name}</span></nav><p className="section-kicker">{term.category}</p><h1>{term.name}</h1>{term.aliases.length>0 && <p className="glossary-aliases">Also found as: {term.aliases.join(' · ')}</p>}<div className="glossary-definition"><span>In plain language</span>{renderParagraph(term.definition)}</div><p className="glossary-date">Source check: {glossaryUpdatedAt} · <a href="/methodology">Editorial method</a></p></header>
    <div className="glossary-term-layout"><aside className="glossary-toc"><nav aria-label="On this page"><h2>On this page</h2>{term.sections.map(section=><a href={`#${section.id}`} key={section.id}>{section.title}</a>)}{usedIn.length>0 && <a href="#used-in">Used in our guides</a>}<a href="#related">Related terms</a><a href="#references">References</a></nav><a className="glossary-back" href="/glossary">Browse all {glossaryIndex.length} terms</a></aside>
    <div className="glossary-term-body">{term.sections.map(section=><section key={section.id} id={section.id}><h2>{section.title}</h2>{section.paragraphs.map((paragraph,index)=>renderParagraph(paragraph,index))}</section>)}
      {usedIn.length>0 && <section id="used-in"><h2>Used in our guides</h2><p className="glossary-section-note">Continue reading where this term appears.</p><ul className="glossary-guide-links">{usedIn.map(usage=><li key={usage.href}><a href={usage.href}>{usage.title}</a><span>Read the term in context</span></li>)}</ul></section>}
      <section id="related"><h2>Related terms</h2><div className="glossary-related">{related.map(item=><a key={item.slug} href={glossaryHref(item.slug)}>{item.name}<span>{item.category}</span></a>)}</div></section>
      <section id="references" className="glossary-references"><h2>References</h2><p className="glossary-section-note">Definitions and explanations are paraphrased. The source locations below identify the supporting passages and methods.</p><ol>{sourceIds.map(id=>{const source=glossarySources[id];return <li id={`ref-${id}`} key={id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><span>{source.kind}{source.year?` · ${source.year}`:''}</span>{source.doi && <span>DOI: <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noreferrer">{source.doi}</a></span>}<p>Source locations: {[...new Set(citations.filter(c=>c.source===id).map(c=>c.locator))].join('; ')}.</p>{source.pdfUrl && <a href={source.pdfUrl} target="_blank" rel="noreferrer">Read the paper (PDF)</a>}{source.corpusFile && <details><summary>Source packet file</summary><p>{source.corpusFile}</p></details>}</li>})}</ol></section>
      <aside className="glossary-editorial"><p>Selected-source educational glossary. This AI-assisted content has not undergone independent clinical peer review. <a href="/medical-disclaimer">Medical Disclaimer</a>.</p></aside>
    </div></div>
  </article>;
}
