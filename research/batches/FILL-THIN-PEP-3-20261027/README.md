# FILL-THIN-PEP-3 verification packet

This packet records two bounded stages on fixed base `31aa7e2dab871482498228fd6bd4d667409be5ca`. Historical selection, missing-route proposal, initial source candidates and partial eight-page checkpoints retain their original states. `AUTHORITY-13-28.txt` and `SELECTION-GRANTED.json` record the later exact selection answer. An earlier IDLE is historical, not a final task state.

`CITATION-CANDIDATES-v1.json` contains the three citation-only Part A changes. `PART-A-RESULTS-v1.json` explains every prior-page outcome, including eight unchanged thin pages. The unchanged analyzer counts generated reference text, so the three new reference entries increase measured words without changing article prose.

`PART-B-CANDIDATE-v1-UNAPPLIED.json` is the original eight-page source candidate. The two replacement candidates and combined v2 are separate prospective files. `EIGHT-FROZEN-OBJECTS.json` and `EIGHT-FROZEN-ARTICLES.json` bind the applied eight-page checkpoint for the later combined comparison. Source-reading files and exact root receipts describe bounded checks; none grants scientific, human or release approval.

Run the data proof from the checkout root with Python:

```sh
python3 research/batches/FILL-THIN-PEP-3-20261027/verify.py --part-b PART-B-CANDIDATE-v2-UNAPPLIED.json
```

Regeneration is deterministic from the fixed base and overwrites only the glossary data file with the explicitly selected changes:

```sh
python3 research/batches/FILL-THIN-PEP-3-20261027/apply_changes.py --part-b PART-B-CANDIDATE-v2-UNAPPLIED.json
```

The capture wrapper and analyzer bytes match the prior packet. They require Python requests, BeautifulSoup and lxml. Local capture uses GET only, checks robots for every URL and redirect, uses at most four workers and waits at least 0.25 seconds per worker. Captured URLs are mapped to the intended public canonical only for local analysis; no live deployment or current-live repair is claimed. The SSR checker compares actual captured article subtrees without content normalization; raw whole-document hashes can differ across builds and remain reported separately.

Original PDFs, extracted paper text and page images remain private and are not included here. Corpus paths in independent exact receipts are identity bindings, not hosted documents. Cite only. No source acquisition, merge, deploy, publish, secrets, production changes or outbound human messages. Receiver OFF.
