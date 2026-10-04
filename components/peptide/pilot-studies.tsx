import pilot from '@/lib/data/bpc-pilot.json';
import {SourceMarkers} from './cited-text';
import type {Source} from '@/lib/peptides';
import {ChevronRight} from 'lucide-react';
import {ResearchPanel,ResearchPanelTrigger} from './research-panel';

export function PilotStudies({sources}:{sources:Source[]}) {
  return <div id="reviewed-studies">
    <h3>Primary studies reviewed</h3>
    <p>The studies below include {pilot.humanReports} human reports, including one preprint, and {pilot.preclinicalReports} animal or laboratory reports. These studies were selected for relevance and full-text accessibility; this is not an exhaustive systematic review.</p>
    <p>Select a study to open its findings and limitations.</p>
    <figure className="wp-block-table evidence-table primary-studies-table" role="region" aria-label="Primary studies table" tabIndex={0}><table>
      <thead><tr><th scope="col">Study</th><th scope="col">Population / model</th><th scope="col">Year</th><th scope="col">Details</th></tr></thead>
      <tbody>{pilot.studies.map(study=><ResearchPanel key={study.id} title={study.label} citations={[study.source]} references={sources} studies={[study]} expandStudy>
        <tr id={`pilot-${study.id}`}>
          <td><ResearchPanelTrigger asChild><button type="button" className="research-outcome-trigger">{study.label}</button></ResearchPanelTrigger><span className="table-citations"><SourceMarkers citations={[study.source]} references={sources}/></span></td>
          <td>{study.species}</td><td>{study.source.year}</td>
          <td><ResearchPanelTrigger asChild><button type="button" className="research-details-trigger" aria-label={`View study details: ${study.label}`}>Details<ChevronRight aria-hidden="true"/></button></ResearchPanelTrigger></td>
        </tr>
      </ResearchPanel>)}</tbody>
    </table></figure>
  </div>;
}
