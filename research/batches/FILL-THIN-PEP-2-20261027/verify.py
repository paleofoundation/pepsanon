from pathlib import Path
import json,hashlib,subprocess,re,argparse
P=Path(__file__).resolve().parent;R=P.parents[2];B='778e0fbdecd3db50ed229012d8987eb768b33a2b';ap=argparse.ArgumentParser();ap.add_argument('--candidate',required=True);args=ap.parse_args();grant=json.loads((P/'SELECTION-GRANTED.json').read_text());selected=set(grant['finalSlugs']);rows=json.loads((P/args.candidate).read_text())['records'];f='lib/data/glossary.json';old=subprocess.check_output(['git','-C',str(R),'show',B+':'+f],text=True);new=(R/f).read_text();a=json.loads(old);b=json.loads(new);assert set(a)==set(b) and a['updatedAt']==b['updatedAt'] and len(a['terms'])==len(b['terms'])==54 and a['sources']==b['sources'];dec=json.JSONDecoder()
def spans(text,key):
 idx=re.search('"'+key+'"\\s*:\\s*\\[',text).end();out={}
 while True:
  while text[idx].isspace() or text[idx]==',':idx+=1
  if text[idx]==']':return out
  start=idx;x,idx=dec.raw_decode(text,idx);out[x['slug']]=text[start:idx]
def punct(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punct(y) for y in x]
 if isinstance(x,dict):return {k:punct(v) for k,v in x.items()}
 return x
sha=lambda x:hashlib.sha256(x).hexdigest();ra=spans(old,'terms');rb=spans(new,'terms');changed=[];untouched=[]
for x,y in zip(a['terms'],b['terms']):
 assert x['slug']==y['slug'];slug=x['slug']
 if slug not in selected:assert ra[slug]==rb[slug];untouched.append({'slug':slug,'sha256':sha(ra[slug].encode())});continue
 changed.append(slug);assert {k:v for k,v in punct(x).items() if k!='sections'}=={k:v for k,v in y.items() if k!='sections'};assert len(x['sections'])==len(y['sections'])
 for os,ns in zip(x['sections'],y['sections']):
  assert os['id']==ns['id'] and os['title']==ns['title'] and ns['paragraphs'][:len(os['paragraphs'])]==punct(os['paragraphs']);assert ns['paragraphs'][len(os['paragraphs']):]==[{'text':r['text'],'citations':r['citations']} for r in rows if r['slug']==slug and r['sectionId']==os['id']]
sourceproof=[]
for id in a['sources']:
 marker='"'+id+'"';i=old.index('{',old.index(marker)+len(marker));j=new.index('{',new.index(marker)+len(marker));_,ie=dec.raw_decode(old,i);_,je=dec.raw_decode(new,j);assert old[i:ie]==new[j:je];sourceproof.append({'id':id,'sha256':sha(old[i:ie].encode())})
for r in rows:
 assert r['text'].endswith('.') and '\u2013' not in r['text'] and '\u2014' not in r['text'];assert all(c['source'] in a['sources'] and c['locator'] for c in r['citations']);assert r['sourceUrl']==a['sources'][r['citations'][0]['source']]['url'];assert not re.search(r'\d|%',re.sub(r'BPC-?157|TB-500|JAK2','IDENTIFIER',r['text']))
paths=subprocess.check_output(['git','-C',str(R),'diff','--name-only',B],text=True).splitlines();assert all(p==f or p.startswith('research/batches/FILL-THIN-PEP-2-20261027/') for p in paths),paths
for f2 in ['app/glossary/[slug]/page.tsx','lib/data/glossary-index.json','research/glossary/term-audit.json']:
 assert subprocess.check_output(['git','-C',str(R),'show',B+':'+f2])==(R/f2).read_bytes(),f2
frozen=R/'research/batches/FILL-THIN-PEP-1-20261027';fp=[]
for p in sorted(frozen.iterdir()):
 if p.is_file():assert subprocess.check_output(['git','-C',str(R),'show',B+':'+str(p.relative_to(R))])==p.read_bytes();fp.append({'path':str(p.relative_to(R)),'sha256':sha(p.read_bytes())})
assert len(fp)==59
assert sha((P/'thin_audit.py').read_bytes())=='2b25ab36f6591acbe49ddaf856f04399f32497b5d00a36315506d7e27be460fc';prior10=json.loads((frozen/'SELECTION-v3-GRANTED.json').read_text())['final10Slugs'];assert not selected.intersection(prior10);assert set(changed)==selected
receipt={'status':'PASS','base':B,'changed':changed,'unchangedCanonicalTermRawSpans':untouched,'unchangedSourceRawSpans':sourceproof,'prior59PacketFilesUnchanged':fp,'prior10TermsUnchanged':prior10,'newTermObjects':0,'newSourceObjects':0,'newScientificNumbers':0,'sharedRendererIndexAudit':'byte-identical','sterility':'Prior object unchanged, not revisited','analyzerSha256':sha((P/'thin_audit.py').read_bytes()),'appDiffPaths':[p for p in paths if not p.startswith('research/batches/FILL-THIN-PEP-2-20261027/')]};(P/'PRESERVATION.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k not in ['unchangedCanonicalTermRawSpans','unchangedSourceRawSpans','prior59PacketFilesUnchanged']}))
