import fs from 'node:fs';
const evidence=JSON.parse(fs.readFileSync('lib/data/evidence.json','utf8'));
const guides=JSON.parse(fs.readFileSync('lib/data/guide-sections.json','utf8'));
const ids=['bpc-157','tb-500','ghk-cu','cjc-1295','ipamorelin','semaglutide','tirzepatide','collagen'];
const required=['safety','contraindications','interactions','forms-dosing','results-stopping','product-quality','status'];
let sentences=0;
function check(text,sources,context){if(!/[.!?]$/.test(text))throw new Error(`Sentence punctuation missing: ${context}`);if(!sources?.length)throw new Error(`Uncited sentence: ${context}`);for(const s of sources)if(!s?.title||!/^https:\/\//.test(s.url))throw new Error(`Invalid source: ${context}`);sentences++;}
for(const q of evidence.questions){if(!q.sentences?.length)throw new Error(`Missing sentence sources: ${q.id}`);for(const s of q.sentences)check(s.text,s.sourceIndexes.map(i=>q.sources[i]),q.id);if(q.answer!==q.sentences.map(s=>s.text).join(' '))throw new Error(`Search copy differs from cited answer: ${q.id}`);}
for(const id of ids){for(const section of required){if(!guides[id]?.[section]?.sentences?.length)throw new Error(`Empty guide section: ${id}/${section}`);}for(const [section,entry]of Object.entries(guides[id]))for(const s of entry.sentences)check(s.text,s.sources,`${id}/${section}`);}
console.log(`Citation integrity passed: ${ids.length} guides, ${sentences} sourced sentences; required sections complete.`);
