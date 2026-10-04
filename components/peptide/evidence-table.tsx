import {ChevronRight} from 'lucide-react';
import type {Question, Source} from '@/lib/peptides';
import {Grade} from './evidence';
import {SourceMarkers} from './cited-text';
import {ResearchPanel, ResearchPanelTrigger, type StudyDetail} from './research-panel';

export function EvidenceTable({questions, references, studies = []}: {questions: Question[]; references: Source[]; studies?: StudyDetail[]}) {
  return <figure className="wp-block-table evidence-table evidence-assessments" role="region" aria-label="Evidence assessments table" tabIndex={0}>
    <table>
      <thead><tr><th scope="col">Outcome and study design</th><th scope="col">Our assessment</th><th scope="col">Supporting sources</th></tr></thead>
      <tbody>{questions.map(question => <ResearchPanel key={question.id} title={question.outcome} citations={question.sources} references={references} question={question} studies={studies.filter(study => question.sources.some(source => source.url === study.source.url))}>
        <tr>
          <td><ResearchPanelTrigger asChild><button className="research-outcome-trigger" type="button">{question.outcome}</button></ResearchPanelTrigger><span className="table-sub">{question.evidenceType.replace(/[.!?]$/, '')}.</span></td>
          <td><Grade grade={question.grade}/></td>
          <td><ResearchPanelTrigger asChild><button className="research-details-trigger" type="button" aria-label={`View sources for ${question.outcome}`}><span>{new Set(question.sources.map(source => source.url)).size} {question.sources.length === 1 ? 'source' : 'sources'}</span><ChevronRight aria-hidden="true"/></button></ResearchPanelTrigger><span className="table-citations"><SourceMarkers citations={question.sources} references={references}/></span></td>
        </tr>
      </ResearchPanel>)}</tbody>
    </table>
  </figure>;
}
