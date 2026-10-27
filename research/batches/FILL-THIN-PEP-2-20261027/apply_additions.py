from pathlib import Path
import argparse,json,subprocess,re
P=Path(__file__).resolve().parent;R=P.parents[2];B='778e0fbdecd3db50ed229012d8987eb768b33a2b'
a=argparse.ArgumentParser();a.add_argument('--candidate',required=True);a.add_argument('--selection',default='SELECTION-GRANTED.json');o=a.parse_args();grant=json.loads((P/o.selection).read_text());assert grant['state']=='AUTHORIZED_EXACT_SELECTION' and grant['base']==B;selected=set(grant['finalSlugs']);candidate=json.loads((P/o.candidate).read_text());rows=candidate['records'];assert {r['slug'] for r in rows}==selected
text=subprocess.check_output(['git','-C',str(R),'show',B+':lib/data/glossary.json'],text=True);data=json.loads(text)
def punct(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punct(y) for y in x]
 if isinstance(x,dict):return {k:punct(v) for k,v in x.items()}
 return x
for i,t in enumerate(data['terms']):
 if t['slug'] not in selected:continue
 t=punct(t);data['terms'][i]=t
 for section in t['sections']:
  section['paragraphs'] += [{'text':r['text'],'citations':r['citations']} for r in rows if r['slug']==t['slug'] and r['sectionId']==section['id']]
assert selected<={t['slug'] for t in data['terms']};(R/'lib/data/glossary.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print(f'Applied {len(rows)} individually cited qualitative paragraphs to {len(selected)} existing terms from fixed base')
