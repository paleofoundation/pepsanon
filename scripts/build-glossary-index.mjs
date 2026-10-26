import fs from 'node:fs';
const {terms,sources}=JSON.parse(fs.readFileSync('lib/data/glossary.json','utf8'));
const index=terms.map(({slug,name,aliases,category,definition})=>({slug,name,aliases,category,definition:definition.text,sources:definition.citations.map(({source})=>({id:source,title:sources[source].title,url:sources[source].url}))}));
fs.writeFileSync('lib/data/glossary-index.json',JSON.stringify(index,null,2)+'\n');
console.log(`Built glossary index: ${index.length} terms.`);
