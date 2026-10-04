import content from './data/guide-sections.json';
import type {CitedSentence} from '@/components/peptide/cited-text';
export const guideSections=[
 {id:'overview',label:'Overview'},
 {id:'benefits',label:'Benefits'},
 {id:'safety',label:'Safety'},
 {id:'contraindications',label:'Contraindications'},
 {id:'interactions',label:'Interactions'},
 {id:'forms-dosing',label:'Forms & dosing'},
 {id:'results-stopping',label:'Results & stopping'},
 {id:'product-quality',label:'Product quality'},
 {id:'status',label:'Status'},
 {id:'answers',label:'FAQs'},
 {id:'evidence',label:'Evidence'},
 {id:'research',label:'Research'},
];
export type GuideEntry={question:string;sentences:CitedSentence[]};
export const guideContent=content as Record<string,Record<string,GuideEntry>>;

export const guideQuestions=Object.entries(guideContent).flatMap(([peptideId,entries])=>Object.entries(entries).filter(([section])=>section!=='overview').map(([section,entry])=>({...entry,peptideId,section,id:`${peptideId}-${section}-guide`,answer:entry.sentences.map(s=>s.text).join(' ')})));
