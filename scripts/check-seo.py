"""Check the rendered public routes, crawler metadata, citations, and FAQ markup.
Run against a local preview: python3 scripts/check-seo.py http://127.0.0.1:5173
"""
import json
import re
import sys
import urllib.request
import http.cookiejar
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlsplit

urllib.request.install_opener(urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar())))

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5173'

def fetch(path):
    with urllib.request.urlopen(base + path) as response:
        assert response.status == 200, path
        return response.read().decode()

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.tags=[]
        self.data=[]
        self.jsonld=[]
        self.script=None
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        self.tags.append((tag,a))
        if tag == 'script': self.script=[] if a.get('type') == 'application/ld+json' else False
    def handle_data(self, data):
        if isinstance(self.script,list): self.script.append(data)
        elif self.script is None: self.data.append(data)
    def handle_endtag(self, tag):
        if tag == 'script':
            if isinstance(self.script,list): self.jsonld.extend([json.loads(''.join(self.script))])
            self.script=None

xml=ET.fromstring(fetch('/sitemap.xml'))
urls=[el.text for el in xml.findall('{*}url/{*}loc')]
assert len(urls)>=19 and len(set(urls))==len(urls), urls
assert all(url.startswith('https://pepsanon.com/') for url in urls)
assert 'Sitemap: https://pepsanon.com/sitemap.xml' in fetch('/robots.txt')
titles=set()
descriptions=set()
for url in urls:
    path=urlsplit(url).path
    html=fetch(path)
    page=Page(html)
    head=Page(html.split('</head>')[0])
    canon=[a['href'] for tag,a in head.tags if tag=='link' and a.get('rel')=='canonical']
    assert len(canon)==1 and canon[0].rstrip('/')==url.rstrip('/'), (path,'canonical missing from head',canon)
    meta={a.get('name',a.get('property')):a.get('content') for tag,a in head.tags if tag=='meta'}
    assert meta.get('description'), (path,'description')
    assert meta['description'] not in descriptions, (path,'duplicate description')
    descriptions.add(meta['description'])
    assert meta.get('og:url','').rstrip('/')==url.rstrip('/') and meta.get('twitter:card')=='summary', path
    assert meta.get('google-site-verification')=='PfJNIh5q7mZYFOvvg9IBbmnzPXv-eK5-uFhWLtCjQyM', path
    assert 'noindex' not in meta.get('robots',''), path
    title=re.search(r'<title>(.*?)</title>',html).group(1)
    assert title not in titles, (path,'duplicate title')
    titles.add(title)
    assert len([tag for tag,a in page.tags if tag=='h1'])==1, path
    ids=[a['id'] for tag,a in page.tags if 'id' in a]
    assert len(ids)==len(set(ids)), (path,'duplicate ids')
    citations=[int(a['href'][5:]) for tag,a in page.tags if tag=='a' and re.fullmatch(r'#ref-\d+',a.get('href',''))]
    first=list(dict.fromkeys(citations))
    assert first==list(range(1,len(first)+1)), (path,'citation order',first)
    assert all(f'ref-{number}' in ids for number in citations), (path,'missing reference')
    for tag,a in page.tags:
        href=a.get('href','')
        if href.startswith('#') and len(href)>1:
            assert href[1:] in ids, (path,'broken anchor',href)
    schemas=[item for block in page.jsonld for item in (block if isinstance(block,list) else [block])]
    if path.startswith('/stacks/'):
        faq=next(item for item in schemas if item.get('@type')=='FAQPage')
        accordion_ids=[a['id'] for tag,a in page.tags if tag=='details' and 'rgbc-faq-item' in a.get('class','').split()]
        assert len(faq['mainEntity'])==len(accordion_ids)>0, (path,'FAQ accordion/schema mismatch')
        labels=['Overview','Ingredients','Why combine them?','Combination benefits','Safety & interactions','Forms & dosing','FAQs','Evidence','References']
        targets=['overview','ingredients','rationale','benefits','safety','forms-dosing','answers','evidence','studies']
        nav=Page(re.search(r'<nav aria-label="On this page">(.*?)</nav>',html,re.S).group(1))
        assert [a['href'] for tag,a in nav.tags if tag=='a']==['#'+id for id in targets], (path,'stack navigation')
        assert ' '.join(nav.data)==' '.join(labels), (path,'stack labels')
        overview=Page(re.search(r'<section id="overview">(.*?)</section>',html,re.S).group(1))
        assert len([tag for tag,a in overview.tags if tag=='p'])==1, (path,'prose overview')
        assert not any(tag in ['ul','ol','table','details'] for tag,a in overview.tags), (path,'overview format')
        legacy={
            'wolverine-stack':['combination','identity','interpretation','dose','bpc-alone','blend','glow-difference'],
            'glow-stack':['skin','recovery','comparison','dose','contents','hair','klow'],
            'klow-stack':['kpv','comparison','gut','dose','contents','ibd','choice'],
            'cjc-1295-ipamorelin':['hormones','dac','synergy','dose','sleep','muscle','no-dac'],
        }
        assert all(id in ids for id in legacy[path.rsplit('/',1)[1]]), (path,'legacy fragment missing')
        visible=' '.join(re.sub(r'\[\d+\]','', ''.join(page.data)).split())
        for item in faq['mainEntity']:
            assert item['name'] in visible, (path,'FAQ question mismatch')
            assert item['acceptedAnswer']['text'] in visible, (path,'FAQ answer mismatch')
        assert any(item.get('@type')=='Article' for item in schemas), path
    print('PASS',path,'citations',len(citations))
for path in ['/search?q=wolverine','/login','/profile']:
    page=Page(fetch(path))
    assert any(tag=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for tag,a in page.tags), path
print(f'PASS: {len(urls)} sitemap URLs; metadata in head; unique titles/descriptions; valid JSON-LD; citation order; FAQ parity; private pages excluded.')
