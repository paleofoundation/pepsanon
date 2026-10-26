import {BookOpen, FileText} from 'lucide-react';
import {focusPeptides, focusStacks, focusEvidence, focusContext, type FocusPeptide, type FocusStack} from '@/lib/focus-pages';
import {corpusForPeptide} from '@/lib/corpus';
import type {CorpusSource} from '@/lib/corpus-types';
import {breadcrumbs} from '@/lib/seo';
import {StructuredData} from './structured-data';
import {SectionSidebar} from './shell';
import {PageCredits} from './authors';
import {FavoriteButton} from './account';
import {CorpusStudies} from './corpus-studies';
import {StackLinks} from './stack-links';
import {StackRail} from './stack-rail';

function PdfCitation({source}: {source: CorpusSource}) {
  return <cite className="corpus-citation">{source.filename}{' · DOI: '}{source.doi === 'NOT IN CORPUS' ? 'NOT IN CORPUS' : <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noreferrer">{source.doi}</a>}{' · PDF page '}{source.pdf_page}</cite>;
}

function MissingEvidence({name, combination = false}: {name: string; combination?: boolean}) {
  const labels = combination
    ? ['Complete-combination study', 'Combination benefits and endpoints', 'Combination safety and interactions', 'Combined dose, route and schedule']
    : ['Topic-specific study record', 'Measured benefits and endpoints', 'Safety and adverse-event findings', 'Study dose and route'];
  return <div className="focus-evidence-gap"><p><strong>{name}: NOT IN CORPUS.</strong> {combination ? 'A study of an ingredient does not establish the effect of this complete combination.' : 'The local packet does not supply a study record assigned to this exact peptide.'}</p><dl>{labels.map(label => <div key={label}><dt>{label}</dt><dd>NOT IN CORPUS</dd></div>)}</dl><p>This describes the supplied packet; it is not a claim that no research exists elsewhere.</p></div>;
}

function FocusHero({name, lead, path, stack = false, records = 0}: {name: string; lead: string; path: string; stack?: boolean; records?: number}) {
  const directory = stack ? '/stacks' : '/peptides';
  return <header className="research-hero"><div className="research-hero__wrapper">
    <div className="research-hero__left"><div className="research-hero__left-content"><p>Read the findings alongside the study population, formulation and limitations.</p><a href="/methodology">Our evidence standards</a></div></div>
    <div className="research-hero__center"><nav className="breadcrumb" aria-label="Breadcrumb"><ol className="breadcrumb__wrapper"><li className="breadcrumb__item"><a className="breadcrumb__link" href="/">Home</a></li><li className="breadcrumb__item"><a className="breadcrumb__link" href={directory}>{stack ? 'Peptide stacks' : 'Peptides'}</a></li><li className="breadcrumb__item"><span>{name}</span></li></ol></nav><div className="research-hero__center-content"><h1 className="research-hero__center-title">{name}</h1><div className="research-hero__center-text"><p>{lead}</p></div></div><div className="research-hero__categories">{stack ? 'Combination research' : 'Peptide research'}</div><nav className="research-hero__center-tags" aria-label="Jump to section">{!stack && <FavoriteButton kind="peptide" itemId={path.split('/').pop()!} title={name} hero/>}<a className="research-hero__center-tag" href="#evidence"><FileText/>Evidence</a><a className="research-hero__center-tag" href="#research"><BookOpen/>Study records</a></nav></div>
    <div className="research-hero__right"><PageCredits page={path}/><div className="research-hero__right-meta"><p>Source scope: local primary-source packet</p><p>{stack ? 'Complete-combination evidence: NOT IN CORPUS' : records ? `${records} linked study records` : 'Topic-specific evidence: NOT IN CORPUS'}</p></div></div>
  </div></header>;
}

export function FocusPeptidePage({peptide}: {peptide: FocusPeptide}) {
  const records = corpusForPeptide(peptide.id);
  const excerpts = focusEvidence[peptide.id] || [];
  const context = focusContext[peptide.id];
  const sections = [{id: 'overview', label: 'Overview'}, {id: 'evidence', label: 'Evidence in the packet'}, {id: 'forms-dosing', label: 'Dose & route'}, {id: 'safety', label: 'Safety & limitations'}, {id: 'answers', label: 'FAQs'}, {id: 'research', label: 'Study records'}, {id: 'related-stacks', label: 'Related stacks'}];
  const relatedIds = new Set(focusStacks.filter(s => s.ingredients.some(i => i.id === peptide.id)).flatMap(s => s.ingredients.map(i => i.id)));
  const related = focusPeptides.filter(p => p.id !== peptide.id && relatedIds.has(p.id)).map(p => ({href: `/peptides/${p.id}`, label: p.name}));
  return <article className="peptide-article focus-article"><StructuredData data={breadcrumbs([{name: 'Home', path: '/'}, {name: 'Peptides', path: '/peptides'}, {name: peptide.name, path: `/peptides/${peptide.id}`}])}/>
    <FocusHero name={peptide.name} path={`/peptides/${peptide.id}`} records={records.length} lead={records.length ? 'Explore the local studies, the questions they measured and their limits.' : `Evidence for ${peptide.name} in the supplied packet: NOT IN CORPUS.`}/>
    <div className="research-content"><div className="research-content__wrapper"><SectionSidebar sections={sections}/><div className="research-content__center entry-content">
      <section id="overview"><h2>Overview</h2><p>{context?.overview || `${peptide.name} has a dedicated page in the library. Topic-specific findings, study doses and endpoints are NOT IN CORPUS; they have not been supplied from vendor pages or other outside sources.`}</p>{excerpts.length > 0 && <p className="focus-source-context">Source context: {Array.from(new Map(excerpts.map(e => [e.source.filename, e.source])).values()).map(source => <PdfCitation key={source.filename} source={source}/>)}</p>}</section>
      <section id="evidence"><h2>Evidence in the packet</h2>{records.length ? <><p>The excerpts below are printed observations and study methods. Open a study record for its additional passages and citations.</p>{excerpts.map((excerpt, i) => <div className="focus-finding" key={`${excerpt.recordId}-${i}`}><h3>{excerpt.label}</h3><blockquote><p>{excerpt.text}</p><PdfCitation source={excerpt.source}/></blockquote><a className="quiet-link" href={`#${excerpt.recordId}`}>Find this study record ↓</a></div>)}</> : <MissingEvidence name={peptide.name}/>}</section>
      <section id="forms-dosing"><h2>Dose & route</h2><p>{records.length ? 'Study-specific doses and routes appear in the cited excerpts and records. They describe the experiments and are not personal dosing instructions. Where a paper does not report a value, its record says NOT IN CORPUS.' : `A study dose, route or schedule for ${peptide.name}: NOT IN CORPUS.`}</p></section>
      <section id="safety"><h2>Safety & limitations</h2><p>{context?.limit || `A topic-specific assessment of ${peptide.name} adverse events, contraindications or interactions: NOT IN CORPUS.`}</p><p>{records.length ? 'An overall safety assessment, contraindication list and validated stack regimen are NOT IN CORPUS on this page. Read the study-specific observations without extending them to a different product or population.' : 'A missing study cannot establish safety or justify a dosing recommendation.'}</p></section>
      <section id="answers"><h2>Frequently asked questions</h2><details className="research-study-details"><summary>What does this page establish about {peptide.name}?</summary><p>{records.length ? 'It makes the linked local studies and their reported methods available. Each numerical excerpt identifies its PDF, printed DOI and page. An evidence grade has not been assigned to this collection as a whole.' : `Topic-specific evidence for ${peptide.name}: NOT IN CORPUS. This page records that gap without adding unsupported benefits or dosing claims.`}</p></details><details className="research-study-details"><summary>Do the related stack pages establish a combination benefit?</summary><p>No. Related stack links identify combinations in the library. Evidence for the exact combination must come from a study that actually tested it.</p></details></section>
      <section id="research"><h2>Study records</h2>{records.length ? <CorpusStudies studies={records} heading={`${peptide.name}: local studies`}/> : <p><strong>{peptide.name}: NOT IN CORPUS.</strong></p>}<p><a href="/sources#study-records">Browse all records in the source library →</a></p></section>
      <div id="related-stacks"><StackLinks peptideId={peptide.id}/>{!relatedIds.size && <p>No combination from the requested stack list contains {peptide.name}. <a href="/stacks">Browse the stack directory.</a></p>}</div>
      <aside className="editorial-note">This page uses the supplied local packet. Missing evidence is marked NOT IN CORPUS. No independent clinical review or outcome grade is implied.</aside>
    </div><StackRail mode="peptide" ingredients={related} related={focusStacks.filter(s => s.ingredients.some(i => i.id === peptide.id)).map(s => ({href: `/stacks/${s.slug}`, label: s.name}))}/></div></div>
  </article>;
}

export function FocusStackPage({stack}: {stack: FocusStack}) {
  const sections = [{id: 'overview', label: 'Overview'}, {id: 'ingredients', label: 'Ingredients'}, {id: 'evidence', label: 'Combination evidence'}, {id: 'forms-dosing', label: 'Dose & route'}, {id: 'safety', label: 'Safety & interactions'}, {id: 'answers', label: 'FAQs'}, {id: 'research', label: 'Ingredient studies'}];
  const ingredients = stack.ingredients.map(i => ({...i, records: i.hasPage ? corpusForPeptide(i.id) : []}));
  const related = focusStacks.filter(s => s.slug !== stack.slug && s.ingredients.some(i => stack.ingredients.some(x => x.id === i.id))).slice(0, 5).map(s => ({href: `/stacks/${s.slug}`, label: s.name}));
  return <article className="peptide-article stack-article focus-article"><StructuredData data={breadcrumbs([{name: 'Home', path: '/'}, {name: 'Peptide stacks', path: '/stacks'}, {name: stack.name, path: `/stacks/${stack.slug}`}])}/>
    <FocusHero name={stack.name} path={`/stacks/${stack.slug}`} stack lead={stack.ingredients.map(i => i.name).join(' + ')}/>
    <div className="research-content"><div className="research-content__wrapper"><SectionSidebar sections={sections}/><div className="research-content__center entry-content">
      <section id="overview"><h2>Overview</h2><p>This page covers {stack.ingredients.map(i => i.name).join(' + ')} as a complete combination. A study record testing that complete combination is <strong>NOT IN CORPUS</strong>. The ingredient records below answer separate questions.</p>{stack.slug === 'semaglutide-cagrilintide' && <p>CagriSema is retained as a search label from the requested topic list. Product formulation, ratio and equivalence to a studied preparation: NOT IN CORPUS.</p>}</section>
      <section id="ingredients"><h2>Ingredients</h2><ul className="stack-ingredient-list">{ingredients.map(i => <li key={i.id} id={`ingredient-${i.id}`}><strong>{i.hasPage ? <a href={`/peptides/${i.id}`}>{i.name}</a> : i.name}</strong><span>{i.records.length ? `${i.records.length} linked ingredient study records; see the peptide page for study scope.` : `${i.name}: topic-specific study record NOT IN CORPUS.`}</span></li>)}</ul></section>
      <section id="evidence"><h2>Combination evidence</h2><MissingEvidence name={stack.name} combination/><p>No evidence grade is assigned to a combination without a corresponding study record. Ingredient counts and the presence of a vendor listing are not measures of clinical benefit.</p></section>
      <section id="forms-dosing"><h2>Dose & route</h2><p>Combined dose, mixing ratio, route, timing and treatment duration: <strong>NOT IN CORPUS</strong>. Doses reported in separate ingredient studies do not define a schedule for this stack.</p></section>
      <section id="safety"><h2>Safety & interactions</h2><p>Adverse-event rates and interaction findings for this complete combination: <strong>NOT IN CORPUS</strong>. The available ingredient records cannot quantify the risk of adding another substance.</p></section>
      <section id="answers"><h2>Frequently asked questions</h2><details className="research-study-details"><summary>Has {stack.name} been tested as a complete combination in this packet?</summary><p>A matching complete-combination study record is NOT IN CORPUS. This conclusion is limited to the supplied packet.</p></details><details className="research-study-details"><summary>What can the ingredient studies tell me?</summary><p>They report outcomes for the intervention, population and route in each paper. They cannot by themselves show that combining the ingredients improves those outcomes or is safe.</p></details></section>
      <section id="research"><h2>Ingredient studies</h2><p>These links provide ingredient-level context; they are not studies of the complete stack.</p>{ingredients.map(i => <div className="focus-ingredient-evidence" key={i.id}><h3>{i.name}</h3><p>{i.records.length ? `${i.records.length} local records are available on the ingredient page.` : 'NOT IN CORPUS'}</p>{i.hasPage && <a href={`/peptides/${i.id}#${focusPeptides.find(p => p.id === i.id)?.existing ? 'packet-studies' : 'research'}`}>Read the {i.name} page →</a>}</div>)}</section>
      <aside className="editorial-note">Evidence is limited to the local primary-source packet. The supplied market and discussion links identify topics of interest; they are not sources of clinical results.</aside>
    </div><StackRail ingredients={ingredients.map(i => ({href: i.hasPage ? `/peptides/${i.id}` : `#ingredient-${i.id}`, label: i.name}))} related={related}/></div></div>
  </article>;
}
