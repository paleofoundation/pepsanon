from pathlib import Path
import json,hashlib,subprocess,copy
P=Path(__file__).resolve().parent;R=P.parents[2];B='f95b72672fedfe09fdb2937a082022b1302768ac';H='c1e7e7e5a22b4820ae874ac121f9eeb7a8b107f1';file='lib/data/glossary-index.json';sha=lambda b:hashlib.sha256(b).hexdigest()
def show(ref,path):return subprocess.check_output(['git','-C',str(R),'show',ref+':'+path])
a=show(B,file);b=show(H,file);x=json.loads(a);y=json.loads(b);assert isinstance(x,list) and len(x)==len(y)==54;canonical=json.loads(show(B,'lib/data/glossary.json'));cjc={k:canonical['sources']['cjc'][k] for k in ['title','url']};cjc={'id':'cjc',**cjc};changed=[]
for old,new in zip(x,y):
 expected=copy.deepcopy(old)
 if old['slug'] in ['auc','cmax','tmax']:
  assert all(s['id']!='cjc' for s in expected['sources']);expected['sources'].append(cjc);changed.append(old['slug'])
 assert new==expected,old['slug']
assert set(changed)=={'auc','cmax','tmax'}
patch=show(B,'research/batches/FILL-THIN-PEP-4-20261027/UNAPPLIED-INHERITED-INDEX.patch');assert sha(patch)=='05deb1890efe167046ca217f57cca0978bf613ed8093197b381f3520fc1f9984';assert subprocess.check_output(['git','-C',str(R),'diff',B,H,'--',file])==patch
assert subprocess.check_output(['git','-C',str(R),'diff','--name-only',B,H]).decode().splitlines()==[file]
assert (R/file).read_bytes()==b
allfiles=subprocess.check_output(['git','-C',str(R),'ls-tree','-r','--name-only',B]).decode().splitlines();others=[f for f in allfiles if f!=file];assert len(others)==973
for f in others:assert show(B,f)==show(H,f),f
out={'status':'PASS','base':B,'firstCommit':H,'changedIds':changed,'onlyExistingCjcReferenceProjectionAdded':True,'allDefinitionsUnchanged':True,'allOther51IndexObjectsUnchanged':True,'all973OtherTrackedFilesByteIdenticalBetweenCommits':True,'beforeSha256':sha(a),'afterSha256':sha(b),'exactGrantedPatchSha256':sha(patch),'noSourceCreation':True,'noNewClaims':True,'noNewNumericalClaims':True};(P/'INDEX-GRANT-VERIFIED.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
