'use client';

import {useState} from 'react';
import {ChevronRight, X} from 'lucide-react';
import {Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose} from '@/components/ui/sheet';
import type {CorpusField, CorpusIndexEntry, CorpusRecord, CorpusSource} from '@/lib/corpus-types';

function Citation({source}: {source: CorpusSource}) {
  return <cite className="corpus-citation">DOI: {source.doi === 'NOT IN CORPUS'
    ? 'NOT IN CORPUS' : <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noreferrer">{source.doi}</a>}
    {' · '}{source.filename}{' · PDF page '}{source.pdf_page}</cite>;
}

function Field({label, value}: {label: string; value: CorpusField}) {
  return <section className="corpus-record-field"><h3>{label}</h3>{typeof value === 'string'
    ? <p>NOT IN CORPUS</p>
    : value.map((passage, i) => <blockquote key={`${passage.source.pdf_page}-${i}`}><p>{passage.text}</p><Citation source={passage.source}/></blockquote>)}</section>;
}

export function CorpusRecordBody({record}: {record: CorpusRecord}) {
  return <div className="corpus-record-body">
    <dl className="research-facts"><dt>{record.record_type === 'quality' ? 'Quality topic' : 'Peptide topic'}</dt><dd>{record.peptide}{record.attachment_status === 'not yet on the site' ? ' · Not yet on the site' : ''}</dd><dt>Citation</dt><dd>{record.citation.title}<Citation source={{filename: record.filename, doi: record.doi, pdf_page: 1}}/></dd></dl>
    {record.notes.map((note, i) => <p className="research-panel-limitation" key={i}>{note}</p>)}
    <Field label="What it measured" value={record.what_it_measured}/>
    <Field label="Dose / concentration as reported" value={record.dose}/>
    <Field label="Route as reported" value={record.route}/>
    <Field label="Endpoints" value={record.endpoint}/>
    <Field label="Reported observations" value={record.reported_results}/>
    <details className="research-study-details corpus-number-ledger"><summary>Numerical excerpts in context</summary><p>Selected numerical passages from this paper’s methods and observations, with their source references.</p>{typeof record.numbers === 'string' ? <p>NOT IN CORPUS</p> : record.numbers.map((p, i) => <blockquote key={i}><span className="source-kind">{p.section || 'Source passage'}</span><p>{p.text}</p><Citation source={p.source}/></blockquote>)}</details>
    <details className="research-study-details"><summary>Printed bibliographic context</summary><blockquote><p>{record.citation.printed_heading.text}</p><Citation source={record.citation.printed_heading.source}/></blockquote></details>
    <p><a href={`/study-records/${record.id}.json`} download>Download {record.record_type === 'quality' ? 'quality' : 'study'} record</a></p>
  </div>;
}

function StudyRow({study}: {study: CorpusIndexEntry}) {
  const kind = study.record_type === 'quality' ? 'quality' : 'study';
  const [record, setRecord] = useState<CorpusRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function load() {
    if (record || busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/study-records/${study.id}.json`);
      if (!response.ok) throw new Error('The record could not be loaded. Please try again.');
      const data = await response.json() as CorpusRecord;
      if (data.id !== study.id || data.filename !== study.filename) throw new Error('The record did not match the selected source.');
      setRecord({...data, attachment_status: study.attachment_status});
    } catch (failure) {setError(failure instanceof Error ? failure.message : 'The record could not be loaded.');}
    finally {setBusy(false);}
  }
  return <Sheet onOpenChange={open => {if (open) void load();}}>
    <tr id={study.id}><td><SheetTrigger asChild><button type="button" className="research-outcome-trigger">{study.title}</button></SheetTrigger><span className="corpus-file-label">{study.filename}</span></td><td className="corpus-doi">{study.doi === 'NOT IN CORPUS' ? 'NOT IN CORPUS' : <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noreferrer">{study.doi}</a>}</td><td><SheetTrigger asChild><button type="button" className="research-details-trigger" aria-label={`View ${kind} record: ${study.title}`}>Details<ChevronRight aria-hidden="true"/></button></SheetTrigger></td></tr>
    <SheetContent side="right" className="research-detail-panel" showCloseButton={false}>
      <header className="research-detail-panel__header"><div><SheetTitle>{kind === 'quality' ? 'Quality record' : 'Study record'}</SheetTitle><SheetDescription>{study.title}</SheetDescription></div><SheetClose className="research-panel-close" aria-label={`Close ${kind} record`}><X aria-hidden="true"/></SheetClose></header>
      <div className="research-detail-panel__body">{busy ? <p role="status">Loading record…</p> : null}{error ? <div role="alert"><p>{error}</p><button type="button" onClick={() => void load()}>Try again</button></div> : null}{record ? <CorpusRecordBody record={record}/> : null}</div>
    </SheetContent>
  </Sheet>;
}

export function CorpusStudies({studies, heading = 'Study records', id = 'packet-studies'}: {studies: CorpusIndexEntry[]; heading?: string; id?: string}) {
  if (!studies.length) return null;
  return <section id={id} className="corpus-studies"><h3>{heading}</h3><p>Select a record to explore its methods, findings, and source references.</p><figure className="wp-block-table evidence-table primary-studies-table" role="region" aria-label={heading} tabIndex={0}><table><thead><tr><th scope="col">Source</th><th scope="col">DOI</th><th scope="col">Record</th></tr></thead><tbody>{studies.map(study => <StudyRow key={study.id} study={study}/>)}</tbody></table></figure></section>;
}
