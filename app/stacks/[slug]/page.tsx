import {focusStacks} from '@/lib/focus-pages';
import {FocusStackPage} from '@/components/peptide/focus-pages';
import {notFound} from 'next/navigation';
import {stacks, stackReferences, stackCheckedDate, type StackParagraph} from '@/lib/stacks';
import {stackContentSections, stackGuideSections} from '@/lib/stack-sections';
import {pageMetadata, siteUrl, breadcrumbs} from '@/lib/seo';
import {StructuredData} from '@/components/peptide/structured-data';
import {CitedText, References} from '@/components/peptide/cited-text';
import {EvidenceTable} from '@/components/peptide/evidence-table';
import {GuideFaq} from '@/components/peptide/guide-faq';
import {SectionSidebar} from '@/components/peptide/shell';
import {StackRail} from '@/components/peptide/stack-rail';
import {BookOpen, MessagesSquare, ChartNoAxesColumnIncreasing, ShieldCheck, FileText} from 'lucide-react';

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const stack = stacks.find(item => item.slug === slug);
  return stack ? pageMetadata(stack.title, stack.description, `/stacks/${slug}`) : {title: 'Stack not found', robots: {index: false}};
}

export default async function Page({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const stack = stacks.find(item => item.slug === slug);
  if (!stack) notFound();
  const focus=focusStacks.find(item=>item.slug===slug);
  if(focus && !focus.existing) return <FocusStackPage stack={focus}/>;
  const references = stackReferences(stack);
  const paragraphs = (items: StackParagraph[]) => items.map((item, i) => <p className="answer-paragraph" key={i}><CitedText sentences={[item]} references={references}/></p>);
  const faqs = stack.faqs.map(faq => ({id: faq.id, question: faq.question, sentences: faq.paragraphs}));
  const url = siteUrl(`/stacks/${slug}`);
  const formula = stack.ingredients.map(item => item.name).join(' + ');
  const related = stacks.filter(item => stack.related.includes(item.slug)).map(item => ({href: `/stacks/${item.slug}`, label: item.name, detail: item.ingredients.map(ingredient => ingredient.name).join(' + ')}));
  const ingredients = stack.ingredients.map(item => ({href: item.peptideId ? `/peptides/${item.peptideId}` : '#kpv', label: item.name, detail: item.note}));

  return <article className="peptide-article stack-article">
    <StructuredData data={[
      breadcrumbs([{name: 'Home', path: '/'}, {name: 'Peptide stacks', path: '/stacks'}, {name: stack.name, path: `/stacks/${slug}`}]),
      {'@context': 'https://schema.org', '@type': 'Article', '@id': `${url}#article`, headline: stack.title, description: stack.description, datePublished: stackCheckedDate, dateModified: stackCheckedDate, inLanguage: 'en', mainEntityOfPage: url, author: {'@type': 'Organization', name: 'Peptides Anonymous', url: siteUrl('/methodology')}, publisher: {'@type': 'Organization', name: 'Peptides Anonymous', url: siteUrl('/')}, citation: references.map(source => source.url), about: stack.ingredients.map(ingredient => ({'@type': 'Thing', name: ingredient.name, ...(ingredient.peptideId ? {url: siteUrl(`/peptides/${ingredient.peptideId}`)} : {})}))},
      {'@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${url}#answers`, mainEntity: stack.faqs.map(faq => ({'@type': 'Question', name: faq.question, acceptedAnswer: {'@type': 'Answer', text: faq.paragraphs.map(item => item.text).join(' ')}}))},
    ]}/>
    <header className="research-hero"><div className="research-hero__wrapper">
      <div className="research-hero__left"><div className="research-hero__left-content"><p>Our evidence assessments are specific to a combination, outcome, population, and formulation.</p><a href="/methodology#grading">Read our grading method</a></div></div>
      <div className="research-hero__center">
        <nav className="breadcrumb" aria-label="Breadcrumb"><ol className="breadcrumb__wrapper"><li className="breadcrumb__item"><a className="breadcrumb__link" href="/">Home</a></li><li className="breadcrumb__item"><a className="breadcrumb__link" href="/stacks">Peptide stacks</a></li><li className="breadcrumb__item"><span>{stack.name}</span></li></ol></nav>
        <div className="research-hero__center-content"><h1 className="research-hero__center-title">{stack.name}</h1><div className="research-hero__center-text"><p>{formula}</p></div></div>
        <div className="research-hero__categories">Peptide stack</div>
        <nav className="research-hero__center-tags" aria-label="Jump to section"><a className="research-hero__center-tag" href="#safety"><ShieldCheck/>Safety</a><a className="research-hero__center-tag" href="#answers"><MessagesSquare/>FAQs</a><a className="research-hero__center-tag" href="#evidence"><ChartNoAxesColumnIncreasing/>Evidence Assessments</a><a className="research-hero__center-tag" href="#studies"><BookOpen/>References</a></nav>
      </div>
      <div className="research-hero__right">
        <div className="stack-credits"><span>By Peptides Anonymous</span><a href="/methodology">Editorial method</a></div>
        <div className="research-hero__right-meta"><div className="research-hero__right-meta-item"><p>Last checked: 4 October 2026</p></div></div>
        <div className="snapshot snapshot--brand"><header className="snapshot__header"><h4 className="snapshot__title">Page Snapshot</h4></header><div className="snapshot__content"><div className="snapshot__list"><div className="snapshot__list-item"><FileText className="snapshot__ico"/><a className="snapshot__link" href="#studies">{references.length} references on this page</a></div><div className="snapshot__list-item"><MessagesSquare className="snapshot__ico"/><a className="snapshot__link" href="#answers">{stack.faqs.length} frequently asked questions</a></div></div></div></div>
      </div>
    </div></header>
    <div className="research-content"><div className="research-content__wrapper">
      <SectionSidebar sections={stackGuideSections}/>
      <div className="research-content__center entry-content">
        <section id="overview"><h2 className="wp-block-heading">Overview</h2><p className="answer-paragraph"><CitedText sentences={stack.answer} references={references}/></p></section>
        {stackContentSections.map(group => <section id={group.id} key={group.id}>
          <h2 className="wp-block-heading">{group.label}</h2>
          {group.id === 'ingredients' && <ul className="stack-ingredient-list">{ingredients.map(ingredient => <li key={ingredient.label}><strong><a href={ingredient.href}>{ingredient.label}</a></strong><span>{ingredient.detail}</span></li>)}</ul>}
          <div className="guide-prose">
            {group.id === 'safety' ? <>{paragraphs(stack.safety)}<p>When assessing interactions, look for research on the complete combination, its route, and any other substances taken alongside it. The evidence assessments below identify which combinations and formulations were actually studied.</p><p><a href="/medical-disclaimer">Read the Medical Disclaimer.</a></p></> : stack.sections.filter(section => section.group === group.id).map(section => <div className="section-answer" key={section.id} id={section.id}><h3>{section.title}</h3>{paragraphs(section.paragraphs)}</div>)}
          </div>
        </section>)}
        <section id="answers"><h2 className="wp-block-heading">FAQs</h2><GuideFaq questions={[]} sources={references} entries={faqs}/></section>
        <section id="evidence"><h2 className="wp-block-heading">Evidence assessments</h2><p>Grades describe confidence in the specific outcome below. Open an outcome or study count for the sources, population, formulation, and limitations. <a href="/methodology#grading">How we grade evidence.</a></p><EvidenceTable questions={stack.assessments} references={references}/></section>
        <References sources={references} headingLevel={2}/>
        <aside className="editorial-note"><strong>Scope of this review</strong><p>Selected primary studies and FDA materials checked 4 October 2026. Searches included the stack names, ingredient pairs, combination, trial, safety, and the outcomes discussed. Commercial material is cited only to explain naming, not as evidence of effectiveness. This AI-assisted review is not systematic and has not undergone independent clinical peer review. Absence claims apply to the sources discussed here. <a href="/methodology">Read our standards.</a></p></aside>
      </div>
      <StackRail ingredients={ingredients} related={related}/>
    </div></div>
  </article>;
}
