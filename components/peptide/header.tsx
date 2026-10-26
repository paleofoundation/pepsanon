'use client';
import {focusStacks} from '@/lib/focus-pages';
import {useState} from 'react';
import {Menu,BookOpen,Bookmark} from 'lucide-react';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetTrigger} from '@/components/ui/sheet';
import {NavigationMenu,NavigationMenuContent,NavigationMenuItem,NavigationMenuLink,NavigationMenuList,NavigationMenuTrigger} from '@/components/ui/navigation-menu';
import {peptides,categories} from '@/lib/peptides';
import {AccountMenu,useAccount} from './account';
import {SearchBox,SearchDialog} from './search';

const researchLinks=[{href:'/glossary',title:'Peptide glossary',description:'Definitions and research context for unfamiliar terms.'},{href:'/questions',title:'Questions & answers',description:'Start with a question from the community.'},{href:'/sources',title:'Studies & references',description:'Explore the sources behind the guides.'},{href:'/methodology',title:'Evidence guide',description:'Understand grades and research limitations.'}];
const glossaryGroups=[{title:'Peptide basics',terms:[['Peptide','peptide'],['Amino acid','amino-acid'],['Receptor agonist','receptor-agonist']]},{title:'Read a study',terms:[['Randomized controlled trial','randomized-controlled-trial'],['Placebo','placebo'],['Endpoint','endpoint']]},{title:'Delivery & quality',terms:[['Half-life','half-life'],['Bioavailability','bioavailability'],['Purity','purity']]}];
const stackGroups=[
 {title:'Priority stacks',links:focusStacks.slice(0,10)},
 {title:'More combinations',links:focusStacks.slice(10,20)},
 {title:'Further research topics',links:focusStacks.slice(20)},
];
function StackGroups({close,menu=false}:{close?:()=>void;menu?:boolean}){
 return <div className="mega-peptide-groups mega-stack-groups">{stackGroups.map(group=><section key={group.title}>
  <h3>{group.title}</h3>{group.links.map(stack=>menu
   ? <NavigationMenuLink asChild key={stack.slug}><a href={`/stacks/${stack.slug}`} onClick={close}>{stack.name}</a></NavigationMenuLink>
   : <a key={stack.slug} href={`/stacks/${stack.slug}`} onClick={close}>{stack.name}</a>)}
 </section>)}</div>;
}
function PeptideGroups({close,menu=false}:{close?:()=>void;menu?:boolean}){return <div className="mega-peptide-groups">{categories.slice(1).map(category=><section key={category}><h3>{category}</h3>{peptides.filter(p=>p.category===category).map(p=>menu?<NavigationMenuLink asChild key={p.id}><a href={`/peptides/${p.id}`} onClick={close}>{p.name}</a></NavigationMenuLink>:<a key={p.id} href={`/peptides/${p.id}`} onClick={close}>{p.name}</a>)}</section>)}</div>;}
export function Header(){
 const [mobile,setMobile]=useState(false);const {user}=useAccount();
 return <header className="header pe-site-header"><div className="header__wrapper wrapper">
  <Sheet open={mobile} onOpenChange={setMobile}><SheetTrigger asChild><button className="mobile-header-menu" aria-label="Open navigation"><Menu size={23}/></button></SheetTrigger><SheetContent side="left" className="mobile-navigation expanded-mobile-nav"><SheetHeader><SheetTitle>Peptides Anonymous</SheetTitle></SheetHeader><SearchBox compact onNavigate={()=>setMobile(false)}/><nav aria-label="Mobile navigation"><a href="/" onClick={()=>setMobile(false)}>Home</a><details open><summary>Peptides</summary><PeptideGroups close={()=>setMobile(false)}/><a className="mega-view-all" href="/peptides">All peptides</a></details><a href="/stacks" onClick={()=>setMobile(false)}>Peptide stacks</a><a href="/glossary" onClick={()=>setMobile(false)}>Glossary A–Z</a><details open><summary>Research</summary>{researchLinks.map(link=><a key={link.href} href={link.href} onClick={()=>setMobile(false)}>{link.title}</a>)}</details><a href={user?'/profile':'/login'} onClick={()=>setMobile(false)}><Bookmark size={17}/>{user?'My library':'Log in / create profile'}</a></nav></SheetContent></Sheet>
  <div className="header__logo"><a href="/" aria-label="Peptides Anonymous home"><img className="pepsanon-logo" src="/brand/pepsanon-logo.png" alt="Pepsanon · Peptides Anonymous" width={2172} height={724}/></a></div>
  <NavigationMenu viewport={false} className="peptide-navigation" aria-label="Main navigation"><NavigationMenuList>
   <NavigationMenuItem><NavigationMenuLink asChild><a className="pe-nav-direct" href="/">Home</a></NavigationMenuLink></NavigationMenuItem>
   <NavigationMenuItem><NavigationMenuTrigger>Peptides</NavigationMenuTrigger><NavigationMenuContent className="pe-mega-menu"><div className="mega-menu-heading"><div><p className="section-kicker">PEPTIDE LIBRARY</p><h2>Explore by research topic</h2></div><BookOpen size={25}/></div><PeptideGroups menu/><div className="mega-menu-footer"><NavigationMenuLink asChild><a href="/peptides">View all peptides</a></NavigationMenuLink><SearchBox compact/></div></NavigationMenuContent></NavigationMenuItem>
   <NavigationMenuItem><NavigationMenuLink asChild><a className="pe-nav-direct" href="/stacks">Stacks</a></NavigationMenuLink></NavigationMenuItem>
   <NavigationMenuItem><NavigationMenuTrigger>Research</NavigationMenuTrigger><NavigationMenuContent className="pe-mega-menu pe-research-menu"><p className="section-kicker">FOLLOW THE EVIDENCE</p><div className="mega-research-groups">{researchLinks.map(link=><NavigationMenuLink asChild key={link.href}><a href={link.href}><h3>{link.title}</h3><p>{link.description}</p></a></NavigationMenuLink>)}</div><div className="mega-menu-footer"><NavigationMenuLink asChild><a href="/search">Search all research</a></NavigationMenuLink><NavigationMenuLink asChild><a href="/profile">Open your saved library</a></NavigationMenuLink></div></NavigationMenuContent></NavigationMenuItem>
   <NavigationMenuItem><NavigationMenuTrigger>Glossary</NavigationMenuTrigger><NavigationMenuContent className="pe-mega-menu pe-glossary-menu"><div className="mega-menu-heading"><div><p className="section-kicker">UNDERSTAND THE TERMINOLOGY</p><h2>The peptide glossary</h2></div><BookOpen size={25}/></div><div className="glossary-mega-groups">{glossaryGroups.map(group=><section key={group.title}><h3>{group.title}</h3>{group.terms.map(([label,slug])=><NavigationMenuLink asChild key={slug}><a href={`/glossary/${slug}`}>{label}</a></NavigationMenuLink>)}</section>)}</div><div className="mega-menu-footer"><NavigationMenuLink asChild><a href="/glossary">Browse the glossary A–Z</a></NavigationMenuLink><NavigationMenuLink asChild><a href="/glossary/peptide">New to peptides? Start here</a></NavigationMenuLink></div></NavigationMenuContent></NavigationMenuItem>
  </NavigationMenuList></NavigationMenu>
  <div className="header__actions"><SearchDialog/><AccountMenu/></div>
 </div></header>;
}
