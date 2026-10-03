# Peptide Evidence theme

The shared visual layer is ported from the owner-supplied `paleofoundation/microbiomemedicine` repository at commit `28ed85b6d510dfddf1720775b456771c7dc62763`.

Canonical references: `docs/DESIGN-SYSTEM.md`, `src/styles/theme-wp.css`, the captured header in `src/theme/themeHtml.ts`, `ArticleView`, `SectionNav`, and `PageSnapshot`.

`app/reference-theme.css` retains the source stylesheet. `app/globals.css` supplies turquoise tokens, local Inter/Lora fonts, the source FAQ and snapshot styling, and integration rules for the peptide content and author dialogs. Branding and subject matter are specific to Peptide Evidence. The source microbiome repository was read only.

The article template uses a full-width research hero, investigator panel, page snapshot, left section navigation, central article, and right related-content rail. Headings, native FAQ accordions, and numbered citation previews follow the supplied theme. Empty data fields and unavailable membership features are omitted.

Intentional responsive adaptation: section navigation stays available at medium desktop widths and moves into an accessible left drawer on mobile. Header search remains available at every width. The repository's frozen `_migration` screenshots were absent, so screenshot-level parity has not been certified.

Content lives in `lib/data/evidence.json` and `lib/data/community.json`. Peptide directory metadata lives in `lib/peptides.ts`. Investigator biographies, photo paths, and page-specific author/reviewer assignments live in `lib/authors.ts`. A page shows 'Written by' only when its author assignment has been supplied; otherwise it identifies the two primary investigators. The launch research content has not undergone independent clinical peer review.
