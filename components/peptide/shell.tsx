'use client';
import {usePathname} from 'next/navigation';
import {useState,useEffect} from 'react';
import {BookOpen,Search,MessagesSquare,ChartNoAxesColumnIncreasing,Library,Menu,ChevronDown,ArrowLeft,ArrowRight,Info,FileText} from 'lucide-react';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger} from '@/components/ui/sheet';
import {InvestigatorFooter} from './authors';
import {Header} from './header';
import {peptides,questions,relatedPeptideIds} from '@/lib/peptides';
// Page links deliberately use native anchors: document navigation also works
// when the embedded browser cannot complete a client-side route transition.
const navigation=[{href:'/peptides',label:'Peptides',icon:BookOpen},{href:'/questions',label:'FAQs',icon:MessagesSquare},{href:'/methodology',label:'Evidence guide',icon:ChartNoAxesColumnIncreasing},{href:'/sources',label:'References',icon:Library}];
export type NavSection={id:string;label:string;children?:{id:string;label:string}[]};
function SectionLinks({sections,close}:{sections:NavSection[];close?:()=>void}){const [expanded,setExpanded]=useState<string[]>([]);const [active,setActive]=useState(sections[0]?.id||'');useEffect(()=>{const ids=sections.flatMap(s=>[s.id,...(s.children||[]).map(c=>c.id)]);const update=()=>{let next=ids[0]||'';ids.forEach(id=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=160)next=id});setActive(next)};update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)},[sections]);return <div className="post-content__list post-sidebar">{sections.map((s,i)=><div key={s.id}><div className={`post-content__item post-content__item--h2${s.children?.length?' plus':''}${expanded.includes(s.id)?' active':''}`}><span className="post-content__title"><a className={`post-content__link${active===s.id?' post-content__link--active':''}`} href={`#${s.id}`} onClick={e=>{if(s.children?.length){setExpanded(a=>a.includes(s.id)?a.filter(x=>x!==s.id):[...a,s.id]);if(close)e.preventDefault();}else close?.()}}>{i===0?<Info size={19}/>:s.id==='answers'?<MessagesSquare size={19}/>:s.id==='studies'?<FileText size={19}/>:s.id==='evidence'?<ChartNoAxesColumnIncreasing size={19}/>:<BookOpen size={19}/>}<span>{s.label}</span></a></span></div>{s.children?.map(c=><div key={c.id} className={`post-content__item post-content__item--h3${expanded.includes(s.id)?' active':''}`}><span className="post-content__title"><a className={`post-content__link${active===c.id?' post-content__link--active':''}`} href={`#${c.id}`} onClick={close}>{c.label}</a></span></div>)}</div>)}</div>}
export function SectionSidebar({sections}:{sections:NavSection[]}){const [collapsed,setCollapsed]=useState(false);const [mobile,setMobile]=useState(false);return <><aside className={`research-content__left peptide-section-sidebar${collapsed?' is-collapsed':''}`}><div className="research-content__left-menu"><button type="button" className="research-content__left-btn" aria-label={collapsed?'Expand sidebar':'Collapse sidebar'} aria-expanded={!collapsed} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<ArrowRight/>:<ArrowLeft/>}</button>{!collapsed&&<nav aria-label="On this page"><SectionLinks sections={sections}/></nav>}</div></aside><div className="mobile-section-bar"><Sheet open={mobile} onOpenChange={setMobile}><SheetTrigger asChild><button><Menu size={17}/> On this page <ChevronDown size={15}/></button></SheetTrigger><SheetContent side="left" className="mobile-navigation" onCloseAutoFocus={e=>{const target=document.getElementById(decodeURIComponent(window.location.hash.slice(1)));if(target){e.preventDefault();requestAnimationFrame(()=>target.scrollIntoView({block:"start"}));}}}><SheetHeader><SheetTitle>On this page</SheetTitle></SheetHeader><SectionLinks sections={sections} close={()=>setMobile(false)}/></SheetContent></Sheet></div></>}
export function ResearchRail({peptideId}:{peptideId?:string}) {
 const [collapsed,setCollapsed]=useState(false);
 const ids=peptideId?(relatedPeptideIds[peptideId]||[]):['bpc-157','semaglutide','collagen'];
 const related=ids.flatMap(id=>{const peptide=peptides.find(p=>p.id===id);return peptide?[peptide]:[]});
 const concepts=peptideId
  ? questions.filter(q=>q.peptideId===peptideId).slice(0,3).map(q=>({href:`/peptides/${q.peptideId}#${q.id}`,label:q.outcome}))
  : [{href:'/methodology#grading',label:'Evidence certainty'},{href:'/sources',label:'Primary research and community questions'}];
 return <aside aria-label="Related research" className={`research-content__right related-research-panel${collapsed?' rail-collapsed':''}`}>
  <div className="research-content__left-menu">
   <button type="button" className="research-content__left-btn" aria-label={collapsed?'Expand related content':'Collapse related content'} aria-expanded={!collapsed} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<ArrowLeft/>:<ArrowRight/>}</button>
   <div className="related-panel-content">
    <nav className="related-research-links" aria-label={peptideId?'Related peptides':'Explore peptides'}>
     <h2>{peptideId?'Related peptides':'Explore peptides'}</h2>
     <ul>{related.map(p=><li key={p.id}><a href={`/peptides/${p.id}`}><span>{p.name}</span><small>{p.focus}</small></a></li>)}</ul>
    </nav>
    <nav className="related-research-links" aria-label="Related concepts">
     <h2>Related concepts</h2>
     <ul>{concepts.map(c=><li key={c.href}><a href={c.href}>{c.label}</a></li>)}</ul>
    </nav>
    <div className="research-content__right-actions"><a className="btn btn--full btn--outline" href="/methodology#grading">How we grade evidence</a><div className="research-content__right-banner"><h3>Understand the evidence</h3><p>Grades apply to a specific outcome, population, and formulation.</p><div className="research-content__right-banner-note"><a href="/methodology">Read our method</a> to see what each assessment can and cannot tell you.</div></div></div>
   </div>
  </div>
 </aside>
}
function LibrarySidebar(){const path=usePathname();return <aside className="research-content__left library-sidebar"><div className="research-content__left-menu"><nav aria-label="Library navigation"><div className="post-content__list post-sidebar">{navigation.map(n=><div key={n.href} className="post-content__item post-content__item--h2"><span className="post-content__title"><a className={`post-content__link${path===n.href?' post-content__link--active':''}`} href={n.href}><n.icon size={19}/>{n.label}</a></span></div>)}</div><div className="library-sidebar-peptides">{peptides.map(p=><a href={`/peptides/${p.id}`} key={p.id}>{p.name}</a>)}</div></nav></div></aside>}
export function Shell({children}:{children:React.ReactNode}){const path=usePathname();const article=path.startsWith('/peptides/');const fullWidth=['/','/search','/profile','/login','/medical-disclaimer'].includes(path);return <><a href="#main" className="skip-link">Skip to content</a><Header/><main id="main" className="site-content">{article||fullWidth?children:<div className="research-content utility-layout"><div className="research-content__wrapper"><LibrarySidebar/><div className="research-content__center utility-content">{children}</div><ResearchRail/></div></div>}</main><footer className="peptide-footer"><div><a className="footer-wordmark" href="/" aria-label="Pepsanon home"><img className="pepsanon-logo pepsanon-logo--footer" src="/brand/pepsanon-logo.png" alt="Pepsanon · Peptides Anonymous" width={2172} height={724}/></a><p className="brand-domain-label">pepsanon.com</p><p>Questions from the community. Answers from the research.</p><p>Educational research summaries. Not personalized medical advice.</p></div><InvestigatorFooter/><nav aria-label="Footer navigation"><a href="/methodology">Editorial standards</a><a href="/sources">Research sources</a><a href="/medical-disclaimer">Medical Disclaimer</a></nav></footer></>}
