import argparse,csv,datetime as dt,hashlib,importlib.util,json,re,sys,threading,time
from pathlib import Path
from urllib import robotparser
from urllib.parse import urlparse,urljoin
from concurrent.futures import ThreadPoolExecutor
HERE=Path(__file__).resolve().parent
import requests
spec=importlib.util.spec_from_file_location('thin_audit',HERE/'thin_audit.py');ad=importlib.util.module_from_spec(spec);spec.loader.exec_module(ad)
UA=ad.UA
def utc():return dt.datetime.now(dt.timezone.utc).isoformat()
def sha(b):return hashlib.sha256(b).hexdigest()
def dump(p,x):p.write_text(json.dumps(x,indent=2)+'\n')
class PolicyBlocked(Exception):pass
class SafeFetcher:
 def __init__(self,host,out):
  self.host=host;self.out=out;self.local=threading.local();self.lock=threading.RLock();self.robots={};self.events=[];self.attempts=0;self.stopped=False
  self.journal=(out/'requests.jsonl').open('w');self.exceptions=(out/'coverage-events.jsonl').open('w')
 def event(self,**x):
  with self.lock:self.events.append(x);self.exceptions.write(json.dumps(dict(time=utc(),**x))+'\n');self.exceptions.flush()
 def sess(self):
  if not hasattr(self.local,'sess'):
   self.local.sess=requests.Session();self.local.sess.trust_env=False;self.local.sess.headers.update({'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5'})
  return self.local.sess
 def raw(self,u,stage,delay=.25):
  last=None
  for attempt in range(3):
   time.sleep(max(.25,delay));start=time.time()
   try:
    r=self.sess().get(u,timeout=25,allow_redirects=False)
    rec=dict(time=utc(),method='GET',url=u,stage=stage,attempt=attempt+1,status=r.status_code,content_type=r.headers.get('Content-Type',''),bytes=len(r.content),sha256=sha(r.content),elapsed_seconds=round(time.time()-start,3),location=r.headers.get('Location',''),x_robots_tag=r.headers.get('X-Robots-Tag',''))
    with self.lock:self.attempts+=1;self.journal.write(json.dumps(rec)+'\n');self.journal.flush()
    if r.status_code in (429,503) and attempt<2:
     wait=r.headers.get('Retry-After','');time.sleep(min(int(wait) if wait.isdigit() else 5*(attempt+1),30));continue
    return r
   except requests.RequestException as e:
    last=e
    with self.lock:self.attempts+=1;self.journal.write(json.dumps(dict(time=utc(),method='GET',url=u,stage=stage,attempt=attempt+1,status=0,error=str(e),elapsed_seconds=round(time.time()-start,3)))+'\n');self.journal.flush()
    time.sleep(1.5*(attempt+1))
  raise last
 def policy(self,u):
  p=urlparse(u);origin=p.scheme+'://'+p.netloc
  with self.lock:
   if origin in self.robots:return self.robots[origin]
   ru=origin+'/robots.txt';entry=dict(url=ru,status=None,allowed=False,reason='',sitemaps=[],delay=.25)
   # Hold lock during the single robots fetch so workers cannot race it.
   try:
    current=ru;seen=set()
    for _ in range(11):
     if current in seen:raise PolicyBlocked('robots redirect loop')
     seen.add(current)
     if ad.norm_host(urlparse(current).hostname)!=self.host:raise PolicyBlocked('robots redirect outside same site')
     rr=self.raw(current,'robots')
     if rr.status_code in (301,302,303,307,308):current=urljoin(current,rr.headers.get('Location',''));continue
     break
    else:raise PolicyBlocked('robots redirect limit')
    entry.update(status=rr.status_code,final_url=rr.url,sha256=sha(rr.content))
    (self.out/'robots').mkdir(exist_ok=True)
    (self.out/'robots'/(sha(origin.encode())[:12]+'.txt')).write_bytes(rr.content)
    if rr.status_code==200:
     if 'html' in rr.headers.get('Content-Type','').lower() or rr.content.lstrip().lower().startswith((b'<!doctype html',b'<html')):raise PolicyBlocked('robots returned HTML')
     rp=robotparser.RobotFileParser();rp.parse(rr.text.splitlines());entry.update(allowed=True,rp=rp,sitemaps=[x.split(':',1)[1].strip() for x in rr.text.splitlines() if x.lower().startswith('sitemap:')])
     cd=rp.crawl_delay(UA) or rp.crawl_delay('*');entry['delay']=max(.25,float(cd or 0))
     rate=rp.request_rate(UA) or rp.request_rate('*')
     if rate and rate.requests:entry['delay']=max(entry['delay'],rate.seconds/rate.requests)
    elif rr.status_code in (404,410):entry.update(allowed=True,reason='robots absent (404/410)')
    else:entry['reason']='robots status '+str(rr.status_code)+' (fail closed)'
   except Exception as e:entry['reason']='robots unavailable: '+str(e)
   self.robots[origin]=entry
   if not entry['allowed']:self.event(kind='robots_block',url=origin,reason=entry['reason'])
   dump(self.out/'robots-policy.json',{k:{a:b for a,b in v.items() if a!='rp'} for k,v in self.robots.items()})
   return entry
 def get(self,u,stage='page'):
  current=u;seen=set()
  for _ in range(11):
   p=urlparse(current)
   if p.scheme not in ('https','http') or ad.norm_host(p.hostname)!=self.host:
    self.event(kind='external_redirect_or_discovery',url=u,target=current,stage=stage);raise PolicyBlocked('outside-same-site target: '+current)
   if current in seen:raise PolicyBlocked('redirect loop')
   seen.add(current);pol=self.policy(current)
   if not pol['allowed']:raise PolicyBlocked(pol['reason'])
   if pol.get('rp') and not pol['rp'].can_fetch(UA,current):
    self.event(kind='robots_disallowed',url=u,target=current,stage=stage);raise PolicyBlocked('robots-disallowed: '+current)
   r=self.raw(current,stage,pol['delay'])
   if r.status_code in (301,302,303,307,308):
    current=urljoin(current,r.headers.get('Location',''));continue
   return r
  raise PolicyBlocked('redirect limit')
 def close(self):self.journal.close();self.exceptions.close()

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--origin',required=True);ap.add_argument('--out',required=True);ap.add_argument('--urls',required=True);a=ap.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True);fetch=SafeFetcher(urlparse(a.origin).hostname,out)
 cfg=dict(exempt=set(ad.DEFAULT_EXEMPT.split(',')),min_words=400,max_thin_cites=2,claim_min_hits=3,claim_re=re.compile(ad.DEFAULT_CLAIM_RE,re.I),stub_re=re.compile(ad.DEFAULT_STUB_RE,re.I))
 urls=json.loads(Path(a.urls).read_text());records=[]
 def worker(target):
  path=urlparse(target).path;r=fetch.get(a.origin.rstrip('/')+path);file=path.strip('/').replace('/','_')+'.html';(out/file).write_bytes(r.content)
  response=type('Response',(),dict(content=r.content,text=r.text,status_code=r.status_code,headers=r.headers,url=target))()
  row=ad.analyze(target,response,cfg);row.update(local_request_url=r.url,html_file=file,html_sha256=sha(r.content));return row
 try:
  with ThreadPoolExecutor(max_workers=4) as pool:records=list(pool.map(worker,urls))
 finally:fetch.close()
 dump(out/'pages.json',records)
 with (out/'pages.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
 dump(out/'run.json',dict(status='COMPLETE',workers=4,delaySecondsPerWorker=.25,robots='fail-closed checked before every URL and redirect',analyzerSha256=sha((HERE/'thin_audit.py').read_bytes()),analysisOrigin='Local raw HTML analyzed with its intended public URL; response URL rebased only for canonical comparison. Not live verification.',requests=fetch.attempts,pages=len(records),sourceHtml='Unmodified response bytes'))
 print(json.dumps(dict(pages=len(records),scored=sum(x['status']==200 for x in records),out=str(out))))
if __name__=='__main__':main()
