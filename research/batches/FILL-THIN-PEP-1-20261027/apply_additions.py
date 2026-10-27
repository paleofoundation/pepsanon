from pathlib import Path
import json,subprocess
P=Path(__file__).resolve().parent;R=P.parents[2];B='8bb517ed61b0f01927186fefddf532e0887060da';j=json.loads(subprocess.check_output(['git','-C',str(R),'show',B+':lib/data/glossary.json'],text=True));additions=json.loads((P/'ADDITIONS-v2.json').read_text())['records'];selection=json.loads((P/'SELECTION-v3-GRANTED.json').read_text())['final10Slugs'];assert set(a['slug'] for a in additions)==set(selection)
for a in additions:
 assert len(a['citations']) and all(c['source'] in j['sources'] and c['locator'] for c in a['citations']);t=next(t for t in j['terms'] if t['slug']==a['slug']);section=next(s for s in t['sections'] if s['id']==a['sectionId']);section['paragraphs'].append({'text':a['text'],'citations':a['citations']})
def punctuation(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punctuation(v) for v in x]
 if isinstance(x,dict):return {k:punctuation(v) for k,v in x.items()}
 return x
j['terms']=[punctuation(t) if t['slug'] in selection else t for t in j['terms']]
(R/'lib/data/glossary.json').write_text(json.dumps(j,indent=2,ensure_ascii=False)+'\n');print('Applied70 cited single-sentence paragraphs to exact10 existing glossary terms; all other records from fixedbase')
