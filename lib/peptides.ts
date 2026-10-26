import {focusPeptides} from './focus-pages';
import evidence from './data/evidence.json';
export type Source = {title:string; year:number|string|null; accessedAt?:string; url:string; kind:string; pdfUrl?:string};
export type Question = {section:string;sentences:{text:string;sourceIndexes:number[]}[];id:string; peptideId:string; question:string; answer:string; grade:string; outcome:string; route:string; evidenceType:string; population:string; limitation:string; sources:Source[]};
export const questions = evidence.questions as Question[];
export const reviewedAt = '3 October 2026';
const originalPeptides = [
 {id:'bpc-157',name:'BPC-157',subtitle:'Body protection compound 157',category:'Recovery',type:'Experimental peptide',description:'Human evidence for injury recovery, route of administration, and safety.',focus:'Injury recovery',aliases:'bpc tendon oral injection'},
 {id:'tb-500',name:'TB-500',subtitle:'Thymosin beta-4–related products',category:'Recovery',type:'Experimental peptide',description:'What thymosin beta-4 studies can and cannot tell us about TB-500.',focus:'Tissue repair',aliases:'tb500 thymosin beta 4 wolverine'},
 {id:'ghk-cu',name:'GHK-Cu',subtitle:'Copper tripeptide',category:'Skin & aging',type:'Copper-binding peptide',description:'Separate evidence for topical skin products and injectable claims.',focus:'Skin outcomes',aliases:'copper skin hair injection topical'},
 {id:'cjc-1295',name:'CJC-1295',subtitle:'Growth hormone–releasing hormone analogue',category:'Hormones',type:'Experimental peptide',description:'Hormone-marker findings and the gap to meaningful health outcomes.',focus:'GH / IGF-1',aliases:'cjc1295 dac growth hormone'},
 {id:'ipamorelin',name:'Ipamorelin',subtitle:'Growth hormone secretagogue',category:'Hormones',type:'Experimental peptide',description:'Human research behind recovery, sleep, and performance questions.',focus:'Recovery & sleep',aliases:'ipa growth hormone secretagogue'},
 {id:'semaglutide',name:'Semaglutide',subtitle:'GLP-1 receptor agonist',category:'Weight management',type:'Prescription medicine',description:'Weight-loss trials and what happens after treatment is discontinued.',focus:'Weight management',aliases:'glp1 glp-1 ozempic wegovy'},
 {id:'tirzepatide',name:'Tirzepatide',subtitle:'GIP / GLP-1 receptor agonist',category:'Weight management',type:'Prescription medicine',description:'Trial results for weight reduction and maintenance after withdrawal.',focus:'Weight management',aliases:'glp1 glp-1 mounjaro zepbound'},
 {id:'collagen',name:'Collagen peptides',subtitle:'Hydrolyzed collagen',category:'Nutrition',type:'Oral supplement',description:'Study-specific evidence for joint symptoms and skin outcomes.',focus:'Joints & skin',aliases:'collagen hydrolyzed powder joint skin oral'},
];
export const peptides = focusPeptides.map(item => {
 const original = originalPeptides.find(p => p.id === item.id);
 return original ? {...original, priority: item.priority} : {
  id: item.id, name: item.name, priority: item.priority, subtitle: item.aliases || 'Local evidence and research gaps',
  category: 'Research topics', type: 'Peptide research topic', description: `Explore ${item.name} study records from the local packet, with missing evidence clearly marked.`,
  focus: 'Local evidence', aliases: item.aliases,
 };
});
export const categories=['All peptides','Recovery','Skin & aging','Hormones','Weight management','Nutrition','Research topics'];
export function forPeptide(id:string) {return questions.filter(q=>q.peptideId===id)}
// Preserve the original review records while presenting one three-level scale.
// Sparse and indirect evidence, including the former evidence-gap label, is Low.
export function gradeShort(grade:string):'High'|'Moderate'|'Low' {const g=grade.toLowerCase();return g.startsWith('high')?'High':g.startsWith('moderate')?'Moderate':'Low'}
export function gradeClass(grade:string) {return `grade-${gradeShort(grade).toLowerCase()}`}
export function gradeLevel(grade:string) {return gradeShort(grade)==='High'?3:gradeShort(grade)==='Moderate'?2:1}

// Editorial adjacency follows shared research topics; it does not imply equivalence.
export const relatedPeptideIds: Record<string, string[]> = {
 'bpc-157': ['tb-500', 'collagen'],
 'tb-500': ['bpc-157', 'collagen'],
 'ghk-cu': ['collagen'],
 'cjc-1295': ['ipamorelin'],
 'ipamorelin': ['cjc-1295'],
 'semaglutide': ['tirzepatide'],
 'tirzepatide': ['semaglutide'],
 'collagen': ['ghk-cu', 'bpc-157'],
};
