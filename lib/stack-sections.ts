// Stack navigation is a fixed editorial contract, independent of peptide guides.
// Specific questions remain within these sections and retain their own anchors.
export const stackContentSections = [
  {id: 'ingredients', label: 'Ingredients'},
  {id: 'rationale', label: 'Why combine them?'},
  {id: 'benefits', label: 'Combination benefits'},
  {id: 'safety', label: 'Safety & interactions'},
  {id: 'forms-dosing', label: 'Forms & dosing'},
] as const;

export type StackContentSectionId = Exclude<(typeof stackContentSections)[number]['id'], 'safety'>;

export const stackGuideSections = [
  {id: 'overview', label: 'Overview'},
  ...stackContentSections,
  {id: 'answers', label: 'FAQs'},
  {id: 'evidence', label: 'Evidence'},
  {id: 'studies', label: 'References'},
];
