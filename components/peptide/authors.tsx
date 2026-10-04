'use client';
import {useId} from 'react';
import {ExternalLink} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {authors, primaryInvestigators, contentCredits, type AuthorId, type Author} from '@/lib/authors';
import {referencesInOrder} from '@/lib/citation-order';

function Portrait({author, large=false}: {author:Author; large?:boolean}) {
  return <span className={`author-portrait${large?' author-portrait-large':''}`} data-author={author.id} aria-hidden="true">
    {author.photo ? <img src={author.photo} alt="" width={large?112:40} height={large?112:40}/> : <span>{author.initials}</span>}
  </span>;
}

export function AuthorBio({authorId, card=false, compact=false}: {authorId:AuthorId; card?:boolean; compact?:boolean}) {
  const author=authors[authorId];
  const refPrefix=useId();
  const biographySources=author.links.filter(link=>!link.url.includes('examine.com'));
  const bioSentences=author.bio.split(/(?<=[.!?])\s+(?=[A-Z])/);
  const bioIndices=authorId==='alex-leaf'?[[1],[1],[1],[0],[1]]:[[0],[0],[0],[0]];
  const backgroundIndices=author.background.map(item=>authorId==='alex-leaf'?(item.label==='Education'?[1]:[0]):[0]);
  const orderedSources=referencesInOrder([...bioSentences.flatMap((_,i)=>bioIndices[i]||[0]),...backgroundIndices.flat()].map(i=>biographySources[i]));
  const markers=(indices:number[])=>referencesInOrder(indices.map(i=>biographySources[i])).map(source=>orderedSources.findIndex(s=>s.url===source.url)+1).sort((a,b)=>a-b).map(number=><sup key={number}><a href={`#${refPrefix}-ref-${number}`} aria-label={`Biography reference ${number}`}>[{number}]</a></sup>);
  return <Dialog>
    <DialogTrigger asChild>
      <button className={card?'investigator-card':`author-button${compact?' author-button-compact':''}`} aria-label={`About ${author.name}`}>
        <Portrait author={author}/>
        <span className="author-button-text"><strong>{author.name}{!compact&&author.credentials&&<span className="author-credentials">, {author.credentials}</span>}</strong>
          {card ? <><span className="investigator-role">{author.role}</span><span className="investigator-specialty">{author.specialty}</span><span className="profile-prompt">Read biography</span></> : !compact&&<span className="profile-prompt">View profile</span>}
        </span>
      </button>
    </DialogTrigger>
    <DialogContent className="author-dialog">
      <DialogHeader className="author-dialog-header">
        <Portrait author={author} large/>
        <div><span className="eyebrow">{author.role}</span><DialogTitle>{author.name}</DialogTitle>{author.credentials&&<span className="bio-credentials">{author.credentials}</span>}<DialogDescription>{author.specialty}</DialogDescription></div>
      </DialogHeader>
      <p className="author-bio-text">{bioSentences.map((text,i)=><span key={i}>{i>0?' ':''}{text}{markers(bioIndices[i]||[0])}</span>)}</p>
      <dl className="author-background">{author.background.map((item,i)=><div key={item.label}><dt>{item.label}</dt><dd>{item.detail.replace(/[.!?]$/,'')}.{markers(backgroundIndices[i])}</dd></div>)}</dl>
      <section className="bio-references"><h3>References</h3><ol>{orderedSources.map((link,i)=><li id={`${refPrefix}-ref-${i+1}`} key={link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ol></section><div className="author-links" aria-label={`${author.name} profile sources`}>{author.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<ExternalLink size={14}/></a>)}</div>
    </DialogContent>
  </Dialog>;
}

function CreditRow({label,ids,compact=false}: {label:string; ids:AuthorId[]; compact?:boolean}) {
  return <div className={`author-credit-row${compact?' author-credit-compact':''}`}><span className="credit-label">{label}</span><div className="credit-people">{ids.map(id=><AuthorBio key={id} authorId={id} compact={compact}/>)}</div></div>;
}

export function PageCredits({page}: {page:string}) {
  const credit=contentCredits[page];
  return <div className="page-credits"><CreditRow label={credit?.authorIds.length?'Written by':'Primary investigators'} ids={credit?.authorIds.length?credit.authorIds:primaryInvestigators}/>{!!credit?.reviewerIds.length&&<CreditRow label="Reviewed by" ids={credit.reviewerIds}/>}</div>;
}

export function InvestigatorTeam(){return <section className="investigator-team" id="investigators"><div className="eyebrow">THE RESEARCH TEAM</div><h2>Primary investigators</h2><div className="investigator-grid">{primaryInvestigators.map(id=><AuthorBio key={id} authorId={id} card/>)}</div></section>}
export function InvestigatorFooter(){return <CreditRow label="Primary investigators" ids={primaryInvestigators} compact/>}
