import {glossarySegments, type GlossarySegment} from '@/lib/glossary-links';
import {glossaryHref} from '@/lib/glossary-index';

export function GlossarySegmentText({segment}: {segment: GlossarySegment}) {
  return segment.slug ? <a className="glossary-inline-link" href={glossaryHref(segment.slug)} title={`Read the glossary entry: ${segment.text}`}>{segment.text}</a> : <>{segment.text}</>;
}
// Only process authored prose strings. Existing anchors, citations and headings stay intact.
export function GlossaryText({text, exclude}: {text: string; exclude?: string}) {
  return <>{glossarySegments(text, {exclude}).map((segment,index) => <GlossarySegmentText key={index} segment={segment}/>)}</>;
}
