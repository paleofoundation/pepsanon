from pathlib import Path
import hashlib,json,sys,subprocess,re
B=Path(__file__).resolve().parent;R=B.parents[2];phase=sys.argv[1];assert phase in ['parity','final'];sha=lambda b:hashlib.sha256(b).hexdigest();frozen=json.loads((B/'FROZEN-BASE-FILES.json').read_text());expected=json.loads((B/'UNAPPLIED-PARITY-V2-FILES.json').read_text())
unchanged=[]
for name,h in frozen.items():
 p=R/name
 if name=='components/peptide/shell.tsx':assert sha(p.read_bytes())==expected[name]
 else:assert sha(p.read_bytes())==h,name+' base file changed';unchanged.append(name)
expected['lib/data/restored-research-previews.json']=hashlib.sha256((B/'PARITY-CANDIDATE-V2-CORRECTED-LINKS.json').read_bytes()).hexdigest()
new=[n for n in expected if n not in frozen]
for name in new:
 if phase=='final' and name=='components/peptide/restored-research-preview.tsx':continue
 assert sha((R/name).read_bytes())==expected[name],name+' parity file differs from exact grant'
if phase=='final':
 assert sha((R/'components/peptide/restored-research-preview.tsx').read_bytes())==json.loads((B/'FINAL-EXPECTED-FILES-V2.json').read_text())['components/peptide/restored-research-preview.tsx']
 c=json.loads((B/'FILL-CANDIDATE-V2-CORRECTED-LINKS.json').read_text());public=json.loads((R/'lib/data/restored-research-context.json').read_text());want=[{k:r[k] for k in ['id','paperId','text','sourceUrl','locator']} for r in c['paragraphs']];assert public==want
 assert len(public)==35 and len({r['paperId'] for r in public})==5
frozenPackets=json.loads((B/'FROZEN-PRIOR-PEP-PACKETS.json').read_text());assert len(frozenPackets)==409
for n,h in frozenPackets.items():assert sha((R/n).read_bytes())==h
allowed=set(expected)|({'lib/data/restored-research-context.json'} if phase=='final' else set());changed=subprocess.check_output(['git','-C',str(R),'diff','--name-only','a19ffa74acfa2e678360c4e05c8ccf74ae7e8401'],text=True).splitlines()
assert all(n in allowed or n.startswith('research/batches/FILL-PEP-RESTORE-1-20261027/') for n in changed),changed
for n in allowed:
 p=R/n
 if not p.exists():continue
 assert b'\r' not in p.read_bytes(),n+' CRLF'
 assert not re.search('[\u2013\u2014]',p.read_text()),n+' added public em/en'
report={'status':'PASS','phase':phase,'base':'a19ffa74acfa2e678360c4e05c8ccf74ae7e8401','oldTrackedFilesExactExceptExactShellPredicate':len(unchanged),'priorPacketFilesExact':len(frozenPackets),'shellExactGrantedHash':expected['components/peptide/shell.tsx'],'newParityFiles':new,'publicSourceAndGlossaryDataUnchanged':True,'indexSitemapNavigationCountsUnchanged':True,'newPublicDashes':0,'release':False};(B/(('CORRECTED-PARITY' if phase=='parity' else 'FINAL')+'-PRESERVATION.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
