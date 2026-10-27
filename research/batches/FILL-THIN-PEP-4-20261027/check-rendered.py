from pathlib import Path
import json,sys,hashlib
from bs4 import BeautifulSoup
P=Path(__file__).resolve().parent;R=P.parents[2];before=Path(sys.argv[1]);after=Path(sys.argv[2]);C=json.loads((P/'ADDITIONS-v1-UNAPPLIED.json').read_text());rows=C['records'];selected=json.loads((P/'SELECTION.json').read_text())['slugs'];sources=json.loads((R/'lib/data/glossary.json').read_text())['sources'];a={x['url']:x for x in json.loads((before/'pages.json').read_text())};b={x['url']:x for x in json.loads((after/'pages.json').read_text())};results=[];outside=[];native=[];held=[]
def article(root,row):return BeautifulSoup((root/row['html_file']).read_bytes(),'lxml').select_one('article.glossary-term-page')
def plain(p):
 t=BeautifulSoup(str(p),'lxml')
 for sup in t.find_all('sup'):sup.decompose()
 return t.get_text('',strip=False).strip()
for slug in selected:
 url='https://pepsanon.com/glossary/'+slug;aa=a[url];bb=b[url];s=BeautifulSoup((after/bb['html_file']).read_bytes(),'lxml');ar=s.select_one('article.glossary-term-page');old=article(before,aa);assert ar and old and bb['status']==aa['status']==200;ids=[x['id'] for x in s.find_all(id=True)];assert len(ids)==len(set(ids));refs=ar.select('a.glossary-citation');assert all(x['href'].startswith('#ref-') and x['href'][1:] in ids for x in refs)
 for r in [r for r in rows if r['slug']==slug]:
  matches=[p for p in ar.find_all('p') if plain(p)==r['text']];assert len(matches)==1,(slug,r['text'],len(matches));actual=matches[0].select('sup a');assert [x['href'] for x in actual]==['#ref-'+c['source'] for c in r['citations']]
  for link,c in zip(actual,r['citations']):assert link['title']==sources[c['source']]['title']+'; '+c['locator'];ref=ar.select_one('#ref-'+c['source']);assert ref and any(x.get('href')==sources[c['source']]['url'] for x in ref.find_all('a'))
 # Prior prose is preserved except the selected locator punctuation fields, which render outside prose.
 oldp=[plain(p) for p in old.find_all('p') if not p.find_parent(class_='glossary-references')];newp=[plain(p) for p in ar.find_all('p') if not p.find_parent(class_='glossary-references') and plain(p) not in [r['text'] for r in rows if r['slug']==slug]];assert oldp==newp,slug+' existing rendered prose changed'
 visible=ar.get_text(' ',strip=True);title=sources['collagen']['title'];usesNative=any(x['title'].startswith(title+'; ') for x in refs)
 if usesNative:visible=visible.replace(title,'NATIVE_SOURCE_TITLE');native.append({'slug':slug,'title':title,'state':'INHERITED-PUNCTUATION OPEN; exact native source object remains unchanged under earlier narrow grant'})
 assert '\u2013' not in visible and '\u2014' not in visible,(slug,'non-exempt visible dash')
 for link in refs:
  text=link['title'].replace(title,'NATIVE_SOURCE_TITLE') if usesNative else link['title'];assert '\u2013' not in text and '\u2014' not in text,(slug,'non-exempt title dash')
 results.append({'url':url,'beforeWords':aa['words'],'afterWords':bb['words'],'beforeCitations':aa['citations'],'afterCitations':bb['citations'],'beforeThin':aa['thin'],'afterThin':bb['thin'],'beforeFlags':aa['thin_reasons'],'afterFlags':bb['thin_reasons'],'newParagraphs':len([r for r in rows if r['slug']==slug]),'citationTargets':len(refs),'beforeHtmlSha256':aa['html_sha256'],'afterHtmlSha256':bb['html_sha256']})
for url,bb in b.items():
 if '/glossary/' not in url:assert bb['status']==a[url]['status']==404;held.append(url);continue
 assert bb['status']==a[url]['status']==200
 if url.split('/')[-1] in selected:continue
 x=article(before,a[url]);y=article(after,bb);assert str(x)==str(y),url+' outside article changed';outside.append({'url':url,'articleHtmlSha256':hashlib.sha256(str(x).encode()).hexdigest(),'rawBeforeHtmlSha256':a[url]['html_sha256'],'rawAfterHtmlSha256':bb['html_sha256'],'rawWholeDocumentEqual':a[url]['html_sha256']==bb['html_sha256']})
assert len(outside)==44 and len(held)==7;out={'status':'PASS','base':C['base'],'rows':results,'all70CandidateParagraphsSourcesLocators':'exact DOM matches','allSelectedPriorProse':'exact','outside44ArticleSubtreesExact':outside,'held7Status404':held,'all54Glossary200':True,'nativeCollagenTitleOpen':native,'newNonExemptEmEnDashes':0,'scientificApproval':False,'humanApproval':False};(P/'RENDERED-CHECK.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':'PASS','candidateRows':len(rows),'outsideArticles':len(outside),'rows':results},indent=2))
