import data from './data/glossary.json';
import type {Source} from './peptides';

export type GlossaryCitation = {source: string; locator: string};
export type GlossaryParagraph = {text: string; citations: GlossaryCitation[]};
export type GlossaryTerm = {
  slug: string; name: string; aliases: string[]; category: string; related: string[];
  definition: GlossaryParagraph;
  sections: {id: string; title: string; paragraphs: GlossaryParagraph[]}[];
};
export const glossaryTerms: GlossaryTerm[] = data.terms;
export const glossarySources: Record<string, Source & {doi?: string; corpusFile?: string}> = data.sources;
export const glossaryUpdatedAt = data.updatedAt;
export function getGlossaryTerm(slug: string) { return glossaryTerms.find(term => term.slug === slug); }
export function termCitations(term: GlossaryTerm) {
  return [term.definition, ...term.sections.flatMap(section => section.paragraphs)].flatMap(paragraph => paragraph.citations);
}
