import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';

const {terms,sources}=JSON.parse(fs.readFileSync('lib/data/glossary.json','utf8'));
const index=JSON.parse(fs.readFileSync('lib/data/glossary-index.json','utf8'));
const slugs=new Set(terms.map(term=>term.slug));
assert.equal(slugs.size,terms.length,'Duplicate glossary slug');
assert.deepEqual(index.map(term=>term.slug),terms.map(term=>term.slug),'Regenerate the glossary index');
let paragraphCount=0;
for(const term of terms){
  assert.match(term.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(term.sections.length>=2,`Missing explanation: ${term.slug}`);
  assert.ok(term.related.length>=2,`Missing related terms: ${term.slug}`);
  for(const slug of term.related){assert.ok(slugs.has(slug),`Broken related term: ${term.slug} -> ${slug}`);assert.notEqual(slug,term.slug);}
  for(const paragraph of [term.definition,...term.sections.flatMap(section=>section.paragraphs)]){
    assert.ok(paragraph.text && paragraph.citations.length,`Uncited paragraph: ${term.slug}`);
    for(const citation of paragraph.citations){assert.ok(sources[citation.source]?.title,`Unknown source: ${term.slug}`);assert.match(sources[citation.source].url,/^https:\/\//);assert.ok(citation.locator,`Missing source location: ${term.slug}`);}
    paragraphCount++;
  }
  assert.equal(index.find(item=>item.slug===term.slug).definition,term.definition.text,`Stale definition: ${term.slug}`);
}
// Exercise the real matcher without importing framework-only aliases into Node.
const compiled=ts.transpileModule(fs.readFileSync('lib/glossary-links.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};
vm.runInNewContext(compiled,{exports,require:()=>({glossaryIndex:index})});
const segments=exports.glossarySegments;
const matched=text=>Array.from(segments(text,{limit:Infinity}),segment=>segment.slug).filter(Boolean);
assert.equal(matched('peptidectomy collagenase').length,0,'Must not link word fragments');
assert.deepEqual(matched('growth hormone secretagogue'),['growth-hormone-secretagogue'],'Longest phrase wins');
assert.deepEqual(matched('GLP‑1 and half–life'),['glp-1','half-life'],'Unicode hyphens');
assert.deepEqual(matched('receptors and peptides'),['receptor','peptide'],'Plural aliases');
assert.equal(matched('Peptide peptide PEPTIDE').length,1,'One link per term per block');
assert.equal(segments('peptide',{exclude:'peptide'}).some(segment=>segment.slug),false,'No self-links');
assert.equal(matched('Im not GHrelin; GH and IV.').length,2,'Acronym boundaries and case');
const prose='An oral peptide changes growth hormone, pharmacokinetics, half-life, purity and sterility.';
assert.equal(segments(prose).map(segment=>segment.text).join(''),prose,'Linking preserves prose verbatim');
assert.equal(segments(prose).filter(segment=>segment.slug).length,5,'Bound link density');
const seen=new Set();segments('oral peptide',{seen});assert.equal(segments('oral peptide',{seen}).some(segment=>segment.slug),false,'Share deduplication across sentences');

const guides=JSON.parse(fs.readFileSync('lib/data/guide-sections.json','utf8'));
const questions=JSON.parse(fs.readFileSync('lib/data/evidence.json','utf8')).questions;
const rows=terms.map(term=>({slug:term.slug,name:term.name,mentions:0,guides:[]}));
for(const [id,sections] of Object.entries(guides)){
  const paragraphs=[...Object.values(sections).flatMap(section=>section.sentences.map(sentence=>sentence.text)),...questions.filter(question=>question.peptideId===id).flatMap(question=>question.sentences.map(sentence=>sentence.text))];
  for(const text of paragraphs)for(const slug of matched(text)){const row=rows.find(row=>row.slug===slug);row.mentions++;if(!row.guides.includes(id))row.guides.push(id);}
}
fs.mkdirSync('research/glossary',{recursive:true});
fs.writeFileSync('research/glossary/term-audit.json',JSON.stringify({method:'Counts are prose blocks mentioning each term or alias, once per block, in authored guide sections and question answers. Excludes reference titles, navigation, metadata, and the glossary itself.',terms:rows.sort((a,b)=>b.mentions-a.mentions)},null,2)+'\n');
console.log(`Glossary checks passed: ${terms.length} routes, ${paragraphCount} cited paragraphs, ${Object.keys(sources).length} references; aliases, boundaries, deduplication, text preservation, related links and index consistency verified.`);
