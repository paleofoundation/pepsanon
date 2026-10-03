import {SearchResults} from '@/components/peptide/search';
export const metadata={title:'Search the evidence',robots:{index:false,follow:true}};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const {q}=await searchParams;return <SearchResults query={typeof q==='string'?q.slice(0,250):''}/>;}
