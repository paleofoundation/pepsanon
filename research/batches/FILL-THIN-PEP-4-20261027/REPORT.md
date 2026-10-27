# FILL-THIN-PEP-4

Draft review scope: seventy qualitative source-located paragraphs across the exact next ten existing glossary records, stacked on accepted PEP-3 head c7c5e9a81260ee45e99b8e7c7f11fa8b5d981740. The historical ranking has SHA256 f8b97c447bb4c0a191e6ab5eb11a68d5d90811077c58b1d20611d77e15d37898. This comparison uses the pinned local base and unchanged analyzer, not current live pages or a deployed repair.

Thirty already-handled records and all seven held missing routes remain excluded. Rank48 privacy is skipped as policy alongside corrections and terms. All selected canonical objects exist, so there is no restoration, selection substitution or new-record GATE. Only existing selected objects in lib/data/glossary.json change; source records, renderer, index, audit, routes, router, adapter and host allowlist remain exact.

## Before and after

| Rank | URL | Words before | Words after | Flags before | Flags after |
| --- | --- | --- | --- | --- | --- |
| 46 | https://pepsanon.com/glossary/subcutaneous | 198 | 487 | words<400;claims_with_2_citations | none |
| 47 | https://pepsanon.com/glossary/growth-hormone | 197 | 488 | words<400 | none |
| 49 | https://pepsanon.com/glossary/tripeptide | 201 | 445 | words<400 | claims_with_2_citations |
| 50 | https://pepsanon.com/glossary/extracellular-matrix | 198 | 456 | words<400 | none |
| 52 | https://pepsanon.com/glossary/oral | 204 | 459 | words<400;claims_with_2_citations | claims_with_2_citations |
| 53 | https://pepsanon.com/glossary/blinding | 218 | 549 | words<400 | none |
| 54 | https://pepsanon.com/glossary/pharmacokinetics | 213 | 499 | words<400;claims_with_2_citations | none |
| 55 | https://pepsanon.com/glossary/half-life | 219 | 516 | words<400 | none |
| 56 | https://pepsanon.com/glossary/purity | 211 | 474 | words<400 | none |
| 58 | https://pepsanon.com/glossary/receptor-agonist | 223 | 471 | words<400;claims_with_2_citations | claims_with_2_citations |

All ten pass the word threshold. Seven clear the unchanged audit. Tripeptide, oral and receptor-agonist remain claims_with_2_citations; tripeptide changes from a word-count flag to a citation-count flag when the longer prose meets the analyzer's claim-detection condition. No unrelated citation is added merely to force a threshold. Measured words include rendered reference content under the unchanged analyzer, so they are not a claim about new article-prose length alone.

## Exact selected locator normalization

Existing selected definitions and explanatory prose remain unchanged. Five inherited en-dash characters in exactly three locator fields become ASCII hyphens, scoped to half-life and pharmacokinetics. The labels and pointers below are machine-derived from the actual records. No source title or shared renderer changes.

- half-life: `/terms/22/definition/citations/0/locator`, "Results 2.1\u20132.2; Tables 1\u20136" to "Results 2.1-2.2; Tables 1-6".
- half-life: `/terms/22/sections/1/paragraphs/0/citations/0/locator`, "Results 2.1\u20132.3; Discussion" to "Results 2.1-2.3; Discussion".
- pharmacokinetics: `/terms/39/sections/0/paragraphs/0/citations/0/locator`, "Results 2.1\u20132.2 and Tables 1\u20136" to "Results 2.1-2.2 and Tables 1-6".

## Source fidelity and scientific limits

ADDITIONS-v1-UNAPPLIED.json preserves the prospective exact candidate at SHA256 2d7c5092ff65a84cc3f2736ae2c50bc32ed4f7c435593fa58415ef92c67d919b. Eleven existing held originals are hashed and selected passages recorded. The local working candidate was applied reversibly while independent source review continued; root then audited that same unchanged candidate before sealing. No source, numerical, scientific, human, grade or release approval is inferred from implementation checks. No original PDF, extracted paper text or source-page image is committed or hosted.

ROOT-SOURCE-AUDIT.json SHA256 c0e4cf0ab292b1d519604b093df32d3ae31a6c4e5a32fbd974ac1f97c6725890 independently checks all seventy qualitative sentences and links/locators against the eleven fresh original assets and material visual pages. The CJC discussion is physicalPDFp6, printed804; fibroblast Figure3 is physicalPDFp5, printed19070; eye methods are physicalPDFp11-14 in the16-page original, with database lock/unmask timing on physicalPDFp13. Those are document locators, not new scientific quantities.

Boundaries retained: injected semaglutide extension versus healthy-adult CJC endocrine observations; cultured rat receptor/viability/signaling assays versus whole-tendon or human repair; copper measurements in excised skin versus intact GHK-Cu identity; separate tissue-staining and tensile specimens; oral collagen plasma amino acids versus clinical tissue repair; named blinded roles, database timing and analysis choices versus a blanket double-masked claim; parent drug versus radiolabeled metabolites; chemical purity versus amount, endotoxin and viable contamination; dual-agonist stored fasting biomarkers versus GIP alone, tissue mechanism or cardiovascular events. No consumer dose, new numerical scientific claim or efficacy recommendation is derived.

The skin PDF emits a pdftotext hint-table warning with exit0. The eye physicalPDFp13 extraction duplicates some text; the actual page was visually read. Extraction is a retrieval aid and original pages are authoritative. Diagnostics and inspection boundaries remain explicit.

## Verification and preservation

Node22 production build and TypeScript pass. Existing glossary checks pass54routes,442citedparagraphs,16references; guide citation checks pass8guides and240sourcedsentences. The tracked TypeScript cache is restored to exact base bytes. The glossary index generator ran, but exposed an inherited source-projection gap on three prior PEP-3 definitions: auc, cmax and tmax. It would add their already-canonical CJC reference to the index. That shared-index invariance check FAILED and is preserved in PRESERVATION-generator-failure.log. The proposed generated diff is retained UNAPPLIED in UNAPPLIED-INHERITED-INDEX.patch and INHERITED-INDEX-GATE-PROPOSAL.json for a separate scope ruling. The index is restored to exact accepted base bytes; final scoped preservation passes. PEP-4 does not silently repair those prior records, and no generator-parity PASS is claimed. The compiled preview and browser receipts already use the original base index, so this restoration adds no app or build change.

Actual baseline/final GET captures cover the same61routes:54glossary200s and7held404s, using unchanged fail-closed robots checks on each URL and redirect, at most4workers and at least0.25s per worker. All70candidate paragraphs, source URLs, markers, citation targets and locators match rendered HTML exactly. All selected prior prose and44outside entire article subtrees remain exact without content normalization. Whole-document hashes differ across builds and are reported without asserting whole-document invariance.

Canonical proof preserves44outside raw objects including all30prior handled terms, all16source objects,187frozen prior PEP1/PEP2/PEP3 packet files, shared renderer,index,audit,TypeScript cache,analyzer and capture wrapper. No app path beyond lib/data/glossary.json changes. No new public em/en dash or scientific number is added.

ROOT-FINAL-MOBILE.json SHA256 a61d6b7f3b267e967c28562ace63f49d8bdad18c025b70c19c59359cba5c775c binds the same candidate, source receipt, final glossary bb72d4127df4bacb4696e727aafd339d1266397a6b81e50daf06f6602c9a1c5b and server c5978c34b19e1978534a84b4a87490231048e3ef614fd57c523101297a97f2c5. All10actual pages at390x844 have body/document width390 and the unreviewed disclosure. All70exact paragraph/source/locator DOM tuples match. Oral has one inherited native collagen-title dash; the other nine pages and all added prose have none. This is bounded browser/source verification, not clinical release approval.

## HELD-MISSING-BASE and SKIPPED-POLICY

The following seven routes remain held and local404, without restoration or a current-live fix claim. /install is not reclassified as policy.

- rank2: https://pepsanon.com/guides/before-you-buy
- rank12: https://pepsanon.com/research/paper-37c4f0f55f696512
- rank17: https://pepsanon.com/research/paper-d1c144a22938229c
- rank25: https://pepsanon.com/research/paper-29343d5dff2c8e1b
- rank28: https://pepsanon.com/research/paper-84d99218fb837c75
- rank38: https://pepsanon.com/install
- rank41: https://pepsanon.com/research/paper-baf28ca7c2d11c45

Policy/legal exclusions are not padded:

- rank1: https://pepsanon.com/guides/corrections (SKIPPED-POLICY).
- rank6: https://pepsanon.com/guides/terms (SKIPPED-POLICY).
- rank48: https://pepsanon.com/guides/privacy (SKIPPED-POLICY).

## INHERITED-PUNCTUATION OPEN

The verbatim native collagen source title retains its inherited em dash under ELON12:42's narrow grant. The canonical source object and shared renderer remain unchanged. This is visible on the selected oral page and is not newly authored prose. No broader punctuation exception or global zero-dash claim is made.

Raw build logs retain their original terminal padding and blank EOF lines. The full staged-whitespace check exits2 on38preserved raw build-log padding/blank-EOF warnings in BUILD-baseline.log and BUILD-final.log. Application-data whitespace passes; no blanket whitespace PASS is claimed.

One ordinary draft PR by plain HTTPS push only. No merge, deploy, publish, secrets, production changes, external human messages or real-person actions. Receiver OFF.
