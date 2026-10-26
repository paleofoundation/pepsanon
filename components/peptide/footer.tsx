import {ArrowRight,ArrowUpRight,BookOpen} from 'lucide-react';
import {InvestigatorFooter} from './authors';

const groups=[
  {title:'The library',links:[['Peptide directory','/peptides'],['Peptide glossary','/glossary'],['Peptide stacks','/stacks'],['Wolverine stack','/stacks/wolverine-stack'],['Research questions','/questions'],['Studies & references','/sources'],['My saved research','/profile']]},
  {title:'Explore peptides',links:[['BPC-157','/peptides/bpc-157'],['Semaglutide','/peptides/semaglutide'],['Tirzepatide','/peptides/tirzepatide'],['Collagen peptides','/peptides/collagen']]},
  {title:'About the research',links:[['How we grade evidence','/methodology#grading'],['Editorial standards','/methodology'],['Primary investigators','/methodology#investigators'],['Medical Disclaimer','/medical-disclaimer']]},
];

export function Footer() {
  return <footer className="site-footer">
    <div className="site-footer-main">
      <div className="site-footer-brand">
        <a href="/" aria-label="Peptides Anonymous home"><img src="/brand/pepsanon-logo.png" alt="Pepsanon · Peptides Anonymous" width={2172} height={724}/></a>
        <p>Understand the research behind the claims. Follow the questions, compare the evidence, and read the original studies.</p>
        <a className="site-footer-browse" href="/peptides"><BookOpen size={18} aria-hidden="true"/>Explore the library<ArrowRight size={18} aria-hidden="true"/></a>
      </div>
      <nav className="site-footer-navigation" aria-label="Footer navigation">
        {groups.map(group=><div className="site-footer-group" key={group.title}>
          <h2>{group.title}</h2>
          <ul>{group.links.map(([label,href])=><li key={href}><a href={href}>{label}</a></li>)}</ul>
        </div>)}
      </nav>
    </div>
    <div className="site-footer-people"><InvestigatorFooter/><a href="/methodology">Read our approach<ArrowUpRight size={17} aria-hidden="true"/></a></div>
    <div className="site-footer-bottom">
      <p>Educational research, not personal medical advice. Discuss treatment decisions with a qualified healthcare professional.</p>
      <div><span>© {new Date().getFullYear()} Peptides Anonymous</span><a href="/medical-disclaimer">Medical Disclaimer</a><a href="#main">Back to top ↑</a></div>
    </div>
  </footer>;
}
