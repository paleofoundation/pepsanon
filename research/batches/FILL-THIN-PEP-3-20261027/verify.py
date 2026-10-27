from pathlib import Path
import hashlib,json,subprocess,re,argparse,copy
P=Path(__file__).resolve().parent;R=P.parents[2];B='31aa7e2dab871482498228fd6bd4d667409be5ca';ap=argparse.ArgumentParser();ap.add_argument('--part-b');ap.add_argument('--part-b-eight',action='store_true');ap.add_argument('--out',default='PRESERVATION.json');args=ap.parse_args();assert not(args.part_b and args.part_b_eight);args.part_b='PART-B-CANDIDATE-v1-UNAPPLIED.json' if args.part_b_eight else args.part_b;f='lib/data/glossary.json';oldtext=subprocess.check_output(['git','-C',str(R),'show',B+':'+f],text=True);newtext=(R/f).read_text();a=json.loads(oldtext);b=json.loads(newtext);assert set(a)==set(b) and a['updatedAt']==b['updatedAt'] and a['sources']==b['sources'] and len(a['terms'])==len(b['terms'])==54;A=json.loads((P/'CITATION-CANDIDATES-v1.json').read_text())['records'];prior20=json.loads((P/'SELECTION-v1.json').read_text())['partAprior20'];Bdata=json.loads((P/args.part_b).read_text()) if args.part_b else {'records':[],'proposedLegacyCorrections':[]};selectedB=({'baseline','bioavailability','endotoxin','case-series','metabolism','amino-acid','topical','hydrolyzed-collagen'} if args.part_b_eight else set(json.loads((P/'SELECTION-GRANTED.json').read_text())['partBSlugs'])) if args.part_b else set();selectedA={r['slug'] for r in A};assert not selectedB.intersection(prior20);dec=json.JSONDecoder();sha=lambda x:hashlib.sha256(x).hexdigest()
def spans(text):
 idx=re.search('"terms"\\s*:\\s*\\[',text).end();out={}
 while True:
  while text[idx].isspace() or text[idx]==',':idx+=1
  if text[idx]==']':return out
  start=idx;x,idx=dec.raw_decode(text,idx);out[x['slug']]=text[start:idx]
def punct(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punct(y) for y in x]
 if isinstance(x,dict):return {k:punct(v) for k,v in x.items()}
 return x
def noCitations(x):
 if isinstance(x,dict):return {k:noCitations(v) for k,v in x.items() if k!='citations'}
 if isinstance(x,list):return [noCitations(v) for v in x]
 return x
ra=spans(oldtext);rb=spans(newtext);aa={t['slug']:t for t in a['terms']};bb={t['slug']:t for t in b['terms']};raw=[]
for s in prior20:assert noCitations(aa[s])==noCitations(bb[s]),s+' prior prose/metadata changed'
for s in aa:
 x=aa[s];y=bb[s]
 if s in selectedA:
  expected=copy.deepcopy(x);r=next(r for r in A if r['slug']==s);assert x['definition']['text']==r['unchangedFullText'];expected['definition']['citations'].append(r['addCitation']);assert y==expected,s+' unauthorized citation change';continue
 if s not in selectedB:assert ra[s]==rb[s],s+' outside raw object changed';raw.append({'slug':s,'sha256':sha(ra[s].encode())});continue
 assert {k:v for k,v in punct(x).items() if k!='sections'}=={k:v for k,v in y.items() if k!='sections'};assert len(x['sections'])==len(y['sections'])
 for os,ns in zip(x['sections'],y['sections']):
  assert os['id']==ns['id'] and os['title']==ns['title'];prefix=punct(copy.deepcopy(os['paragraphs']))
  for fix in Bdata.get('proposedLegacyCorrections',[]):
   if fix['slug']==s and fix['sectionId']==os['id']:assert prefix[fix['paragraphIndex']]==punct(fix['before']);prefix[fix['paragraphIndex']]=fix['after']
  assert ns['paragraphs'][:len(prefix)]==prefix
  assert ns['paragraphs'][len(prefix):]==[{'text':r['text'],'citations':r['citations']} for r in Bdata['records'] if r['slug']==s and r['sectionId']==os['id']]
sp=[]
for id in a['sources']:
 marker='"'+id+'"';i=oldtext.index('{',oldtext.index(marker)+len(marker));j=newtext.index('{',newtext.index(marker)+len(marker));_,ie=dec.raw_decode(oldtext,i);_,je=dec.raw_decode(newtext,j);assert oldtext[i:ie]==newtext[j:je];sp.append({'id':id,'sha256':sha(oldtext[i:ie].encode())})
for r in Bdata['records']:
 assert r['text'].endswith('.') and '\u2013' not in r['text'] and '\u2014' not in r['text'];assert not re.search(r'\d|%',re.sub(r'BPC-?157|GHK-Cu|IPD-52520|GLP-1|GIP','IDENTIFIER',r['text']));assert all(c['source'] in a['sources'] and c['locator'] for c in r['citations']);assert r['sourceUrl']==a['sources'][r['citations'][0]['source']]['url']
paths=subprocess.check_output(['git','-C',str(R),'diff','--name-only',B],text=True).splitlines();assert all(p==f or p.startswith('research/batches/FILL-THIN-PEP-3-20261027/') for p in paths),paths
for f2 in ['app/glossary/[slug]/page.tsx','lib/data/glossary-index.json','research/glossary/term-audit.json']:assert subprocess.check_output(['git','-C',str(R),'show',B+':'+f2])==(R/f2).read_bytes(),f2
frozen=[]
for name in ['FILL-THIN-PEP-1-20261027','FILL-THIN-PEP-2-20261027']:
 for p in sorted((R/'research/batches'/name).iterdir()):
  if p.is_file():assert subprocess.check_output(['git','-C',str(R),'show',B+':'+str(p.relative_to(R))])==p.read_bytes();frozen.append({'path':str(p.relative_to(R)),'sha256':sha(p.read_bytes())})
assert len(frozen)==115;assert sha((P/'thin_audit.py').read_bytes())=='2b25ab36f6591acbe49ddaf856f04399f32497b5d00a36315506d7e27be460fc';assert (P/'audit_pages.py').read_bytes()==(R/'research/batches/FILL-THIN-PEP-2-20261027/audit_pages.py').read_bytes();lines=subprocess.check_output(['git','-C',str(R),'diff','--unified=0',B,'--',f],text=True).splitlines();added=[l[1:] for l in lines if l.startswith('+') and not l.startswith('+++')];assert all('\u2013' not in l and '\u2014' not in l for l in added)
eightProof=[]
if args.part_b and not args.part_b_eight:
 for r in json.loads((P/'EIGHT-FROZEN-OBJECTS.json').read_text())['eight']:
  assert sha(rb[r['slug']].encode())==r['rawObjectSha256'];eightProof.append(r)
out={'status':'PASS','base':B,'partAExactCitationAdditions':A,'prior20ProseExact':prior20,'partBSelected':sorted(selectedB),'preservedInitialEightRawObjects':eightProof,'unchangedTermRawSpans':raw,'unchanged16SourceRawSpans':sp,'frozen115PriorPacketFiles':frozen,'newSourceObjects':0,'newCanonicalTerms':0,'newScientificNumbers':0,'newPublicEmEnDashes':0,'publicAddedLines':len(added),'sharedRendererIndexAudit':'byte-identical','onlyAppPath':f,'analyzerAndWrapper':'exact unchanged bytes','scientificApproval':False};(P/args.out).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ['partAExactCitationAdditions','unchangedTermRawSpans','unchanged16SourceRawSpans','frozen115PriorPacketFiles']}))
