import {guideContent} from './guide-sections';
import {peptides, questions} from './peptides';
import {stacks} from './stacks';
import {termsInText} from './glossary-links';

type Usage = {href: string; title: string; excerpt: string};
const usage = new Map<string, Map<string, Usage>>();
function record(page: string, title: string, anchor: string, text: string) {
  for (const slug of termsInText(text)) {
    if (!usage.has(slug)) usage.set(slug, new Map());
    if (!usage.get(slug)!.has(page)) usage.get(slug)!.set(page, {href: `${page}#${anchor}`, title, excerpt: text});
  }
}
for (const peptide of peptides) {
  for (const [section, entry] of Object.entries(guideContent[peptide.id] || {})) {
    for (const sentence of entry.sentences) record(`/peptides/${peptide.id}`, peptide.name, section, sentence.text);
  }
  for (const question of questions.filter(q => q.peptideId === peptide.id)) {
    for (const sentence of question.sentences) record(`/peptides/${peptide.id}`, peptide.name, question.id, sentence.text);
  }
}
for (const stack of stacks) {
  const sections = [{id: 'overview', paragraphs: stack.answer}, ...stack.sections, {id: 'safety', paragraphs: stack.safety}, ...stack.faqs];
  for (const section of sections) for (const paragraph of section.paragraphs) record(`/stacks/${stack.slug}`, stack.name, section.id, paragraph.text);
}
export function glossaryUsage(slug: string) { return [...(usage.get(slug)?.values() || [])]; }
export function guideGlossaryTerms(peptideId: string) {
  return [...usage.entries()].filter(([,pages]) => pages.has(`/peptides/${peptideId}`)).map(([slug]) => slug);
}
