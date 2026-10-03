import type {Question} from './peptides';
// Prose is the default for every guide. Supplemental questions are curated,
// never chosen by array position or collapsed merely to shorten a page.
const supplementalQuestionIds=new Set([
 'bpc-157-observational-evidence',
 'bpc-157-growth-hormone',
 'bpc-157-tb500-combination',
 'bpc-157-half-life',
]);
export const isSupplementalQuestion=(question:Question)=>supplementalQuestionIds.has(question.id);
