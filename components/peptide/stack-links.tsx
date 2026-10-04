import {relatedStacks,stacks} from '@/lib/stacks';
export function StackLinks({peptideId,slugs}:{peptideId?:string;slugs?:string[]}){
 const items=peptideId?relatedStacks(peptideId):stacks.filter(stack=>slugs?.includes(stack.slug));
 if(!items.length)return null;
 return <section className="related-stacks" aria-label="Related stack guides"><p className="section-kicker">UNDERSTAND THE COMBINATIONS</p><h2>{peptideId?'Stacks containing this peptide':'Compare related stacks'}</h2><div>{items.map(stack=><a key={stack.slug} href={`/stacks/${stack.slug}`}><strong>{stack.name}</strong><span>{stack.ingredients.map(i=>i.name).join(' + ')}</span><small>Explore the evidence →</small></a>)}</div><a className="quiet-link" href="/stacks">Compare all peptide stacks</a></section>;
}
