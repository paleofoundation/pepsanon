"""Check source integrity and every requested route against the local preview."""
from pathlib import Path
import concurrent.futures, html, json, re, sys, unicodedata, urllib.request

root=Path(__file__).resolve().parents[2]
corpus=root.parent/'corpus/peptides-primary'
inventory=json.loads((root/'lib/data/focus-pages.json').read_text())
requested=json.loads((root/'research/focus-pages/requested-inventory.json').read_text())['rows']
links=json.loads((root/'lib/data/corpus-page-links.json').read_text())
records=json.loads((corpus/'records.json').read_text())
original={r['id']:r for r in json.loads((corpus/'before-focus-page-attachments/records.json').read_text())}
excerpts=json.loads((root/'lib/data/focus-evidence.json').read_text())
assert len(inventory['peptides'])==len(inventory['stacks'])==len(requested)==30
assert [r['peptide'] for r in requested]==[p['name'] for p in inventory['peptides']]
assert [r['stack'] for r in requested]==[p['name'] for p in inventory['stacks']]
assert len({p['id'] for p in inventory['peptides']})==30
assert len({s['slug'] for s in inventory['stacks']})==30
assert len(records)==506 and sum(r['record_type']=='quality' for r in records)==2
allowed_ids={p['id'] for p in inventory['peptides']}
for r in records:
 assert all(i in allowed_ids for i in links.get(r['id'],[])),r['id']
 if r['record_type']=='quality':assert r['id'] not in links
 # Only routing metadata may change during this page expansion.
 for key,value in original[r['id']].items():
  if key not in {'attachment_status','site_peptide_ids'}:assert value==r[key],(r['id'],key)
 public=json.loads((root/'public/study-records'/f"{r['id']}.json").read_text())
 assert public==r,r['id']
def normalize(s):return re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('\u00ad','').replace('−','-').replace('–','-').replace('—','-')
source_exceptions=[]
for peptide,items in excerpts.items():
 for item in items:
  source=item['source'];r=next(r for r in records if r['id']==item['recordId'])
  assert peptide in links[r['id']]
  assert source['filename']==r['filename'] and source['doi']==r['doi']
  text=(corpus/'reading-text'/Path(source['filename']).with_suffix('.txt')).read_text()
  page=text.split('\f')[source['pdf_page']-1]
  if normalize(item['text']) not in normalize(page):source_exceptions.append({'peptide':peptide,'label':item['label'],'filename':source['filename'],'page':source['pdf_page']})
assert not source_exceptions,source_exceptions
report={'source_integrity':'PASS','peptide_pages':30,'stack_pages':30,'scientific_record_fields_unchanged':506,'cited_excerpts_verified':sum(map(len,excerpts.values()))}
if len(sys.argv)>1:
 origin=sys.argv[1].rstrip('/')
 assert origin in {'http://127.0.0.1:5187','http://127.0.0.1:5190'},'Local previews only'
 routes=[(f"/peptides/{p['id']}",p['name'],not p['existing']) for p in inventory['peptides']]+[(f"/stacks/{s['slug']}",s['name'],not s['existing']) for s in inventory['stacks']]
 def fetch(path):
  with urllib.request.urlopen(origin+path,timeout=60) as response:return response.read().decode()
 def verify(route):
  path,name,is_new=route;s=fetch(path)
  heading=re.search(r'<h1\b[^>]*>(.*?)</h1>',s,re.S)
  assert heading and html.unescape(re.sub('<[^>]+>','',heading.group(1)))==name,path
  assert 'Internal Server Error' not in s,path
  if is_new:assert 'NOT IN CORPUS' in s,path
  return path
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:checked=list(pool.map(verify,routes))
 sitemap=fetch('/sitemap.xml')
 assert all(path in sitemap for path,_,_ in routes)
 for directory in ['/peptides','/stacks']:
  document=fetch(directory)
  assert all(f'href="{path}"' in document for path,_,_ in routes if path.startswith(directory+'/'))
 sources=fetch('/sources');assert 'quality-records' in sources
 report.update({'local_route_checks':'PASS','http_pages_checked':len(checked),'directory_links':'PASS','sitemap':'PASS'})
(root/'research/focus-pages/validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
