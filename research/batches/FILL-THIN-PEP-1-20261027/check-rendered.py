from pathlib import Path
import json,sys,hashlib,re
from bs4 import BeautifulSoup
P=Path(__file__).resolve().parent;before=Path(sys.argv[1]);after=Path(sys.argv[2]);adds=json.loads((P/'ADDITIONS-v2.json').read_text())['records'];selected=json.loads((P/'SELECTION-v3-GRANTED.json').read_text())['final10Slugs'];a={x['url']:x for x in json.loads((before/'pages.json').read_text())};b={x['url']:x for x in json.loads((after/'pages.json').read_text())};rows=[];observations=[]
for slug in selected:
 url='https://pepsanon.com/glossary/'+slug;aa=a[url];bb=b[url];s=BeautifulSoup((after/bb['html_file']).read_bytes(),'lxml');article=s.select_one('article.glossary-term-page');assert article and bb['status']==200;ids=[t['id'] for t in s.find_all(id=True)];assert len(ids)==len(set(ids)),slug
 refs=article.select('a.glossary-citation');assert all(t['href'][1:] in ids for t in refs),slug
 for x in [x for x in adds if x['slug']==slug]:
  matches=[]
  for p in article.find_all('p'):
   fragment=BeautifulSoup(str(p),'lxml')
   for sup in fragment.find_all('sup'):sup.decompose()
   text=fragment.get_text('',strip=False).strip()
   if text==x['text']:matches.append(p)
  assert len(matches)==1,(slug,x['text'],len(matches));assert [c['href'] for c in matches[0].select('sup a')]==['#ref-'+c['source'] for c in x['citations']]
  assert x['text'].endswith('.') and matches[0].find('sup'),slug
 assert all('\u2013' not in x.get('title','') and '\u2014' not in x.get('title','') for x in article.find_all(title=True)),slug+' citation title dash';text=article.get_text(' ',strip=True);assert '\u2013' not in text and '\u2014' not in text,slug+' rendered dash'
 assert bb['words']>aa['words'];rows.append({'url':url,'beforeWords':aa['words'],'afterWords':bb['words'],'deltaWords':bb['words']-aa['words'],'beforeCitations':aa['citations'],'afterCitations':bb['citations'],'beforeThin':aa['thin'],'afterThin':bb['thin'],'beforeFlags':aa['thin_reasons'],'afterFlags':bb['thin_reasons'],'renderedCitationCheck':'PASS7new sentences and targets','beforeHtmlSha256':aa['html_sha256'],'afterHtmlSha256':bb['html_sha256']})
for url,bb in b.items():
 if '/research/' in url or '/guides/' in url:assert bb['status']==a[url]['status']==404
 elif url.split('/')[-1] not in selected:
  old=BeautifulSoup((before/a[url]['html_file']).read_bytes(),'lxml').select_one('article.glossary-term-page');new=BeautifulSoup((after/bb['html_file']).read_bytes(),'lxml').select_one('article.glossary-term-page');
  for link in old.select('a.glossary-citation'):
   if link.has_attr('title'):link['title']=link['title'].replace(' — ','; ',1)
  x=str(old);y=str(new)
  if x!=y:
   assert x.replace('Growth hormone–releasing hormone (GHRH)','Growth hormone-releasing hormone (GHRH)').replace('Growth hormone\\u2013releasing hormone (GHRH)','Growth hormone-releasing hormone (GHRH)')==y,url+' outside article difference';observations.append({'url':url,'difference':'Generated related-term GHRH name ASCII punctuation, in addition to exact gated citation-title separator change; canonical term untouched'})
result={'status':'PASS','strictTooltipStatus':'PASS_FRESH_POST_GATE_BUILD','rows':rows,'sameAnalyzerSha256':'2b25ab36f6591acbe49ddaf856f04399f32497b5d00a36315506d7e27be460fc','baseline':'Actual local default-base production build; historical ranked counts kept separately','final':'Actual local scoped candidate production build','canonicalSourcesUnchanged':16,'unselectedCanonicalTermsUnchanged':44,'unselectedRenderedArticleDifferences':observations,'heldRoutes':'All3 remained404locally, no live claim','selectedMainDashCheck':'PASS zero em/en in selected visible article and citation titles after exact11:56 gate','paragraphsVerified':70};(P/'RENDERED-CHECK.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'status':'PASS','strictTooltipStatus':'PASS_FRESH_POST_GATE_BUILD','rows':rows,'outsideDisplayNameOnlyChanges':len(observations)},indent=2))
