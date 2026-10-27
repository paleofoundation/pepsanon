from pathlib import Path
import hashlib,json,subprocess,re
P=Path(__file__).resolve().parent;R=P.parents[2];B='8bb517ed61b0f01927186fefddf532e0887060da';file='lib/data/glossary.json';oldtext=subprocess.check_output(['git','-C',str(R),'show',B+':'+file],text=True);newtext=(R/file).read_text();a=json.loads(oldtext);b=json.loads(newtext);selected=set(json.loads((P/'SELECTION-v3-GRANTED.json').read_text())['final10Slugs']);additions=json.loads((P/'ADDITIONS-v2.json').read_text())['records'];assert set(a)==set(b) and a['updatedAt']==b['updatedAt'] and a['sources']==b['sources'];assert len(a['terms'])==len(b['terms'])==54
# Preserve the exact byte strings of every old canonical source and unselected term.
def rawarr(text,key):
 m=re.search('"'+key+'"\\s*:\\s*\\[',text);idx=m.end();out={};dec=json.JSONDecoder()
 while True:
  while text[idx].isspace() or text[idx]==',':idx+=1
  if text[idx]==']':return out
  start=idx;obj,idx=dec.raw_decode(text,idx);out[obj['slug']]=text[start:idx]
ra=rawarr(oldtext,'terms');rb=rawarr(newtext,'terms');dec=json.JSONDecoder();sourcebytes=[]
for key in a['sources']:
 marker='"'+key+'"';oa=oldtext.index(marker)+len(marker);ob=newtext.index(marker)+len(marker)
 oa=oldtext.index('{',oa);ob=newtext.index('{',ob);_,ea=dec.raw_decode(oldtext,oa);_,eb=dec.raw_decode(newtext,ob);assert oldtext[oa:ea]==newtext[ob:eb];sourcebytes.append({'id':key,'sha256':hashlib.sha256(oldtext[oa:ea].encode()).hexdigest()})
def punctuation(x):
 if isinstance(x,str):return x.replace('\u2013','-').replace('\u2014','-')
 if isinstance(x,list):return [punctuation(v) for v in x]
 if isinstance(x,dict):return {k:punctuation(v) for k,v in x.items()}
 return x
changes=[];unchanged=[]
for old,new in zip(a['terms'],b['terms']):
 slug=old['slug'];assert new['slug']==slug
 if slug not in selected:assert ra[slug]==rb[slug];unchanged.append({'slug':slug,'sha256':hashlib.sha256(ra[slug].encode()).hexdigest()});continue
 assert {k:v for k,v in punctuation(old).items() if k!='sections'}=={k:v for k,v in new.items() if k!='sections'}
 for os,ns in zip(old['sections'],new['sections']):
  assert os['id']==ns['id'] and os['title']==ns['title'];assert ns['paragraphs'][:len(os['paragraphs'])]==punctuation(os['paragraphs']);expected=[{'text':x['text'],'citations':x['citations']} for x in additions if x['slug']==slug and x['sectionId']==os['id']];assert ns['paragraphs'][len(os['paragraphs']):]==expected
 assert len(old['sections'])==len(new['sections']);changes.append(slug)
assert set(changes)==selected and len(additions)==70
for x in additions:
 assert all(c['source'] in a['sources'] and c['locator'] for c in x['citations']);assert x['sourceUrl']==a['sources'][x['citations'][0]['source']]['url'];assert '\u2013' not in x['text'] and '\u2014' not in x['text']
 stripped=re.sub(r'CJC-1295|BPC-?157|IGF-1|thymosin-beta-4','IDENTIFIER',x['text']);assert not re.search(r'\d|%|\b(?:mg|kg|fold|milligram|microgram)\b',stripped),x['text']
paths=subprocess.check_output(['git','-C',str(R),'diff','--name-only',B],text=True).splitlines();allowed={file,'lib/data/glossary-index.json','research/glossary/term-audit.json','app/glossary/[slug]/page.tsx'};assert all(x in allowed or x.startswith('research/batches/FILL-THIN-PEP-1-20261027/') for x in paths),paths
for generated in ['lib/data/glossary-index.json','research/glossary/term-audit.json']:
 before=subprocess.check_output(['git','-C',str(R),'show',B+':'+generated],text=True);after=(R/generated).read_text();assert before.replace('Growth hormone\u2013releasing hormone (GHRH)','Growth hormone-releasing hormone (GHRH)')==after,generated
renderer='app/glossary/[slug]/page.tsx';originalRenderer=subprocess.check_output(['git','-C',str(R),'show',B+':'+renderer],text=True);assert originalRenderer.replace('${glossarySources[citation.source].title} — ${citation.locator}','${glossarySources[citation.source].title}; ${citation.locator}')==(R/renderer).read_text();assert originalRenderer.count('${glossarySources[citation.source].title} — ${citation.locator}')==1
assert hashlib.sha256((P/'thin_audit.py').read_bytes()).hexdigest()=='2b25ab36f6591acbe49ddaf856f04399f32497b5d00a36315506d7e27be460fc'
report={'status':'PASS','base':B,'changed10':changes,'unchanged44TermRawSpans':unchanged,'unchanged16SourceRawSpans':sourcebytes,'allOriginalParagraphs':'Preserved order and facts; only inherited ghrh name/intramuscular locator en dashes replaced with ASCII hyphens;7 new paragraphs per selected term','newSourceObjects':0,'newCanonicalTerms':0,'newScientificNumberCheck':'No digits/statistical quantities after allowlisting molecule names; no effect sizes/doses/thresholds added','newPublicDashCharacters':0,'appDiffPaths':[x for x in paths if x in allowed],'generatedProjectionScope':'Only ghrh name punctuation in glossary-index and term-audit; exactly granted tooltip literal in glossary page; all other shared code byte-identical','analyzer':'Exact historical SHA256, host list and logic unchanged'};(P/'PRESERVATION.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['unchanged44TermRawSpans','unchanged16SourceRawSpans']}))
