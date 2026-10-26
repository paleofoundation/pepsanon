import {pageMetadata} from '@/lib/seo';
import {Directory} from '@/components/peptide/directory';
export const metadata=pageMetadata('Peptide directory: benefits, safety, and research','Browse all priority peptide pages, their local study records, and clearly identified evidence gaps.','/peptides');
export default function Page(){return <Directory/>;}
