import {glossaryIndex} from './glossary-index';

const normalize = (text: string) => text.toLowerCase().replace(/[‐‑–—]/g, '-');
const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const aliases = new Map<string, string>();
for (const term of glossaryIndex) {
  for (const name of [term.name, ...term.aliases]) aliases.set(normalize(name), term.slug);
}
// Match longest phrases first; do not link a fragment inside another word.
const pattern = [...aliases.keys()].sort((a,b) => b.length-a.length).map(name => escapePattern(name).replace(/-/g, '[-‐‑–—]')).join('|');
const matcher = new RegExp(`(?<![\\p{L}\\p{N}])(${pattern})(?![\\p{L}\\p{N}])`, 'giu');
export type GlossarySegment = {text: string; slug?: string};

export function glossarySegments(text: string, {seen = new Set<string>(), exclude, limit = 5}: {seen?: Set<string>; exclude?: string; limit?: number} = {}): GlossarySegment[] {
  const result: GlossarySegment[] = [];
  let cursor = 0;
  for (const match of text.matchAll(matcher)) {
    const slug = aliases.get(normalize(match[0]));
    if (!slug || slug === exclude || seen.has(slug) || seen.size >= limit) continue;
    // Short abbreviations are case sensitive to avoid treating ordinary words as acronyms.
    if (match[0].length <= 3 && match[0] !== match[0].toUpperCase()) continue;
    if (match.index > cursor) result.push({text: text.slice(cursor, match.index)});
    result.push({text: match[0], slug});
    seen.add(slug);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) result.push({text: text.slice(cursor)});
  return result.length ? result : [{text}];
}

export function termsInText(text: string): string[] {
  return glossarySegments(text, {limit: Infinity}).flatMap(segment => segment.slug ? [segment.slug] : []);
}
