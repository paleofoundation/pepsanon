from pathlib import Path
import json,subprocess,hashlib,re,copy
P=Path(__file__).resolve().parent;R=P.parents[2];B='f95b72672fedfe09fdb2937a082022b1302768ac';file='lib/data/glossary.json';at=subprocess.check_output(['git','-C',str(R),'show',B+':'+file],text=True);bt=(R/file).read_text();a=json.loads(at);b=json.loads(bt);assert set(a)==set(b) and a['updatedAt']==b['updatedAt'] and a['sources']==b['sources'];selected=set(json.loads((P/'SELECTION-ACTIVE.json').read_text())['slugs']);rows=json.loads((P/'ADDITIONS-v2-NINE-UNAPPLIED.json').read_text())['records'];assert len(a['terms'])==len(b['terms'])==54;dec=json.JSONDecoder();sha=lambda x:hashlib.sha256(x).hexdigest()
def spans(text):
 i=re.search('"terms"\\s*:\\s*\\[',text).end();out={}
 while True:
  while text[i].isspace() or text[i]==',':i+=1
  if text[i]==']':return out
  start=i;t,i=dec.raw_decode(text,i);out[t['slug']]=text[start:i]
def punct(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punct(y) for y in x]
 if isinstance(x,dict):return {k:punct(v) for k,v in x.items()}
 return x
old=spans(at);new=spans(bt);outside=[]
for x,y in zip(a['terms'],b['terms']):
 slug=x['slug'];assert y['slug']==slug
 if slug not in selected:assert old[slug]==new[slug];outside.append({'slug':slug,'rawSha256':sha(old[slug].encode())});continue
 expected=punct(copy.deepcopy(x))
 for sec in expected['sections']:sec['paragraphs'] += [{'text':r['text'],'citations':r['citations']} for r in rows if r['slug']==slug and r['sectionId']==sec['id']]
 assert y==expected,slug+' differs beyond exact candidate and scoped punctuation'
sources=[]
for id in a['sources']:
 marker='"'+id+'"';i=at.index('{',at.index(marker)+len(marker));j=bt.index('{',bt.index(marker)+len(marker));_,ei=dec.raw_decode(at,i);_,ej=dec.raw_decode(bt,j);assert at[i:ei]==bt[j:ej];sources.append({'id':id,'rawSha256':sha(at[i:ei].encode())})
for r in rows:
 assert not re.search(r'\d|%',re.sub(r'BPC-?157|CJC-1295|GHK-Cu|RGN-259|GLP-1','IDENTIFIER',r['text']));assert '\u2013' not in r['text'] and '\u2014' not in r['text'];assert r['sourceUrl']==a['sources'][r['citations'][0]['source']]['url'];assert all(c['source'] in a['sources'] and c['locator'] and '\u2013' not in c['locator'] and '\u2014' not in c['locator'] for c in r['citations'])
frozen=json.loads((P/'FROZEN-PRIOR-235.json').read_text());assert len(frozen)==235
for path,h in frozen.items():
 p=R/path;assert sha(p.read_bytes())==h;assert subprocess.check_output(['git','-C',str(R),'show',B+':'+path])==p.read_bytes()
shared=['app/glossary/[slug]/page.tsx','lib/data/glossary-index.json','research/glossary/term-audit.json','tsconfig.tsbuildinfo']
for f in shared:
 expectedBase='c1e7e7e' if f=='lib/data/glossary-index.json' else B
 assert subprocess.check_output(['git','-C',str(R),'show',expectedBase+':'+f])==(R/f).read_bytes(),f
for f in ['thin_audit.py','audit_pages.py']:assert (P/f).read_bytes()==(R/'research/batches/FILL-THIN-PEP-3-20261027'/f).read_bytes()
assert sha((P/'thin_audit.py').read_bytes())=='2b25ab36f6591acbe49ddaf856f04399f32497b5d00a36315506d7e27be460fc';paths=subprocess.check_output(['git','-C',str(R),'diff','--name-only',B],text=True).splitlines();assert all(p in [file,'lib/data/glossary-index.json'] or p.startswith('research/batches/FILL-THIN-PEP-5-20261027/') for p in paths);lines=subprocess.check_output(['git','-C',str(R),'diff','--unified=0',B,'--',file],text=True).splitlines();added=[l[1:] for l in lines if l.startswith('+') and not l.startswith('+++')];assert all('\u2013' not in l and '\u2014' not in l for l in added);out={'status':'PASS','base':B,'selected':sorted(selected),'prior40AndOutside45RawObjectsExact':outside,'all16SourceObjectsExact':sources,'prior235FilesExact':frozen,'sharedFilesExact':shared,'candidateRows':len(rows),'dataSha256':sha((R/file).read_bytes()),'addedPublicLines':len(added),'newScientificNumbers':0,'newPublicEmEnDashes':0,'newCanonicalRecords':0,'analyzerWrapperExact':True,'scientificApproval':False,'humanApproval':False};(P/'PRESERVATION.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ['prior40AndOutside45RawObjectsExact','all16SourceObjectsExact','prior235FilesExact']}))
