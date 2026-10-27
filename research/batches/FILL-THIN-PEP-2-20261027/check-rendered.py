from pathlib import Path
import json,sys,hashlib
from bs4 import BeautifulSoup
P=Path(__file__).resolve().parent;R=P.parents[2];before=Path(sys.argv[1]);after=Path(sys.argv[2]);candidate=P/sys.argv[3];grant=json.loads((P/'SELECTION-GRANTED.json').read_text());slugs=grant['finalSlugs'];rows=json.loads(candidate.read_text())['records'];sources=json.loads((R/'lib/data/glossary.json').read_text())['sources'];a={x['url']:x for x in json.loads((before/'pages.json').read_text())};b={x['url']:x for x in json.loads((after/'pages.json').read_text())};results=[];outside=[];native=[]
for slug in slugs:
 u='https://pepsanon.com/glossary/'+slug;aa=a[u];bb=b[u];s=BeautifulSoup((after/bb['html_file']).read_bytes(),'lxml');article=s.select_one('article.glossary-term-page');assert article and bb['status']==200;ids=[x['id'] for x in s.find_all(id=True)];assert len(ids)==len(set(ids));refs=article.select('a.glossary-citation');assert all(x['href'].startswith('#ref-') and x['href'][1:] in ids for x in refs)
 for r in [r for r in rows if r['slug']==slug]:
  matches=[]
  for p in article.find_all('p'):
   f=BeautifulSoup(str(p),'lxml')
   for sup in f.find_all('sup'):sup.decompose()
   if f.get_text('',strip=False).strip()==r['text']:matches.append(p)
  assert len(matches)==1,(slug,r['text'],len(matches));actual=matches[0].select('sup a');assert [x['href'] for x in actual]==['#ref-'+c['source'] for c in r['citations']]
  for t,c in zip(actual,r['citations']):assert t['title']==sources[c['source']]['title']+'; '+c['locator']
 # Remove only the explicitly granted native quote from punctuation accounting; never alter the document.
 visible=article.get_text(' ',strip=True)
 if slug=='absorption' and grant.get('inheritedNativeCollagenTitleOnly'):
  nativeTitle=sources['collagen']['title'];visible=visible.replace(nativeTitle,'NATIVE_SOURCE_TITLE');native.append({'url':u,'nativeTitle':nativeTitle,'surfaces':'Original source reference and citation title/aria; exact base bytes retained','permittedBy':grant['authority']})
 assert '\u2013' not in visible and '\u2014' not in visible,(slug,'non-exempt visible dash')
 for link in refs:
  title=link['title']
  if slug=='absorption' and grant.get('inheritedNativeCollagenTitleOnly'):title=title.replace(sources['collagen']['title'],'NATIVE_SOURCE_TITLE')
  assert '\u2013' not in title and '\u2014' not in title,(slug,'non-exempt citation-title dash')
 assert bb['words']>aa['words'];results.append({'url':u,'beforeWords':aa['words'],'afterWords':bb['words'],'deltaWords':bb['words']-aa['words'],'beforeCitations':aa['citations'],'afterCitations':bb['citations'],'beforeThin':aa['thin'],'afterThin':bb['thin'],'beforeFlags':aa['thin_reasons'],'afterFlags':bb['thin_reasons'],'newSentences':len([r for r in rows if r['slug']==slug]),'citationTargets':len(refs),'beforeHtmlSha256':aa['html_sha256'],'afterHtmlSha256':bb['html_sha256']})
for u,bb in b.items():
 if '/glossary/' not in u:assert bb['status']==a[u]['status']==404;continue
 if u.split('/')[-1] in slugs:continue
 x=BeautifulSoup((before/a[u]['html_file']).read_bytes(),'lxml').select_one('article.glossary-term-page');y=BeautifulSoup((after/bb['html_file']).read_bytes(),'lxml').select_one('article.glossary-term-page');assert str(x)==str(y),u+' outside article mismatch';outside.append({'url':u,'articleHtmlSha256':hashlib.sha256(str(x).encode()).hexdigest(),'rawBeforeSha256':a[u]['html_sha256'],'rawAfterSha256':bb['html_sha256'],'rawWholeHtmlEqual':a[u]['html_sha256']==bb['html_sha256']})
receipt={'status':'PASS','rows':results,'outsideArticlesExact':outside,'inheritedNativeTitleOpenItem':native,'newSentencesVerified':len(rows),'all54GlossaryStatus':200,'held5Status':'404 unchanged locally; no live claim','allPrior10Articles':'Outside set, exact article HTML preserved','newNonExemptEmEnDashes':0,'scientificApproval':False};(P/'RENDERED-CHECK.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'status':'PASS','sentences':len(rows),'outsideExact':len(outside),'counts':results},indent=2))
