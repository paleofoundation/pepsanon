import {pageMetadata} from '@/lib/seo';
import {Questions} from '@/components/peptide/questions';
export const metadata=pageMetadata('Peptide questions and answers','Answers to peptide and stack questions, with source-linked research on benefits, formulations, safety, and evidence limitations.','/questions');
export default function Page(){return <><aside className="method-callout"><h2>Questions about peptide stacks?</h2><p><a href="/stacks/wolverine-stack">Wolverine</a>, <a href="/stacks/glow-stack">GLOW</a>, <a href="/stacks/klow-stack">KLOW</a>, and <a href="/stacks/cjc-1295-ipamorelin">CJC-1295 with ipamorelin</a>: explore dedicated combination guides and FAQs.</p></aside><Questions/></>}
