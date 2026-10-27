from pathlib import Path
import json,subprocess,argparse
P=Path(__file__).resolve().parent;R=P.parents[2];B='31aa7e2dab871482498228fd6bd4d667409be5ca';ap=argparse.ArgumentParser();ap.add_argument('--part-b');ap.add_argument('--part-b-eight',action='store_true');a=ap.parse_args();assert not(a.part_b and a.part_b_eight);data=json.loads(subprocess.check_output(['git','-C',str(R),'show',B+':lib/data/glossary.json'],text=True));terms={t['slug']:t for t in data['terms']};parta=json.loads((P/'CITATION-CANDIDATES-v1.json').read_text())
for r in parta['records']:
 d=terms[r['slug']]['definition'];assert d['text']==r['unchangedFullText'] and d['citations']==r['existingCitations'];d['citations'].append(r['addCitation'])
def punct(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punct(y) for y in x]
 if isinstance(x,dict):return {k:punct(v) for k,v in x.items()}
 return x
if a.part_b or a.part_b_eight:
 if a.part_b:
  g=json.loads((P/'SELECTION-GRANTED.json').read_text());assert g['state']=='AUTHORIZED_EXACT_SELECTION' and g['base']==B;selected=set(g['partBSlugs']);name=a.part_b
 else:
  selected={'baseline','bioavailability','endotoxin','case-series','metabolism','amino-acid','topical','hydrolyzed-collagen'};name='PART-B-CANDIDATE-v1-UNAPPLIED.json'
 c=json.loads((P/name).read_text());assert {r['slug'] for r in c['records']}==selected
 for i,t in enumerate(data['terms']):
  if t['slug'] not in selected:continue
  t=punct(t);data['terms'][i]=t
  for fix in c.get('proposedLegacyCorrections',[]):
   if fix['slug']!=t['slug']:continue
   section=next(s for s in t['sections'] if s['id']==fix['sectionId']);assert section['paragraphs'][fix['paragraphIndex']]==punct(fix['before']);section['paragraphs'][fix['paragraphIndex']]=fix['after']
  for s in t['sections']:s['paragraphs'] += [{'text':r['text'],'citations':r['citations']} for r in c['records'] if r['slug']==t['slug'] and r['sectionId']==s['id']]
(R/'lib/data/glossary.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Applied exact three PartA citation additions'+(' and authorized PartB candidate '+name if a.part_b or a.part_b_eight else '; PartB remains unapplied'))
