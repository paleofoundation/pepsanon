import index from './data/corpus-index.json';
import links from './data/corpus-page-links.json';
import type {CorpusIndexEntry} from './corpus-types';
const pageLinks=links as Record<string,string[]>;
export const corpusStudies = (index as CorpusIndexEntry[]).map(record=>({...record,attachment_status:pageLinks[record.id]?.length?'existing peptide' as const:record.attachment_status}));
export function corpusForPeptide(topic:string){return corpusStudies.filter(record=>pageLinks[record.id]?.includes(topic));}
export function corpusPagesForRecord(id:string){return pageLinks[id]||[];}
export function unassignedCorpusForTopic(topic:string){return corpusStudies.filter(record=>record.peptide===topic&&!pageLinks[record.id]?.length&&record.record_type!=='quality');}
export const additionalCorpusTopics=Array.from(new Set(corpusStudies.filter(record=>!pageLinks[record.id]?.length&&record.record_type!=='quality').map(record=>record.peptide)));
export const qualityRecords=corpusStudies.filter(record=>record.record_type==='quality');
