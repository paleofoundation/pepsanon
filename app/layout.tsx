import type {Metadata} from 'next';
import './globals.css';
import './member-experience.css';
import './research-details.css';
import {Shell} from '@/components/peptide/shell';
import {AccountProvider} from '@/components/peptide/account';
import {getChatGPTUser,chatGPTSignOutPath} from './chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:'Peptides Anonymous | Questions, studies, and evidence grades',template:'%s | Peptides Anonymous'},description:'A question-led peptide research library with concise answers, primary studies, and transparent, outcome-specific evidence grades.',icons:{icon:[{url:'/brand/pepsanon-icon.png',type:'image/png'}],shortcut:'/brand/pepsanon-icon.png',apple:'/brand/pepsanon-icon.png'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const user=await getChatGPTUser();return <html lang="en"><body><AccountProvider initialUser={user?{email:user.email,displayName:user.displayName,bio:''}:null} signOutHref={chatGPTSignOutPath('/')}><Shell>{children}</Shell></AccountProvider></body></html>}
