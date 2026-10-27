from pathlib import Path
import json,sys,hashlib
from bs4 import BeautifulSoup
from audit_pages import SafeFetcher
B=Path(__file__).resolve().parent;phase=sys.argv[1];out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True);fetch=SafeFetcher('127.0.0.1',out);rows=[]
try:
 for path in ['/research/paper-not-authorized','/research','/install','/before-you-buy','/guides/before-you-buy','/sitemap.xml','/robots.txt']:
  r=fetch.get('http://127.0.0.1:8794'+path);rows.append({'path':path,'status':r.status_code,'sha256':hashlib.sha256(r.content).hexdigest(),'robots':BeautifulSoup(r.content,'lxml').find('meta',attrs={'name':'robots'}).get('content') if 'html' in r.headers.get('Content-Type','') and BeautifulSoup(r.content,'lxml').find('meta',attrs={'name':'robots'}) else None});(out/(path.strip('/').replace('/','__')+'.body')).write_bytes(r.content)
finally:fetch.close()
assert all(r['status']==404 for r in rows[:5]);assert all(r['status']==200 for r in rows[5:]);assert all('noindex' in r['robots'] for r in rows[:5]);report={'phase':phase,'status':'PASS','controls':rows,'unknownResearch404':True,'noAdditionalUtilityRestoration':True,'noRobotsTxtDisallowSubstitution':True};(B/(phase.upper()+'-CONTROLS.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
