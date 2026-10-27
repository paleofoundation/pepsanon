from pathlib import Path
import json,sys,hashlib,copy
from bs4 import BeautifulSoup
P=Path(__file__).resolve().parent;R=P.parents[2];before=Path(sys.argv[1]);after=Path(sys.argv[2]);candidate=P/sys.argv[3];rows=json.loads(candidate.read_text())['records'];slugs=list(dict.fromkeys(r['slug'] for r in rows));selection=json.loads((P/'SELECTION-v1.json').read_text());prior=selection['partAprior20'];A=json.loads((P/'CITATION-CANDIDATES-v1.json').read_text())['records'];sources=json.loads((R/'lib/data/glossary.json').read_text())['sources'];a={x['url']:x for x in json.loads((before/'pages.json').read_text())};b={x['url']:x for x in json.loads((after/'pages.json').read_text())};results=[];outside=[];native=[];citation_checks=[]
def soup(root,row):return BeautifulSoup((root/row['html_file']).read_bytes(),'lxml').select_one('article.glossary-term-page')
def plain(p):
 f=BeautifulSoup(str(p),'lxml')
 for sup in f.find_all('sup'):sup.decompose()
 return f.get_text('',strip=False).strip()
def titles_match(p,citations):
 actual=p.select('sup a');assert [x['href'] for x in actual]==['#ref-'+c['source'] for c in citations]
 for t,c in zip(actual,citations):assert t['title']==sources[c['source']]['title']+'; '+c['locator']
for slug in prior+slugs:
 u='https://pepsanon.com/glossary/'+slug;aa=a[u];bb=b[u];old=soup(before,aa);article=soup(after,bb);assert old and article and bb['status']==200;document=BeautifulSoup((after/bb['html_file']).read_bytes(),'lxml');ids=[x['id'] for x in document.find_all(id=True)];assert len(ids)==len(set(ids));refs=article.select('a.glossary-citation');assert all(x['href'].startswith('#ref-') and x['href'][1:] in ids for x in refs)
 if slug in prior:
  assert [plain(p) for p in old.find_all('p') if not p.find_parent(class_='glossary-references')]==[plain(p) for p in article.find_all('p') if not p.find_parent(class_='glossary-references')],slug+' prior rendered prose changed outside expected citation-reference projection'
  for r in [r for r in A if r['slug']==slug]:
   matches=[p for p in article.find_all('p') if plain(p)==r['unchangedFullText']];assert len(matches)==1;titles_match(matches[0],r['existingCitations']+[r['addCitation']]);citation_checks.append({'slug':slug,'source':r['addCitation'],'boundary':'CJC supports generic first sentence only; existing BPC citation retained for second sentence'})
 else:
  for r in [r for r in rows if r['slug']==slug]:
   matches=[p for p in article.find_all('p') if plain(p)==r['text']];assert len(matches)==1,(slug,r['text'],len(matches));titles_match(matches[0],r['citations'])
  for fix in json.loads(candidate.read_text()).get('proposedLegacyCorrections',[]):
   if fix['slug']==slug:
    matches=[p for p in article.find_all('p') if plain(p)==fix['after']['text']];assert len(matches)==1;titles_match(matches[0],fix['after']['citations']);assert not any(plain(p)==fix['before']['text'] for p in article.find_all('p'))
  visible=article.get_text(' ',strip=True);nativeTitle=sources['collagen']['title'];usesNative=any(x['title'].startswith(nativeTitle+'; ') for x in refs)
  if usesNative:
   visible=visible.replace(nativeTitle,'NATIVE_SOURCE_TITLE');native.append({'url':u,'nativeTitle':nativeTitle,'state':'INHERITED-PUNCTUATION OPEN; exact source object bytes unchanged; ELON12:42 narrow native-title grant inherited'})
  assert '\u2013' not in visible and '\u2014' not in visible,(slug,'non-exempt visible dash')
  for link in refs:
   title=link['title'].replace(nativeTitle,'NATIVE_SOURCE_TITLE') if usesNative else link['title'];assert '\u2013' not in title and '\u2014' not in title,(slug,'non-exempt citation-title dash')
  assert bb['words']>aa['words']
 results.append({'part':'A' if slug in prior else 'B','url':u,'beforeWords':aa['words'],'afterWords':bb['words'],'deltaWords':bb['words']-aa['words'],'beforeCitations':aa['citations'],'afterCitations':bb['citations'],'beforeThin':aa['thin'],'afterThin':bb['thin'],'beforeFlags':aa['thin_reasons'],'afterFlags':bb['thin_reasons'],'newSentences':len([r for r in rows if r['slug']==slug]),'citationTargets':len(refs),'beforeHtmlSha256':aa['html_sha256'],'afterHtmlSha256':bb['html_sha256']})
changed={r['slug'] for r in A}|set(slugs);held=[]
for u,bb in b.items():
 if '/glossary/' not in u:assert bb['status']==a[u]['status']==404;held.append(u);continue
 assert bb['status']==a[u]['status']==200
 if u.split('/')[-1] in changed:continue
 x=soup(before,a[u]);y=soup(after,bb);assert str(x)==str(y),u+' outside article mismatch';outside.append({'url':u,'articleHtmlSha256':hashlib.sha256(str(x).encode()).hexdigest(),'rawBeforeSha256':a[u]['html_sha256'],'rawAfterSha256':bb['html_sha256'],'rawWholeHtmlEqual':a[u]['html_sha256']==bb['html_sha256']})
assert len(outside)==54-len(changed);assert len(held)==7;eightProof=[]
if len(slugs)==10:
 for r in json.loads((P/'EIGHT-FROZEN-ARTICLES.json').read_text())['eight']:
  u='https://pepsanon.com/glossary/'+r['slug'];digest=hashlib.sha256(str(soup(after,b[u])).encode()).hexdigest();assert digest==r['articleHtmlSha256'];eightProof.append({'slug':r['slug'],'articleHtmlSha256':digest})
receipt={'status':'PASS','preservedInitialEightArticles':eightProof,'rows':results,'exactThreePartACitations':citation_checks,'all20PriorRenderedProse':'exact','outsideArticlesExact':outside,'inheritedNativeTitleOpenItem':native,'newSentencesVerified':len(rows),'all54GlossaryStatus':200,'held7Status':'404 unchanged locally; no live claim','heldRoutes':held,'newNonExemptEmEnDashes':0,'scientificApproval':False,'humanApproval':False};(P/'RENDERED-CHECK.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'status':'PASS','sentences':len(rows),'outsideExact':len(outside),'counts':results},indent=2))
