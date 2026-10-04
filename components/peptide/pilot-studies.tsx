import pilot from '@/lib/data/bpc-pilot.json';
import {CitedText} from './cited-text';
import type {Source} from '@/lib/peptides';

export function PilotStudies({sources}:{sources:Source[]}) {
  return <div id="reviewed-studies">
    <h3>Primary studies reviewed</h3>
    <p>The studies below include {pilot.humanReports} human reports, including one preprint, and {pilot.preclinicalReports} animal or laboratory reports. These studies were selected for relevance and full-text accessibility; this is not an exhaustive systematic review.</p>
    <div className="rgbc-faq-block">
      {pilot.studies.map(study=><details className="rgbc-faq-item" key={study.id} id={`pilot-${study.id}`}>
        <summary><span className="rgbc-faq-icon" aria-hidden="true"/><span>{study.label} · {study.source.year}</span></summary>
        <div className="rgbc-faq-a">
          <p className="answer-paragraph"><CitedText sentences={study.sentences.map(text=>({text,sources:[study.source]}))} references={sources}/></p>
          <p className="study-locator"><a href={study.pdfUrl} target="_blank" rel="noreferrer">Read the study (PDF)</a> · Relevant pages: {study.locators.join(', ')}.</p>
          {study.hold&&<p className="editorial-note">Animal dose and sample-size claims are withheld pending clarification of the source’s reporting discrepancies.</p>}
        </div>
      </details>)}
    </div>
  </div>;
}
