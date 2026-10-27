from pathlib import Path
from bs4 import BeautifulSoup
import json,sys,hashlib,re
B=Path(__file__).resolve().parent
baseline=Path(sys.argv[1]);after=Path(sys.argv[2]);phase=sys.argv[3];assert phase in ['parity','final']
A={r['url']:r for r in json.loads((baseline/'pages.json').read_text())};Z={r['url']:r for r in json.loads((after/'pages.json').read_text())};assert set(A)==set(Z) and len(A)==141
parity={r['id']:r for r in json.loads((B/'PARITY-CANDIDATE-V1.json').read_text())};candidate=json.loads((B/'FILL-CANDIDATE-V1.json').read_text());contexts=candidate['paragraphs'];live=Path(sys.argv[4]);selected={'https://pepsanon.com/research/'+x for x in parity};sha=lambda x:hashlib.sha256(x.encode()).hexdigest();normalize=lambda x:' '.join(x.split())
def soup(folder,row):return BeautifulSoup((folder/row['html_file']).read_bytes(),'lxml')
def text(t):return normalize(t.get_text(' ',strip=True))
def linktuples(t):return [(text(a),a.get('href'),a.get('target'),a.get('rel')) for a in t.find_all('a',href=True)]
results=[];outside=[]
for url,z in Z.items():
 a=A[url];current=soup(after,z);prior=soup(baseline,a)
 if url not in selected:
  assert a['status']==z['status'],(url,'outside status')
  for k in ['words','citations','thin','thin_reasons']:assert a[k]==z[k],(url,k)
  old=prior.select_one('main');new=current.select_one('main');assert str(old)==str(new),(url,'outside main changed')
  outside.append({'url':url,'status':z['status'],'mainSha256':sha(str(new)),'rawWholeDocumentEqual':a['html_sha256']==z['html_sha256']});continue
 pid=url.rsplit('/',1)[-1];r=parity[pid];assert a['status']==404 and z['status']==200,(pid,'restoration status')
 article=current.select_one('article[data-study-review]');assert article and article['data-study-review']==pid
 expectedSoup=BeautifulSoup((live/('research__'+pid+'.body')).read_bytes(),'lxml');expected=expectedSoup.select_one('article[data-study-review]');unfilled=BeautifulSoup(str(article),'lxml').select_one('article')
 context=unfilled.select_one('[data-restored-context]');actual=[]
 if phase=='parity':assert context is None
 else:
  assert context and context.get('data-restored-context')==pid
  rows=[x for x in contexts if x['paperId']==pid];assert len(rows)==7 and len(context.select('p[data-context-id]'))==7
  for row,p in zip(rows,context.select('p[data-context-id]')):
   assert p['data-context-id']==row['id'];citation=p.select_one('cite a');assert citation
   assert citation['href']==row['sourceUrl'] and text(citation)=='Source: '+row['locator']
   cp=BeautifulSoup(str(p),'lxml').find('p');cp.find('cite').decompose();assert text(cp)==row['text'],(pid,row['id'],'paragraph mismatch')
   assert not re.search('[\u2013\u2014]',row['text']+row['locator']);assert not re.search(r'\d|%',re.sub(r'BPC-?157|TB-500|JAK2|thymosin beta-4','IDENTIFIER',row['text']))
   actual.append({'id':row['id'],'textSourceLocatorSha256':sha(json.dumps([row['text'],row['sourceUrl'],row['locator']],ensure_ascii=False,separators=(',',':')))})
  context.decompose()
 assert text(unfilled)==text(expected),(pid,'inherited live article text changed')
 assert linktuples(unfilled)==linktuples(expected),(pid,'inherited live link tuple changed')
 assert current.title.get_text()==r['metadataTitle'];assert current.find('meta',attrs={'name':'description'})['content']==r['description'];assert current.find('link',rel='canonical')['href']==r['canonical'];assert current.find('meta',attrs={'name':'robots'})['content']==r['robots']
 assert not any(x in text(article) for x in '\u2013\u2014'),(pid,'visible punctuation')
 assert current.select_one('.review-access a')['href']=='/login?returnTo='+__import__('urllib.parse',fromlist=['quote']).quote('/research/'+pid,safe='')
 assert not article.select('[data-question-id]'),(pid,'full-review payload unexpectedly rendered')
 results.append({'id':pid,'status':z['status'],'restoredLiveTextSha256':sha(text(unfilled)),'liveOriginalTextSha256':sha(text(expected)),'inheritedLinks':len(linktuples(unfilled)),'words':z['words'],'citations':z['citations'],'thin':z['thin'],'thinReasons':z['thin_reasons'],'newParagraphs':actual,'articleHtmlSha256':sha(str(article))})
assert len(results)==5 and len(outside)==136
report={'phase':phase,'status':'PASS','fiveLiveTextLinkMetadataParity':results,'outside136MainDomAndAnalysisExact':outside,'all141HistoricalRoutesChecked':True,'htmlNormalization':'BeautifulSoup lxml serialization for main DOM, whitespace-normalized text and explicit link/metadata tuples for live parity; no asset/chunk normalization used to assert raw-document equality.','scientificApproval':False,'numericalApproval':False,'release':False};(B/(phase.upper()+'-RENDERED-CHECK.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'PASS','phase':phase,'selected':[{k:v for k,v in r.items() if k!='newParagraphs'} for r in results],'outside':len(outside)},indent=2))
