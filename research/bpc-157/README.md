# BPC-157 PDF ingestion pilot

Pilot date: 3 October 2026. Twenty distinct primary-research PDFs, 321 PDF pages; four human reports (including one preprint) and sixteen preclinical reports. Regulatory documents and a publisher affiliation corrigendum are supplemental, not part of the twenty-study count.

This is an accessibility-based, selected-source pilot. Full PDFs were downloaded, signature-checked, SHA-256 hashed, counted with pdfinfo and extracted with pdftotext. Targeted methods/results and sentence-level claims were checked against the PDFs by a separate AI review task. Human investigator review remains pending. This is not a systematic review, comprehensive risk-of-bias assessment, formal GRADE exercise, or evidence of twenty independent replications.

The original PDFs and extraction text are retained in the private research archive, not served by the website. Manifest paths are relative to that archive. Public readers receive publisher/source links. No full publisher text is bundled in the public site.

`pilot-manifest.json` records provenance, selected findings and page locators, access limitations, source discrepancies and publication status. `claim-map.json` records the current answer sentences and exact source dependencies. The verification files document the independent AI checks. The final review's gut-grade recommendation was applied: an abstract-only human UC trial warrants a very-low assessment, not a blanket assertion of no human evidence.

The BACH1 paper's animal dose/sample claims are held because its routes, doses and sample descriptions conflict. Other source inconsistencies are preserved in records and omitted from unsupported numerical claims. A nonsignificant tendon result is not treated as proof of no effect. Animal pharmacokinetics are not described as human pharmacokinetics.

Run `node scripts/check-bpc-pilot.mjs` and `node scripts/check-citations.mjs` from the project root to verify record counts, source mappings and citation structure. These are structural integrity checks; they cannot establish whether a source entails a clinical claim.

No recurring ingestion service, autonomous publisher or human approval is implied by this manually supervised pilot.
