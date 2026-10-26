import inventory from './data/focus-pages.json';
import excerpts from './data/focus-evidence.json';
import type {CorpusPassage} from './corpus-types';

export const focusPeptides = inventory.peptides;
export const focusStacks = inventory.stacks;
export type FocusPeptide = (typeof focusPeptides)[number];
export type FocusStack = (typeof focusStacks)[number];
export const focusEvidence = excerpts as Record<string, (CorpusPassage & {recordId: string; label: string})[]>;
export const focusContext: Record<string, {overview: string; limit: string}> = {
  tesamorelin: {
    overview: 'The local papers examine tesamorelin in specific clinical populations, including diabetes and HIV-associated muscle imaging. The excerpts below retain the study population, route and endpoint.',
    limit: 'These findings belong to the population and intervention in each paper. They do not establish outcomes for the tesamorelin combinations listed on this site.',
  },
  'kisspeptin-10': {
    overview: 'The linked studies administered kisspeptin-10. They include human hormone-response experiments and animal physiology studies. Other kisspeptin forms remain separately identified in the source library.',
    limit: 'A hormone response is a measured endpoint, not a substitute for a demonstrated fertility or other clinical outcome. Animal findings and studies of another kisspeptin form are not interchangeable with these experiments.',
  },
  oxytocin: {
    overview: 'The local oxytocin papers cover different populations, delivery methods and outcomes. The trial excerpt below reports both an overall null result and a subgroup observation; the full study records preserve that context.',
    limit: 'Keep the population, route and measured outcome attached to each result. Studies of oxytocin analogues remain filed under their own MANIFEST topic.',
  },
  'll-37': {
    overview: 'The linked papers investigate LL-37 in bacterial and immune-cell experiments. The reported laboratory concentrations and biofilm findings are presented as laboratory evidence.',
    limit: 'Laboratory exposure is not a clinical dosing schedule. These experiments do not establish a treatment benefit or a human administration regimen.',
  },
};
