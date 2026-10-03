import {requireChatGPTUser} from '@/app/chatgpt-auth';
import {Profile} from '@/components/peptide/profile';
export const dynamic='force-dynamic';
export const metadata={title:'My library',robots:{index:false,follow:false}};
async function ProtectedProfile({tab}:{tab:string}){await requireChatGPTUser(`/profile?tab=${encodeURIComponent(tab)}`);return <Profile initialTab={tab}/>;}
export default async function Page({searchParams}:{searchParams:Promise<{tab?:string}>}){const {tab}=await searchParams;return <ProtectedProfile tab={typeof tab==='string'?tab:'peptides'}/>;}
