import {FavoriteButton} from '@/components/peptide/account';
import {PageCredits} from '@/components/peptide/authors';
import {notFound} from 'next/navigation';
import {peptides,forPeptide,reviewedAt} from '@/lib/peptides';
import {guideSections,guideContent} from '@/lib/guide-sections';
import {Grade} from '@/components/peptide/evidence';
import {GuideProse} from '@/components/peptide/guide-prose';
import {isSupplementalQuestion} from '@/lib/editorial-layout';
import {GuideFaq} from '@/components/peptide/guide-faq';
import {CitedText,SourceMarkers,References} from '@/components/peptide/cited-text';
import {SectionSidebar,ResearchRail} from '@/components/peptide/shell';
import {BookOpen,MessagesSquare,ChartNoAxesColumnIncreasing,FileText} from 'lucide-react';
import community from '@/lib/data/community.json';
import bpcPilot from '@/lib/data/bpc-pilot.json';
import {PilotStudies} from '@/components/peptide/pilot-studies';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=peptides.find(p=>p.id===slug);return {title:p?`${p.name}: evidence, benefits, safety, and questions`:'Peptide not found',description:p?.description}}
export default async function Page({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;const p=peptides.find(p=>p.id===slug);if(!p)notFound();
 const isPilot=p.id==='bpc-157';
 const qs=forPeptide(p.id);const content=guideContent[p.id]||{};
 const supplemental=qs.filter(isSupplementalQuestion);
 const coreQuestions=qs.filter(q=>!isSupplementalQuestion(q));
 const communityQuestions=community.questions.filter(q=>q.peptide.toLowerCase().includes(p.name.toLowerCase().replace(' peptides','')));
 const threads=Array.from(new Map(communityQuestions.flatMap(q=>q.sources).map(s=>[s.url,s])).values()).slice(0,4);
 const sources=Array.from(new Map([...(isPilot?bpcPilot.studies.map(s=>s.source):[]),...qs.flatMap(q=>q.sources),...Object.values(content).flatMap(entry=>entry.sentences.flatMap(s=>s.sources)),...threads.map(t=>({title:t.title,url:t.url,year:t.date,kind:`Community question · r/${t.community}`}))].map(s=>[s.url,s])).values());
 const sections=guideSections.map(s=>({...s,children:s.id==='research'?[...(isPilot?[{id:'reviewed-studies',label:'Primary studies reviewed'}]:[]),{id:'evidence',label:'Evidence assessments'},{id:'studies',label:'References'},{id:'community',label:'Community questions'}]:undefined}));
 return <article className="peptide-article">
 <div className="research-hero"><div className="research-hero__wrapper"><div className="research-hero__left"><div className="research-hero__left-content"><p>Our evidence assessments are specific to an outcome, population, and formulation.</p><a href="/methodology#grading">Read our grading method</a></div></div>
 <div className="research-hero__center"><nav className="breadcrumb" aria-label="Breadcrumb"><ol className="breadcrumb__wrapper"><li className="breadcrumb__item"><a className="breadcrumb__link" href="/">Home</a></li><li className="breadcrumb__item"><a className="breadcrumb__link" href="/peptides">Peptides</a></li><li className="breadcrumb__item"><span>{p.name}</span></li></ol></nav>
 <div className="research-hero__center-content"><h1 className="research-hero__center-title">{p.name}</h1><div className="research-hero__center-text"><p>Explore the evidence on benefits, safety, contraindications, and interactions. Each answer links to its sources.</p></div></div><div className="research-hero__categories">{p.category}</div><div className="research-hero__center-tags"><FavoriteButton kind="peptide" itemId={p.id} title={p.name} hero/><a className="research-hero__center-tag" href="#safety"><ChartNoAxesColumnIncreasing/>Safety</a><a className="research-hero__center-tag" href="#answers"><MessagesSquare/>FAQs</a><a className="research-hero__center-tag" href="#studies"><BookOpen/>References</a></div></div>
 <div className="research-hero__right"><PageCredits page={`/peptides/${p.id}`}/><div className="research-hero__right-meta"><div className="research-hero__right-meta-item"><p>Last checked: {reviewedAt}</p></div></div><div className="snapshot snapshot--brand"><header className="snapshot__header"><h4 className="snapshot__title">Page Snapshot</h4></header><div className="snapshot__content"><div className="snapshot__list"><div className="snapshot__list-item"><FileText className="snapshot__ico"/><a className="snapshot__link" href="#studies">{sources.length} references on this page</a></div><div className="snapshot__list-item"><MessagesSquare className="snapshot__ico"/><a className="snapshot__link" href="#overview">{qs.length+Object.keys(content).length-1} research answers</a></div></div></div></div></div></div></div>
 <div className="research-content"><div className="research-content__wrapper"><SectionSidebar sections={sections}/><div className="research-content__center entry-content">
 <section id="overview"><h2 className="wp-block-heading">Overview</h2><p className="answer-paragraph"><CitedText sentences={content.overview.sentences} references={sources}/></p></section>
 {guideSections.slice(1,9).map(section=><section key={section.id} id={section.id}><h2 className="wp-block-heading">{section.label}</h2><GuideProse questions={coreQuestions.filter(q=>q.section===section.id)} sources={sources} entry={content[section.id]} entryId={`${p.id}-${section.id}-guide`}/></section>)}
 <section id="answers"><h2 className="wp-block-heading">FAQs</h2>{supplemental.length>0?<GuideFaq questions={supplemental} sources={sources}/>:<nav aria-label="Questions answered in this guide"><ul className="faq-index">{qs.map(q=><li key={q.id}><a href={`#${q.id}`}>{q.question}</a></li>)}</ul></nav>}</section>
 <section id="research"><h2 className="wp-block-heading">Research</h2>{isPilot&&<PilotStudies sources={sources}/>}<div id="evidence"><h3>Evidence assessments</h3><p>These are our editorial assessments of the selected studies. <a href="/methodology#grading">How we grade</a>.</p><figure className="wp-block-table evidence-table"><table className="has-fixed-layout"><thead><tr><th>Outcome and study design</th><th>Our assessment</th></tr></thead><tbody>{qs.map(q=><tr key={q.id}><td><a href={`#${q.id}`}>{q.outcome}</a><span className="table-sub">{q.evidenceType.replace(/[.!?]$/,'')}.<SourceMarkers citations={q.sources} references={sources}/></span></td><td><Grade grade={q.grade}/></td></tr>)}</tbody></table></figure></div><References sources={sources}/>
 <div id="community" className="community-section"><h3>Community questions</h3><p>We use public discussions to select questions; clinical answers use research and regulatory sources.</p>{threads.map(t=><p key={t.url}>{t.title.replace(/[.!?]$/,'')}.<SourceMarkers citations={[sources.find(s=>s.url===t.url)!]} references={sources}/></p>)}</div><div className="editorial-note">Updated {reviewedAt}: {isPilot?'expanded the BPC-157 narrative using the 20-PDF pilot source set. The revised prose awaits human investigator review by Alex Leaf or Briana Theroux.':'added universal guide sections and sentence-level citations.'} This selected-source review has not undergone independent clinical peer review. Evidence grades are editorial assessments, not formal GRADE ratings. <a href="/methodology">Read the full method.</a></div></section>
 </div><ResearchRail peptideId={p.id}/></div></div></article>;
}
