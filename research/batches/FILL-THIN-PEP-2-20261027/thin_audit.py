#!/usr/bin/env python3
"""thin_audit.py - audit a site for thin pages (read-only, polite crawler).

Usage:
  python3 thin_audit.py example.com --out ./out/example
  python3 thin_audit.py example.com --max-urls 100 --out ./out/sample
  python3 thin_audit.py example.com --sample-per-type 300 --out ./out/example

Needs: python3, requests, beautifulsoup4 (lxml optional, used if installed).
It only issues GET requests. Max 4 parallel workers. It never writes to the site.
"""
import argparse, csv, gzip, io, json, os, random, re, statistics, sys, threading, time
from collections import Counter, defaultdict, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib import robotparser
from urllib.parse import urljoin, urlparse, urldefrag

import requests
from bs4 import BeautifulSoup

try:
    import lxml  # noqa: F401
    PARSER = "lxml"
except Exception:
    PARSER = "html.parser"

DEFAULT_EXEMPT = ("about,contact,privacy,terms,editorial-standards,errata,data,coverage,curators,advisory,authors,"
                  "submit-work,support,contribute,institutions,researchers,research-standard,readiness,login,signin,sign-in,"
                  "account,cart,search,404,api,disclaimer,methodology,policies,legal,accessibility")

UA = "thin-audit/1.0 (+read-only content audit; contact site owner)"

# Citation hosts. Matching is on the hostname (suffix) of each <a href>.
CITATION_HOSTS = [
    "pubmed.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov", "pmc.ncbi.nlm.nih.gov", "europepmc.org",
    "doi.org", "dx.doi.org", "clinicaltrials.gov", "fda.gov", "efsa.europa.eu", "epa.gov",
    "sciencedirect.com", "springer.com", "link.springer.com", "nature.com", "wiley.com",
    "onlinelibrary.wiley.com", "tandfonline.com", "mdpi.com", "frontiersin.org", "plos.org",
    "journals.plos.org", "biomedcentral.com", "academic.oup.com", "oup.com", "jamanetwork.com",
    "nejm.org", "thelancet.com", "bmj.com", "cell.com", "science.org", "acs.org", "pubs.acs.org",
    "rsc.org", "pnas.org", "sagepub.com", "journals.sagepub.com", "cochranelibrary.com",
    "ahajournals.org", "diabetesjournals.org", "aacrjournals.org", "elifesciences.org",
    "hindawi.com", "karger.com", "thieme-connect.com", "jstage.jst.go.jp", "semanticscholar.org",
    "biorxiv.org", "medrxiv.org", "who.int", "iarc.who.int", "atsdr.cdc.gov", "cdc.gov",
    "nih.gov", "ods.od.nih.gov", "ecfr.gov", "federalregister.gov", "echa.europa.eu",
]
CITATION_HOST_SET = tuple(CITATION_HOSTS)

REF_HEADING_RE = re.compile(r"^\s*(references?|bibliograph\w*|citations?|sources?( and references)?|works cited|further reading|literature( cited)?|studies cited|primary sources|source list)\s*:?\s*$", re.I)
REF_ATTR_RE = re.compile(r"(^|[\s_-])(references?|bibliograph\w*|citations?|footnotes?|sources?-list|source-list|refs?)($|[\s_-])", re.I)

DEFAULT_STUB_RE = (r"coming soon|under construction|placeholder|lorem ipsum|\bstub\b|to be added|\btbd\b|\btba\b|"
                   r"not yet (available|populated|published|reviewed|filed)|no (public )?(findings|records|evidence|sources) (yet|available|published|have been)|"
                   r"evidence (is )?pending\b|awaiting (review|evidence|sources|ingest)|"
                   r"will be (added|published|populated)|content (is )?(being|to be) (added|written)|\bHOLD\b|empty (scaffold|index)|currently empty|nothing here yet")
DEFAULT_CLAIM_RE = (r"\bstud(y|ies)\b|\btrials?\b|\bmeta-analys\w+|\brandomi[sz]ed\b|\bparticipants\b|\bcohort\b|"
                    r"evidence (shows?|suggests?|indicates?)|research (shows?|suggests?|indicates?)|"
                    r"associated with|linked to|\bcauses?\b|\breduces?\b|\bincreases?\b|\befficacy\b|\bsafety\b|\brisk\b|"
                    r"\bmg/kg\b|\bppb\b|\bppm\b|µg|\bug/(l|kg|g)\b|\bconcentrations?\b|\bexposure\b|\bclinical\b")


def norm_host(h):
    h = (h or "").lower()
    return h[4:] if h.startswith("www.") else h


def host_is_citation(host):
    host = (host or "").lower()
    for h in CITATION_HOST_SET:
        if host == h or host.endswith("." + h):
            return True
    return False


class Fetcher:
    def __init__(self, delay, timeout, ua, retries=2):
        self.local = threading.local()
        self.delay, self.timeout, self.ua, self.retries = delay, timeout, ua, retries

    def sess(self):
        s = getattr(self.local, "s", None)
        if s is None:
            s = requests.Session()
            s.headers.update({"User-Agent": self.ua, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5"})
            self.local.s = s
        return s

    def get(self, url, stream_limit=None):
        last = None
        for attempt in range(self.retries + 1):
            try:
                time.sleep(self.delay)
                r = self.sess().get(url, timeout=self.timeout, allow_redirects=True)
                if r.status_code in (429, 503) and attempt < self.retries:
                    wait = r.headers.get("Retry-After", "")
                    time.sleep(min(int(wait) if wait.isdigit() else 5 * (attempt + 1), 30))
                    continue
                return r
            except requests.RequestException as e:
                last = e
                time.sleep(1.5 * (attempt + 1))
        raise last


def parse_sitemap_xml(content):
    """Return (child_sitemaps, page_urls)."""
    soup = BeautifulSoup(content, "xml") if PARSER == "lxml" else BeautifulSoup(content, "html.parser")
    kids, pages = [], []
    for sm in soup.find_all("sitemap"):
        loc = sm.find("loc")
        if loc and loc.text.strip():
            kids.append(loc.text.strip())
    for u in soup.find_all("url"):
        loc = u.find("loc")
        if loc and loc.text.strip():
            pages.append(loc.text.strip())
    return kids, pages


def read_sitemaps(fetcher, base, log):
    cands = []
    try:
        r = fetcher.get(base + "/robots.txt")
        if r.status_code == 200:
            for line in r.text.splitlines():
                if line.lower().startswith("sitemap:"):
                    cands.append(line.split(":", 1)[1].strip())
    except Exception as e:
        log(f"robots.txt fetch failed: {e}")
    for p in ("/sitemap.xml", "/sitemap_index.xml", "/sitemap-index.xml"):
        u = base + p
        if u not in cands:
            cands.append(u)
    seen, urls, queue = set(), [], deque(cands)
    found_any = False
    while queue:
        sm = queue.popleft()
        if sm in seen or len(seen) > 200:
            continue
        seen.add(sm)
        try:
            r = fetcher.get(sm)
        except Exception as e:
            log(f"sitemap fetch failed {sm}: {e}")
            continue
        if r.status_code != 200:
            continue
        body = r.content
        if sm.endswith(".gz") or body[:2] == b"\x1f\x8b":
            try:
                body = gzip.decompress(body)
            except Exception:
                pass
        if b"<urlset" not in body[:5000] and b"<sitemapindex" not in body[:5000]:
            continue
        kids, pages = parse_sitemap_xml(body)
        found_any = True
        for k in kids:
            queue.append(k)
        urls.extend(pages)
    out, s = [], set()
    for u in urls:
        u = urldefrag(u)[0]
        if u not in s:
            s.add(u)
            out.append(u)
    log(f"sitemap: {len(seen)} file(s) read, {len(out)} unique URLs" if found_any else "sitemap: none found")
    return out if found_any else []


def crawl_links(fetcher, base, host, max_urls, log):
    start = base + "/"
    seen, order, queue = {start}, [], deque([start])
    while queue and len(order) < max_urls:
        u = queue.popleft()
        try:
            r = fetcher.get(u)
        except Exception:
            continue
        order.append(u)
        if r.status_code != 200 or "html" not in r.headers.get("content-type", ""):
            continue
        soup = BeautifulSoup(r.text, PARSER)
        for a in soup.find_all("a", href=True):
            href = urldefrag(urljoin(r.url, a["href"]))[0]
            p = urlparse(href)
            if p.scheme not in ("http", "https") or norm_host(p.netloc) != host:
                continue
            if re.search(r"\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|css|js|xml|ico|mp4|mp3|csv|json)$", p.path, re.I):
                continue
            href = p._replace(query="").geturl()
            if href not in seen:
                seen.add(href)
                queue.append(href)
    log(f"crawl fallback: {len(order)} pages discovered")
    return order


def page_type_of(url):
    path = urlparse(url).path.strip("/")
    return path.split("/")[0].lower() if path else "(home)"


def words_in(text):
    return len(re.findall(r"[A-Za-z0-9\u00C0-\u024F][A-Za-z0-9\u00C0-\u024F'’\-]*", text))


def count_reference_entries(soup):
    best = 0
    # heading approach
    for h in soup.find_all(re.compile(r"^h[1-6]$")):
        if REF_HEADING_RE.match(h.get_text(" ", strip=True) or ""):
            level = int(h.name[1])
            n = 0
            for sib in h.find_all_next():
                if sib is h:
                    continue
                if re.match(r"^h[1-6]$", sib.name or "") and int(sib.name[1]) <= level:
                    break
                if sib.name == "li" and not sib.find("li"):
                    n += 1
                elif sib.name == "p" and sib.find_parent("li") is None and len(sib.get_text(strip=True)) > 40 and sib.find_parent(["ul", "ol"]) is None:
                    n += 1
            best = max(best, n)
    # container approach (id/class says references)
    for el in soup.find_all(attrs={"id": True}) + soup.find_all(attrs={"class": True}):
        ident = " ".join(filter(None, [el.get("id") if isinstance(el.get("id"), str) else "", " ".join(el.get("class") or [])]))
        if ident and REF_ATTR_RE.search(ident) and el.name in ("section", "div", "ol", "ul", "aside", "details"):
            n = len([li for li in el.find_all("li") if not li.find("li")])
            best = max(best, n)
    return best


def analyze(url, r, cfg):
    row = {"url": url, "page_type": page_type_of(url), "status": r.status_code, "final_url": r.url if r.url != url else "",
           "words": "", "headings": "", "citations": "", "unique_citation_hosts": "", "reference_entries": "",
           "claim_hits": "", "makes_claims": "", "stub_flag": "", "stub_match": "", "meta_desc_len": "", "canonical": "",
           "canonical_self": "", "noindex": "", "thin": "", "thin_reasons": "", "bytes": len(r.content), "error": ""}
    xrt = r.headers.get("x-robots-tag", "")
    ctype = r.headers.get("content-type", "")
    if r.status_code != 200 or "html" not in ctype:
        row["noindex"] = "yes" if "noindex" in xrt.lower() else ""
        if r.status_code == 200:
            row["error"] = f"non-html:{ctype.split(';')[0]}"
        return row
    soup = BeautifulSoup(r.text, PARSER)
    # head metadata (before stripping)
    md = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    row["meta_desc_len"] = len((md.get("content") or "").strip()) if md else 0
    can = soup.find("link", rel=lambda v: v and "canonical" in (v if isinstance(v, list) else [v]))
    canon = (can.get("href") or "").strip() if can else ""
    row["canonical"] = canon
    if canon:
        a, b = urlparse(urljoin(url, canon)), urlparse(r.url)
        row["canonical_self"] = "yes" if (norm_host(a.netloc) == norm_host(b.netloc) and a.path.rstrip("/") == b.path.rstrip("/")) else "no"
    robots_meta = " ".join((m.get("content") or "") for m in soup.find_all("meta", attrs={"name": re.compile(r"^(robots|googlebot)$", re.I)}))
    row["noindex"] = "yes" if ("noindex" in robots_meta.lower() or "noindex" in xrt.lower()) else ""
    # strip chrome
    for t in soup.find_all(["script", "style", "noscript", "template", "svg", "nav", "header", "footer"]):
        t.decompose()
    for t in soup.find_all(attrs={"role": re.compile(r"^(navigation|banner|contentinfo)$", re.I)}):
        t.decompose()
    body = soup.body or soup
    text = body.get_text(" ", strip=True)
    row["words"] = words_in(text)
    row["headings"] = len(body.find_all(re.compile(r"^h[1-6]$")))
    cites, hosts = 0, set()
    for a in body.find_all("a", href=True):
        p = urlparse(urljoin(r.url, a["href"]))
        if p.scheme in ("http", "https") and host_is_citation(p.netloc):
            cites += 1
            hosts.add(p.netloc.lower())
    row["citations"] = cites
    row["unique_citation_hosts"] = len(hosts)
    row["reference_entries"] = count_reference_entries(body)
    low = text
    claim_hits = len(cfg["claim_re"].findall(low))
    row["claim_hits"] = claim_hits
    makes = claim_hits >= cfg["claim_min_hits"]
    row["makes_claims"] = "yes" if makes else "no"
    sm = cfg["stub_re"].search(low)
    row["stub_flag"] = "yes" if sm else "no"
    row["stub_match"] = sm.group(0)[:40] if sm else ""
    reasons = []
    if row["page_type"] in cfg["exempt"]:
        row["thin"] = "exempt"
        return row
    if row["words"] < cfg["min_words"]:
        reasons.append(f"words<{cfg['min_words']}")
    if makes and cites <= cfg["max_thin_cites"]:
        reasons.append(f"claims_with_{cites}_citations")
    if sm:
        reasons.append("stub_language")
    row["thin"] = "yes" if reasons else "no"
    row["thin_reasons"] = ";".join(reasons)
    return row


def summarize(rows):
    by = defaultdict(list)
    for r in rows:
        by[r["page_type"]].append(r)
    out = []
    for t, rs in by.items():
        ok = [x for x in rs if x["status"] == 200 and x["words"] != "" and x["thin"] in ("yes", "no")]
        thin = [x for x in ok if x["thin"] == "yes"]
        errs = [x for x in rs if x["status"] != 200]
        out.append({
            "page_type": t, "pages": len(rs), "ok_html": len(ok), "thin": len(thin),
            "thin_pct": round(100 * len(thin) / len(ok), 1) if ok else 0,
            "thin_words": sum(1 for x in ok if "words<" in x["thin_reasons"]),
            "thin_claims_few_citations": sum(1 for x in ok if "claims_with_" in x["thin_reasons"]),
            "thin_stub": sum(1 for x in ok if "stub_language" in x["thin_reasons"]),
            "exempt_policy_pages": sum(1 for x in rs if x["thin"] == "exempt"), "non200": len(errs), "noindex": sum(1 for x in rs if x["noindex"] == "yes"),
            "median_words": int(statistics.median([x["words"] for x in ok])) if ok else 0,
            "avg_citations": round(sum(x["citations"] for x in ok) / len(ok), 1) if ok else 0,
            "zero_citation_pages": sum(1 for x in ok if x["citations"] == 0),
            "no_meta_desc": sum(1 for x in ok if x["meta_desc_len"] == 0),
        })
    out.sort(key=lambda d: (-d["thin"], -d["pages"]))
    return out


def main():
    ap = argparse.ArgumentParser(description="Thin-page audit for a domain (read-only).")
    ap.add_argument("domain", help="e.g. example.com (scheme optional)")
    ap.add_argument("--out", default=None, help="output dir (default ./thin-audit-<domain>)")
    ap.add_argument("--max-urls", type=int, default=0, help="audit only the first N URLs (0 = all)")
    ap.add_argument("--sample-per-type", type=int, default=0, help="stratified random sample: at most N pages per page type (0 = off)")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--workers", type=int, default=4, help="parallel fetches, capped at 4")
    ap.add_argument("--delay", type=float, default=0.25, help="seconds to sleep before each request in each worker")
    ap.add_argument("--timeout", type=float, default=25)
    ap.add_argument("--min-words", type=int, default=400, help="THIN if body words below this (default 400)")
    ap.add_argument("--max-thin-cites", type=int, default=2, help="THIN if page makes evidence claims and has <= this many citation links (default 2)")
    ap.add_argument("--claim-min-hits", type=int, default=3, help="evidence-claim keyword hits needed to count as making claims (default 3)")
    ap.add_argument("--stub-regex", default=DEFAULT_STUB_RE, help="regex for stub language (case-insensitive)")
    ap.add_argument("--claim-regex", default=DEFAULT_CLAIM_RE, help="regex for evidence-claim words (case-insensitive)")
    ap.add_argument("--exempt-types", default=DEFAULT_EXEMPT, help="comma list of page types (first path segment) that are policy/utility pages and are not scored thin; pass '' to score everything")
    ap.add_argument("--no-sitemap", action="store_true", help="skip sitemap, crawl internal links")
    ap.add_argument("--crawl-limit", type=int, default=2000, help="max pages for link-crawl fallback")
    ap.add_argument("--user-agent", default=UA)
    ap.add_argument("--ignore-robots", action="store_true")
    a = ap.parse_args()

    dom = a.domain.strip()
    if not dom.startswith("http"):
        dom = "https://" + dom
    pu = urlparse(dom)
    base = f"{pu.scheme}://{pu.netloc}"
    host = norm_host(pu.netloc)
    out = a.out or f"./thin-audit-{host}"
    os.makedirs(out, exist_ok=True)
    workers = max(1, min(4, a.workers))
    t0 = time.time()
    log = lambda m: print(f"[{time.time()-t0:6.1f}s] {m}", file=sys.stderr, flush=True)
    fetcher = Fetcher(a.delay, a.timeout, a.user_agent)

    urls = [] if a.no_sitemap else read_sitemaps(fetcher, base, log)
    source = "sitemap"
    if not urls:
        source = "crawl"
        urls = crawl_links(fetcher, base, host, a.crawl_limit, log)
    # keep only same-site URLs
    urls = [u for u in urls if norm_host(urlparse(u).netloc) == host]
    total_found = len(urls)

    rp = None
    if not a.ignore_robots:
        rp = robotparser.RobotFileParser()
        try:
            rr = fetcher.get(base + "/robots.txt")
            rp.parse(rr.text.splitlines() if rr.status_code == 200 else [])
        except Exception:
            rp = None
    if rp:
        before = len(urls)
        urls = [u for u in urls if rp.can_fetch(a.user_agent, u)]
        if len(urls) != before:
            log(f"robots.txt excluded {before-len(urls)} URLs")

    sample_note = "all URLs"
    type_found = Counter(page_type_of(u) for u in urls)
    if a.max_urls:
        urls = urls[:a.max_urls]
        sample_note = f"first {a.max_urls} URLs in sitemap order"
    if a.sample_per_type:
        rnd = random.Random(a.seed)
        groups = defaultdict(list)
        for u in urls:
            groups[page_type_of(u)].append(u)
        picked = []
        for t in sorted(groups):
            g = groups[t]
            picked.extend(g if len(g) <= a.sample_per_type else rnd.sample(g, a.sample_per_type))
        urls = picked
        sample_note = f"stratified random sample, up to {a.sample_per_type} per page type (seed {a.seed})"
    type_totals = Counter(page_type_of(u) for u in urls)
    log(f"{total_found} URLs found via {source}; auditing {len(urls)} ({sample_note})")

    cfg = {"min_words": a.min_words, "max_thin_cites": a.max_thin_cites, "claim_min_hits": a.claim_min_hits,
           "exempt": set(x.strip().lower() for x in a.exempt_types.split(",") if x.strip()), "stub_re": re.compile(a.stub_regex, re.I), "claim_re": re.compile(a.claim_regex, re.I)}

    def work(u):
        try:
            r = fetcher.get(u)
            return analyze(u, r, cfg)
        except Exception as e:
            return {"url": u, "page_type": page_type_of(u), "status": 0, "final_url": "", "words": "", "headings": "",
                    "citations": "", "unique_citation_hosts": "", "reference_entries": "", "claim_hits": "", "makes_claims": "",
                    "stub_flag": "", "stub_match": "", "meta_desc_len": "", "canonical": "", "canonical_self": "",
                    "noindex": "", "thin": "", "thin_reasons": "", "bytes": 0, "error": str(e)[:120]}

    rows, done = [], 0
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(work, u): u for u in urls}
        for f in as_completed(futs):
            rows.append(f.result())
            done += 1
            if done % 100 == 0:
                log(f"{done}/{len(urls)} fetched")
    order = {u: i for i, u in enumerate(urls)}
    rows.sort(key=lambda r: order[r["url"]])
    elapsed = time.time() - t0

    cols = ["url", "page_type", "status", "words", "headings", "citations", "unique_citation_hosts", "reference_entries",
            "claim_hits", "makes_claims", "stub_flag", "stub_match", "meta_desc_len", "canonical", "canonical_self", "noindex",
            "thin", "thin_reasons", "final_url", "bytes", "error"]
    pages_csv = os.path.join(out, f"{host}-pages.csv")
    with open(pages_csv, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    summ = summarize(rows)
    scols = list(summ[0].keys()) if summ else []
    sum_csv = os.path.join(out, f"{host}-summary-by-type.csv")
    with open(sum_csv, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=scols)
        w.writeheader()
        w.writerows(summ)
    ok = [r for r in rows if r["status"] == 200 and r["words"] != "" and r["thin"] in ("yes", "no")]
    meta = {"domain": host, "run_started_unix": int(t0), "elapsed_seconds": round(elapsed, 1), "url_source": source,
            "urls_found": total_found, "urls_audited": len(urls), "sampling": sample_note,
            "exempt_types": sorted(cfg["exempt"]), "thresholds": {"min_words": a.min_words, "max_thin_cites": a.max_thin_cites, "claim_min_hits": a.claim_min_hits},
            "html_pages_ok": len(ok), "thin_pages": sum(1 for r in ok if r["thin"] == "yes"),
            "non_200": sum(1 for r in rows if r["status"] != 200), "page_types_in_sample": dict(type_totals), "page_types_found": dict(type_found)}
    with open(os.path.join(out, f"{host}-run.json"), "w") as fh:
        json.dump(meta, fh, indent=2)

    print(f"\nThin audit: {host}  ({sample_note}; {len(urls)} of {total_found} URLs; source={source}; {elapsed:.1f}s, {workers} workers)")
    print(f"THIN rule: words<{a.min_words} OR (claims AND citations<={a.max_thin_cites}) OR stub language. Non-200, non-HTML and exempt policy pages (--exempt-types) are not scored.")
    print(f"HTML ok: {len(ok)}   thin: {meta['thin_pages']}   non-200: {meta['non_200']}")
    hdr = f"{'page_type':28}{'pages':>7}{'thin':>7}{'thin%':>7}{'words<':>8}{'claims':>8}{'stub':>6}{'non200':>8}{'medWords':>9}{'avgCite':>8}"
    print(hdr)
    for s in summ:
        print(f"{s['page_type'][:27]:28}{s['pages']:>7}{s['thin']:>7}{s['thin_pct']:>7}{s['thin_words']:>8}{s['thin_claims_few_citations']:>8}{s['thin_stub']:>6}{s['non200']:>8}{s['median_words']:>9}{s['avg_citations']:>8}")
    print(f"\nWrote: {pages_csv}\n       {sum_csv}")


if __name__ == "__main__":
    main()
