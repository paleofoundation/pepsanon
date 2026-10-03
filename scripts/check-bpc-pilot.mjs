import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const pilot=read('lib/data/bpc-pilot.json');
const manifest=read('research/bpc-157/pilot-manifest.json');
const evidence=read('lib/data/evidence.json');
const claims=read('research/bpc-157/claim-map.json').claims;
assert.equal(pilot.studies.length,20);
assert.equal(manifest.records.length,20);
assert.equal(new Set(manifest.records.map(r=>r.sha256)).size,20);
assert.equal(new Set(manifest.records.map(r=>r.canonicalId)).size,20);
assert.equal(manifest.records.reduce((n,r)=>n+r.pages,0),321);
assert.equal(manifest.records.filter(r=>r.species==='Human').length,4);
assert.equal(manifest.records.filter(r=>r.publicationStatus.includes('Preprint')).length,1);
const sourceUrls=new Set(pilot.studies.map(s=>s.source.url));
for(const record of manifest.records){
  assert(record.primaryResearch && record.pdfMagicVerified);
  assert.match(record.sha256,/^[a-f0-9]{64}$/);
  assert(record.pages>0 && record.bytes>1000);
  assert(record.findings.length>0);
  for(const finding of record.findings)assert(finding.pdfPage>=1 && finding.pdfPage<=record.pages);
  assert(sourceUrls.has(record.sourceURL));
}
for(const study of pilot.studies){
  assert(study.sentences.length>0);
  for(const sentence of study.sentences)assert.match(sentence,/[.!?]$/);
}
for(const q of evidence.questions.filter(q=>q.peptideId==='bpc-157')){
  for(const [index,sentence]of q.sentences.entries()){
    const mapping=claims.find(c=>c.id===`${q.id}:${index+1}`);
    assert.equal(mapping?.text,sentence.text);
    assert.deepEqual(mapping.sourceUrls,sentence.sourceIndexes.map(i=>q.sources[i].url));
  }
}
assert.equal(pilot.studies.find(s=>s.id==='a7').hold,true);
assert.equal(evidence.questions.find(q=>q.id==='bpc-157-gut-health').grade,'Very low');
console.log('BPC pilot integrity passed: 20 distinct PDF records, 321 pages, 4 human reports, 1 preprint; source mappings and held claims preserved. This check does not replace scientific review.');
