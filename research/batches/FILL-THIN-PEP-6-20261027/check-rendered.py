from pathlib import Path
import json,sys,hashlib
from bs4 import BeautifulSoup
P=Path(__file__).resolve().parent;R=P.parents[2];before=Path(sys.argv[1]);after=Path(sys.argv[2]);C=json.loads((P/'ADDITIONS-v1-UNAPPLIED.json').read_text());rows=C['records'];S=json.loads((P/'SELECTION.json').read_text());selected=S['slugs'];sources=json.loads((R/'lib/data/glossary.json').read_text())['sources'];a={x['url']:x for x in json.loads((before/'pages.json').read_text())};b={x['url']:x for x in json.loads((after/'pages.json').read_text())};assert set(a)==set(b) and len(a)==81;sha=lambda t:hashlib.sha256(t.encode()).hexdigest()
def soup(root,row):return BeautifulSoup((root/row['html_file']).read_bytes(),'lxml')
def plain(p):
 t=BeautifulSoup(str(p),'lxml')
 for sup in t.find_all('sup'):sup.decompose()
 return t.get_text('',strip=False).strip()
results=[];outside=[];mainExact=[];noMain=[]
for slug in selected:
 u='https://pepsanon.com/glossary/'+slug;aa=a[u];bb=b[u];ss=soup(after,bb);ar=ss.select_one('article.glossary-term-page');old=soup(before,aa).select_one('article.glossary-term-page');assert ar and old and aa['status']==bb['status']==200;ids=[x['id'] for x in ss.find_all(id=True)];assert len(ids)==len(set(ids));refs=ar.select('a.glossary-citation');assert all(x['href'].startswith('#ref-') and x['href'][1:] in ids for x in refs)
 added=[r for r in rows if r['slug']==slug]
 for r in added:
  matches=[p for p in ar.find_all('p') if plain(p)==r['text']];assert len(matches)==1,(slug,r['text']);actual=matches[0].select('sup a');assert [x['href'] for x in actual]==['#ref-'+c['source'] for c in r['citations']]
  for link,c in zip(actual,r['citations']):
   assert link['title']==sources[c['source']]['title']+'; '+c['locator'];ref=ar.select_one('#ref-'+c['source']);assert ref and any(x.get('href')==sources[c['source']]['url'] for x in ref.find_all('a'))
 oldp=[plain(p) for p in old.find_all('p') if not p.find_parent(class_='glossary-references')];newp=[plain(p) for p in ar.find_all('p') if not p.find_parent(class_='glossary-references') and plain(p) not in [r['text'] for r in added]];assert oldp==newp,slug+' prior prose changed'
 assert not any(c in ar.get_text(' ',strip=True) for c in '\u2013\u2014'),slug+' visible dash'
 assert not any(c in x['title'] for x in refs for c in '\u2013\u2014'),slug+' tooltip dash'
 results.append({'url':u,'beforeWords':aa['words'],'afterWords':bb['words'],'beforeCitations':aa['citations'],'afterCitations':bb['citations'],'beforeThin':aa['thin'],'afterThin':bb['thin'],'beforeFlags':aa['thin_reasons'],'afterFlags':bb['thin_reasons'],'newParagraphs':len(added),'citationTargets':len(refs),'beforeHtmlSha256':aa['html_sha256'],'afterHtmlSha256':bb['html_sha256']})
for u,bb in b.items():
 aa=a[u];assert aa['status']==bb['status'],u+' status changed'
 if u in {r['url'] for r in results}:continue
 for key in ['words','citations','thin','thin_reasons']:assert aa[key]==bb[key],(u,key,'outside analyzer result changed')
 x=soup(before,aa);y=soup(after,bb)
 if '/glossary/' in u:
  old=x.select_one('article.glossary-term-page');new=y.select_one('article.glossary-term-page');assert str(old)==str(new),u+' outside glossary changed';outside.append({'url':u,'articleHtmlSha256':sha(str(old))})
 xx=x.select_one('main');yy=y.select_one('main')
 if xx is None or yy is None:
  assert xx is None and yy is None and bb['status']==404;noMain.append({'url':u,'status':404,'mainAbsentBeforeAndAfter':True})
 else:
  assert str(xx)==str(yy),u+' outside main DOM changed';mainExact.append({'url':u,'mainHtmlSha256':sha(str(xx)),'rawWholeDocumentEqual':aa['html_sha256']==bb['html_sha256']})
assert len(outside)==51
for r in S['newMissingBase']+S['held7']:assert b[r['url']]['status']==404
out={'status':'PASS','base':C['base'],'rows':results,'candidate21TextSourceLocators':'exact matches','allSelectedPriorProse':'exact','outside51GlossaryArticleSubtreesExact':outside,'outsideMainDomExact':mainExact,'outside404WithoutMain':noMain,'all81StatusesUnchanged':True,'all54Glossary200':True,'newMissing9AndPriorMissing7All404':True,'allOutsideAnalyzerFlagsExact':True,'htmlNormalizationUsed':False,'newPublicDashes':0,'scientificApproval':False,'humanApproval':False};(P/'RENDERED-CHECK.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':'PASS','selected':results,'outside51Glossary':len(outside),'outsideMainsExact':len(mainExact),'outside404NoMain':len(noMain)},indent=2))
