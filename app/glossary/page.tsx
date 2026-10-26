import {GlossaryDirectory} from '@/components/peptide/glossary-directory';
import {StructuredData} from '@/components/peptide/structured-data';
import {glossaryIndex, glossaryHref} from '@/lib/glossary-index';
import {pageMetadata, siteUrl, breadcrumbs} from '@/lib/seo';

export const metadata = pageMetadata('Peptide glossary: definitions, study terms, and research context', 'Explore peptide terminology, study designs, delivery routes, and product-quality terms with cited definitions and links to the research guides.', '/glossary');
export default async function Page({searchParams}: {searchParams: Promise<{q?: string}>}) {
  const params = await searchParams;
  return <article className="glossary-page">
    <StructuredData data={[breadcrumbs([{name:'Home',path:'/'},{name:'Glossary',path:'/glossary'}]), {'@context':'https://schema.org','@type':'DefinedTermSet','@id':siteUrl('/glossary'),name:'Peptides Anonymous glossary',url:siteUrl('/glossary'),hasDefinedTerm:glossaryIndex.map(term => ({'@type':'DefinedTerm',name:term.name,url:siteUrl(glossaryHref(term.slug)),description:term.definition,citation:term.sources.map(source=>source.url)}))}]}/>
    <header className="glossary-header"><nav className="glossary-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Glossary</span></nav><p className="section-kicker">THE LANGUAGE OF PEPTIDE RESEARCH</p><h1>Peptide glossary</h1><p>Start with a word. Follow it into the research.</p><div className="glossary-intro">Explore {glossaryIndex.length} terms with plain-language definitions, cited research context, and related concepts.</div></header>
    <div className="glossary-start"><strong>New to peptides?</strong><nav aria-label="Start with these glossary terms">{['peptide','randomized-controlled-trial','half-life','purity'].map(slug => <a key={slug} href={glossaryHref(slug)}>{glossaryIndex.find(term => term.slug===slug)?.name}</a>)}</nav></div>
    <GlossaryDirectory initialQuery={typeof params.q === 'string' ? params.q : ''}/>
    <aside className="glossary-editorial"><strong>About these definitions</strong><p>These are plain-language paraphrases of terminology and methods in the cited papers, with a primary agency definition where identified. Each entry links to its sources and the relevant sections. <a href="/methodology">Read our editorial method.</a></p></aside>
  </article>;
}
