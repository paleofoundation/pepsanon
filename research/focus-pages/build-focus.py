"""Build the owner's requested page inventory; evidence comes from local records only."""
from pathlib import Path
import json

root=Path(__file__).resolve().parents[2]
corpus=root.parent/'corpus/peptides-primary'
records=json.loads((corpus/'records.json').read_text())
by_id={r['id']:r for r in records}
peptide_rows=[
('tirzepatide','Tirzepatide',''),('semaglutide','Semaglutide',''),('bpc-157','BPC-157',''),
('retatrutide','Retatrutide',''),('ghk-cu','GHK-Cu',''),('tb-500','TB-500',''),('collagen','Collagen peptides',''),
('tesamorelin','Tesamorelin',''),('cjc-1295','CJC-1295',''),('ipamorelin','Ipamorelin',''),
('mots-c','MOTS-c','MOTS c MOTSc'),('sermorelin','Sermorelin',''),('pt-141','PT-141 / bremelanotide','bremelanotide PT141'),
('cagrilintide','Cagrilintide','CagriSema'),('ss-31','SS-31 / elamipretide','elamipretide SS31'),('kpv','KPV',''),
('semax','Semax',''),('selank','Selank',''),('epitalon','Epitalon / Epithalon','Epithalon'),
('thymosin-alpha-1','Thymosin alpha-1','thymosin alpha 1'),('aod-9604','AOD-9604','AOD9604'),
('melanotan-ii','Melanotan II','Melanotan 2'),('dsip','DSIP',''),('igf-1-lr3','IGF-1 LR3','IGF1 LR3'),
('ghrp-2','GHRP-2','GHRP2'),('ghrp-6','GHRP-6','GHRP6'),('kisspeptin-10','Kisspeptin-10','kisspeptin 10'),
('oxytocin','Oxytocin',''),('ll-37','LL-37','LL37'),('hexarelin','Hexarelin','')]
stack_rows=[
('wolverine-stack','Wolverine stack',['bpc-157','tb-500']),
('cjc-1295-ipamorelin','CJC-1295 + ipamorelin',['cjc-1295','ipamorelin']),
('glow-stack','GLOW stack',['bpc-157','tb-500','ghk-cu']),
('klow-stack','KLOW stack',['bpc-157','tb-500','ghk-cu','kpv']),
('tesamorelin-ipamorelin','Tesamorelin + ipamorelin',['tesamorelin','ipamorelin']),
('semaglutide-cagrilintide','Semaglutide + cagrilintide / CagriSema',['semaglutide','cagrilintide']),
('semax-selank','Semax + Selank',['semax','selank']),
('sermorelin-ipamorelin','Sermorelin + ipamorelin',['sermorelin','ipamorelin']),
('retatrutide-cagrilintide','Retatrutide + cagrilintide',['retatrutide','cagrilintide']),
('mots-c-ss-31','MOTS-c + SS-31',['mots-c','ss-31']),
('bpc-157-kpv','BPC-157 + KPV',['bpc-157','kpv']),
('tesamorelin-cjc-1295-ipamorelin','Tesamorelin + CJC-1295 + ipamorelin',['tesamorelin','cjc-1295','ipamorelin']),
('tirzepatide-cagrilintide','Tirzepatide + cagrilintide',['tirzepatide','cagrilintide']),
('tesamorelin-aod-9604','Tesamorelin + AOD-9604',['tesamorelin','aod-9604']),
('tesamorelin-mots-c','Tesamorelin + MOTS-c',['tesamorelin','mots-c']),
('aod-9604-mots-c','AOD-9604 + MOTS-c',['aod-9604','mots-c']),
('mots-c-nad','MOTS-c + NAD+',['mots-c','nad']),
('mots-c-ss-31-nad','MOTS-c + SS-31 + NAD+',['mots-c','ss-31','nad']),
('bpc-157-tb-500-kpv','BPC-157 + TB-500 + KPV',['bpc-157','tb-500','kpv']),
('bpc-157-tb-500-cjc-1295-ipamorelin','BPC-157 + TB-500 + CJC-1295 + ipamorelin',['bpc-157','tb-500','cjc-1295','ipamorelin']),
('cjc-1295-ipamorelin-ghk-cu','CJC-1295 + ipamorelin + GHK-Cu',['cjc-1295','ipamorelin','ghk-cu']),
('ghk-cu-epitalon','GHK-Cu + Epitalon',['ghk-cu','epitalon']),
('epitalon-thymalin','Epitalon + thymalin',['epitalon','thymalin']),
('dsip-ipamorelin','DSIP + ipamorelin',['dsip','ipamorelin']),
('pt-141-oxytocin','PT-141 + oxytocin',['pt-141','oxytocin']),
('tirzepatide-tesamorelin','Tirzepatide + tesamorelin',['tirzepatide','tesamorelin']),
('retatrutide-mots-c','Retatrutide + MOTS-c',['retatrutide','mots-c']),
('retatrutide-tirzepatide','Retatrutide + tirzepatide',['retatrutide','tirzepatide']),
('semaglutide-b12','Semaglutide + B12',['semaglutide','b12']),
('tirzepatide-b12','Tirzepatide + B12',['tirzepatide','b12'])]
signal_urls=['https://america1stpeptides.com/top-sellers/']*4+[
'https://optides.com/shop','https://biocuralabs.com/products/klow-stack/','https://www.perxpeptides.com/stacks',
'https://peptide-medix.com/products/sermorelin-ipamorelin/','https://celvarislabs.com/product/retatrutide-cagrilintide-blend-12-5mg/',
'https://pepdaddylabs.com/pages/stacks/mitochondrial-signaling','https://peptide-medix.com/products/bpc-157-kpv/',
'https://peptide-warehouse.com/peptides/','https://www.reddit.com/r/Retatrutide/comments/1tuzjhr/reta_7_months_in_my_experience_with_stacking_tirz/',
'https://www.getoam.com/stacks','https://formblends.com/products','https://www.perxpeptides.com/stacks',
'https://www.reddit.com/r/Biohacking/comments/1sq2nxd/motsc_nad_without_ss31/','https://quietlabsresearch.com/product/mito-stack/',
'https://formblends.com/products','https://www.reddit.com/r/CleanHealth/comments/1vp5gku/peptide_bundles_4packs_worth_buying/',
'https://www.getoam.com/stacks','https://www.perxpeptides.com/stacks','https://igetpeptides.com/shop?category=blends',
'https://www.getoam.com/stacks','https://www.getoam.com/stacks','https://www.getoam.com/stacks',
'https://www.reddit.com/r/Retatrutide/comments/1jkumhp/best_stack_with_reta/','https://www.reddit.com/r/Retatrutide/comments/1j4213g/stack_tirzepatide_and_retatrutide/',
'https://pharmalabs.com/wp-content/uploads/2025/07/Semaglutide_Cyanocobalamin-2.5mg_0.5mg_mL-Subcutaneous-Injection.pdf',
'https://pharmalabs.com/wp-content/uploads/2025/07/Tirzepatide-10-mg_mL-and-Cyanocobalamin-0.5-mg_mL-Subcutaneous-Injection.pdf']
existing={'bpc-157','tb-500','cjc-1295','ipamorelin','ghk-cu','collagen','semaglutide','tirzepatide'}
links={r['id']:[r['peptide']] for r in records if r['peptide'] in existing}
for r in records:
 if r['peptide']=='therapeutic-tesamorelin':links[r['id']]=['tesamorelin']
 if r['peptide']=='therapeutic-oxytocin':links[r['id']]=['oxytocin']
for rid in ['packet-dd6f3ed26698e97a','packet-7717796263d5c13d','packet-d9f0412cd755edc4','packet-16b254fd86589b05','packet-d5ca15bf3f6c55bb','packet-6cb2448d726a2290','packet-7b4942378726baa7','packet-4f701e40cde669df']:
 links[rid]=['kisspeptin-10']
for rid in ['packet-01d6bd658bc55441','packet-4233261b0609dc24']:links[rid]=['ll-37']
names={i:n.split(' / ')[0] for i,n,_ in peptide_rows}|{'nad':'NAD+','b12':'B12','thymalin':'Thymalin'}
focus={'peptides':[{'id':i,'name':n,'aliases':a,'priority':p,'existing':i in existing} for p,(i,n,a) in enumerate(peptide_rows,1)],
       'stacks':[{'slug':s,'name':n,'priority':p,'ingredients':[{'id':i,'name':names[i],'hasPage':i in names and i not in {'nad','b12','thymalin'}} for i in ids], 'existing':s in {'wolverine-stack','cjc-1295-ipamorelin','glow-stack','klow-stack'}} for p,(s,n,ids) in enumerate(stack_rows,1)]}
def write(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
write(root/'lib/data/focus-pages.json',focus)
write(root/'lib/data/corpus-page-links.json',links)
write(root/'research/focus-pages/requested-inventory.json',{'source':'User-provided focus list. Signal links retained for provenance only; not visited or used as clinical evidence.','rows':[{'priority':p,'peptide':peptide_rows[p-1][1],'stack':stack_rows[p-1][1],'signal_url':u} for p,u in enumerate(signal_urls,1)]})
selections={
 'tesamorelin':[('packet-6783b2265ab56bf2','what_it_measured',0,'Study question'),('packet-6783b2265ab56bf2','endpoint',1,'Primary endpoint'),('packet-6783b2265ab56bf2','dose',0,'Study dose and route'),('packet-6783b2265ab56bf2','reported_results',2,'Glucose observation'),('packet-8e5b1766be35abe7','endpoint',0,'Muscle imaging study')],
 'kisspeptin-10':[('packet-7717796263d5c13d','endpoint',1,'Hormones measured'),('packet-7717796263d5c13d','dose',0,'Study dose and route'),('packet-7717796263d5c13d','reported_results',0,'Reported hormone response')],
 'oxytocin':[('packet-966d4212f3dcdb1f','dose',0,'Population, dose and route'),('packet-966d4212f3dcdb1f','endpoint',1,'Primary outcome'),('packet-966d4212f3dcdb1f','reported_results',0,'Overall result and subgroup finding')],
 'll-37':[('packet-4233261b0609dc24','dose',0,'Laboratory exposure'),('packet-4233261b0609dc24','reported_results',4,'Biofilm experiment'),('packet-01d6bd658bc55441','dose',0,'Cell experiment')],
}
evidence={}
for peptide,items in selections.items():
 evidence[peptide]=[dict(by_id[rid][field][idx],recordId=rid,label=label) for rid,field,idx,label in items]
write(root/'lib/data/focus-evidence.json',evidence)
write(root/'research/focus-pages/evidence-selections.json',selections)
write(root/'research/focus-pages/coverage.json',{'peptide_pages':len(peptide_rows),'stack_pages':len(stack_rows),'record_counts':{i:sum(i in ids for ids in links.values()) for i,_,_ in peptide_rows},'missing_study_records':[i for i,_,_ in peptide_rows if not any(i in ids for ids in links.values())],'mapping_note':'Kisspeptin-10 links only experiments administering that form; LL-37 links only papers measuring LL-37. Other topic records remain filed under their MANIFEST topics. Endotoxin stays a quality record.'})
print('Generated requested inventory, explicit record mapping and exact-source excerpts.')
