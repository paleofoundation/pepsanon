from pathlib import Path
import json,subprocess,hashlib
P=Path(__file__).resolve().parent;R=P.parents[2];B='f0a8fb65455f5205e7a4e53acf240bb041236cca';D=json.loads(subprocess.check_output(['git','-C',str(R),'show',B+':lib/data/glossary.json'],text=True));selection=json.loads((P/'SELECTION.json').read_text());candidate=json.loads((P/'ADDITIONS-v1-UNAPPLIED.json').read_text());selected=set(selection['slugs']);assert candidate['base']==B and {r['slug'] for r in candidate['records']}==selected
changes=[]
def punct(x,path):
 if isinstance(x,str):
  y=x.replace('\u2013','-').replace('\u2014','-')
  if x!=y:assert path.endswith('/locator');changes.append({'path':path,'before':x,'after':y})
  return y
 if isinstance(x,list):return [punct(v,path+'/'+str(i)) for i,v in enumerate(x)]
 if isinstance(x,dict):return {k:punct(v,path+'/'+k) for k,v in x.items()}
 return x
for i,t in enumerate(D['terms']):
 if t['slug'] not in selected:continue
 t=punct(t,'/terms/'+str(i));D['terms'][i]=t
 for sec in t['sections']:sec['paragraphs'] += [{'text':r['text'],'citations':r['citations']} for r in candidate['records'] if r['slug']==t['slug'] and r['sectionId']==sec['id']]
(R/'lib/data/glossary.json').write_text(json.dumps(D,ensure_ascii=False,indent=2)+'\n');(P/'APPLIED-NORMALIZATIONS.json').write_text(json.dumps({'selectedLocatorOnly':changes,'count':len(changes)},indent=2)+'\n');print(json.dumps({'candidateSha256':hashlib.sha256((P/'ADDITIONS-v1-UNAPPLIED.json').read_bytes()).hexdigest(),'paragraphs':len(candidate['records']),'dataSha256':hashlib.sha256((R/'lib/data/glossary.json').read_bytes()).hexdigest(),'selectedLocatorNormalizations':changes},indent=2))
