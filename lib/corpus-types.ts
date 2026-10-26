export type CorpusSource = {filename: string; doi: string; pdf_page: number};
export type CorpusPassage = {text: string; source: CorpusSource; section?: string};
export type CorpusField = CorpusPassage[] | 'NOT IN CORPUS';
export type CorpusIndexEntry = {
  id: string; filename: string; title: string; peptide: string; doi: string;
  attachment_status: 'existing peptide' | 'not yet on the site' | 'quality record';
  record_type: 'study' | 'quality';
};
export type CorpusRecord = CorpusIndexEntry & {
  citation: {title: string; doi: string; printed_heading: CorpusPassage};
  what_it_measured: CorpusField; dose: CorpusField; route: CorpusField;
  endpoint: CorpusField; reported_results: CorpusField;
  numbers: (CorpusPassage & {printed_numbers: string[]})[] | 'NOT IN CORPUS';
  notes: string[];
};
