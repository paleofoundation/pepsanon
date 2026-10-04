import type {Question, Source} from '@/lib/peptides';
import type {GuideEntry} from '@/lib/guide-sections';
import {CitedText} from './cited-text';

/** Main explanations are always visible. Only secondary questions use GuideFaq. */
export function GuideProse({entry,entryId,questions,sources}:{entry?:GuideEntry;entryId:string;questions:Question[];sources:Source[]}) {
 return <div className="guide-prose">
  {entry&&<p id={entryId} className="answer-paragraph guide-introduction"><CitedText sentences={entry.sentences} references={sources}/></p>}
  {questions.map(q=><div className="section-answer" key={q.id} id={q.id}>
   <h3>{q.question}</h3>
   <p className="answer-paragraph"><CitedText sentences={q.sentences.map(s=>({text:s.text,sources:s.sourceIndexes.map(i=>q.sources[i])}))} references={sources}/></p>
  </div>)}
 </div>;
}
