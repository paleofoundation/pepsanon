export type AuthorId = 'alex-leaf' | 'briana-theroux';
export type Author = {
  id: AuthorId;
  name: string;
  credentials?: string;
  initials: string;
  role: string;
  specialty: string;
  photo?: string;
  bio: string;
  background: {label: string; detail: string}[];
  links: {label: string; url: string}[];
};
export const authors: Record<AuthorId, Author> = {
  'alex-leaf': {
    id: 'alex-leaf',
    name: 'Alex Leaf',
    credentials: 'MS, CISSN',
    initials: 'AL',
    role: 'Primary investigator',
    specialty: 'Nutrition research & scientific communication',
    photo: '/authors/alex-leaf.jpeg',
    bio: 'Alex Leaf is a primary investigator at Peptide Evidence and a nutrition researcher and writer. He earned his master’s degree in nutrition from Bastyr University in 2016. His background includes research and writing for Examine and teaching in the University of Western States’ Human Nutrition and Functional Medicine master’s program. His published work includes peer-reviewed papers on nutrition and body composition, as well as educational contributions to nutrition certification programs. He focuses on interpreting research and communicating its practical implications to a broad audience.',
    background: [
      {label: 'Education', detail: 'Master’s degree in nutrition, Bastyr University'},
      {label: 'Published work', detail: 'Peer-reviewed nutrition research, scientific reviews, and professional education'},
    ],
    links: [
      {label: 'Examine profile', url: 'https://examine.com/experts/alex-leaf/'},
      {label: 'Publications', url: 'https://alexleaf.com/other-publications/'},
      {label: 'Personal biography', url: 'https://alexleaf.com/about/'},
    ],
  },
  'briana-theroux': {
    id: 'briana-theroux',
    name: 'Briana Theroux',
    initials: 'BT',
    role: 'Primary investigator',
    specialty: 'Eating psychology & behavioral health',
    bio: 'Briana Theroux is a primary investigator at Peptide Evidence and an applied practitioner in eating psychology and behavioral health. Her work examines the relationships among physiology, behavior, and health-related decisions. She is certified in Eating Psychology through the Institute for the Psychology of Eating. Her professional biography describes more than a decade of experience working with complex eating and health patterns, with an emphasis on individualized nutrition strategies and their application in everyday life.',
    background: [
      {label: 'Training', detail: 'Eating Psychology certification, Institute for the Psychology of Eating'},
      {label: 'Professional focus', detail: 'Eating behavior, nutrition, and health-related decision-making'},
    ],
    links: [{label: 'Professional biography', url: 'https://brianatheroux.com/about/'}],
  },
};
export const primaryInvestigators: AuthorId[] = ['alex-leaf', 'briana-theroux'];
export type ContentCredit = { authorIds: AuthorId[]; reviewerIds: AuthorId[] };
// Investigator roles were supplied by the site owner. Add author/reviewer IDs only
// when the owner supplies page-specific attribution; a role is not a byline.
export const contentCredits: Record<string, ContentCredit> = {
  '/peptides/bpc-157': {authorIds: [], reviewerIds: []},
  '/peptides/tb-500': {authorIds: [], reviewerIds: []},
  '/peptides/ghk-cu': {authorIds: [], reviewerIds: []},
  '/peptides/cjc-1295': {authorIds: [], reviewerIds: []},
  '/peptides/ipamorelin': {authorIds: [], reviewerIds: []},
  '/peptides/semaglutide': {authorIds: [], reviewerIds: []},
  '/peptides/tirzepatide': {authorIds: [], reviewerIds: []},
  '/peptides/collagen': {authorIds: [], reviewerIds: []},
  '/questions': {authorIds: [], reviewerIds: []},
};
