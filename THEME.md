# Peptide Evidence theme

The shared visual layer is ported from the owner-supplied `paleofoundation/microbiomemedicine` repository at commit `28ed85b6d510dfddf1720775b456771c7dc62763`.

Canonical references: `docs/DESIGN-SYSTEM.md`, `src/styles/theme-wp.css`, the captured header in `src/theme/themeHtml.ts`, `ArticleView`, `SectionNav`, and `PageSnapshot`.

`app/reference-theme.css` retains the source stylesheet. `app/globals.css` supplies turquoise tokens, local Inter/Lora fonts, the source FAQ and snapshot styling, and integration rules for the peptide content and author dialogs. Branding and subject matter are specific to Peptide Evidence. The source microbiome repository was read only.

The article template uses a full-width research hero, investigator panel, page snapshot, left section navigation, central article, and right related-content rail. Headings, native FAQ accordions, and numbered citation previews follow the supplied theme. Empty data fields are omitted.

Intentional responsive adaptation: section navigation stays available at medium desktop widths and moves into an accessible left drawer on mobile. Header search remains available at every width. The repository's frozen `_migration` screenshots were absent, so screenshot-level parity has not been certified.

Content lives in `lib/data/evidence.json` and `lib/data/community.json`. Peptide directory metadata lives in `lib/peptides.ts`. Investigator biographies, photo paths, and page-specific author/reviewer assignments live in `lib/authors.ts`. A page shows 'Written by' only when its author assignment has been supplied; otherwise it identifies the two primary investigators. The launch research content has not undergone independent clinical peer review.

## Homepage and accounts

The homepage composition, grouped search, editable profile (display name and bio), and study-favorite interaction are adapted from the same reference repository's `HomePage`, `SearchAutocomplete`, `dashboard/profile`, and `FavoriteStudyButton`. `home.module.css` retains its Inter/Lora type scale, two-column hero, collection grid, and research section. The homepage is `/`; the directory remains available at `/peptides`. Navigation uses accessible grouped megamenus and a mobile drawer.

Account identity uses Sites-managed Sign in with ChatGPT. Peptide Evidence profiles and favorites use its own D1 database, with every read and mutation scoped to the authenticated site user. The reference site's Supabase identity and user data are not shared or copied. Favorites use canonical peptide IDs and source URLs; all displayed study metadata comes from the site's evidence catalog. The profile and account APIs use no-store responses.

## Stack guide contract

Stack detail pages use the shared research hero, prose typography, section drawer,
FAQ accordions, evidence table, and collapsible related-content rail. Their section
order and labels are defined once in `lib/stack-sections.ts`, independently of the
peptide guide taxonomy: Overview; Ingredients; Why combine them?; Combination
benefits; Safety & interactions; Forms & dosing; FAQs; Evidence; References.

The overview is continuous cited prose without a direct-answer box or kicker.
Main explanations stay visible. Every FAQ uses `GuideFaq` and its native details /
summary accordion, including keyboard operation and automatic opening for a FAQ
fragment link. Dose questions belong in Forms & dosing; other questions belong
under their fixed topic and retain their original fragment identifiers.

Every stack supplies ingredient identity, combination rationale, outcome evidence,
safety uncertainties, and regimen limitations. Do not equate a rationale with
proven additional benefit or fill evidence gaps with dosing instructions. Match
citations and reference numbering to the rendered section order. FAQ structured
data must use the same records as the visible accordions.

The right rail shows ingredient guides, related stacks, and the grading method.
An ingredient without a standalone guide links to its explanation within the
article. On mobile, this content remains available beneath the article; the left
section navigation uses the shared On this page drawer.
