import index from './data/glossary-index.json';

export const glossaryIndex = index;
export type GlossaryIndexEntry = (typeof glossaryIndex)[number];
export const glossaryCategories = ['Peptide basics', 'Mechanisms & hormones', 'Drug behavior & delivery', 'Reading studies', 'Safety & quality'];
export const glossaryHref = (slug: string) => `/glossary/${slug}`;
