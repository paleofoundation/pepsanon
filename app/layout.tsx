import type {Metadata} from 'next';
import './globals.css';
import './member-experience.css';
import './research-details.css';
import './policies.css';
import './brand.css';
import './stacks.css';
import {StructuredData} from '@/components/peptide/structured-data';
import {SITE_ORIGIN} from '@/lib/seo';
import {Shell} from '@/components/peptide/shell';
import {AccountProvider} from '@/components/peptide/account';
import {getChatGPTUser,chatGPTSignOutPath} from './chatgpt-auth';
export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:new URL(SITE_ORIGIN),verification:{google:'PfJNIh5q7mZYFOvvg9IBbmnzPXv-eK5-uFhWLtCjQyM'},title:{default:'Peptides Anonymous | Questions, studies, and evidence grades',template:'%s | Peptides Anonymous'},description:'A question-led peptide research library with concise answers, primary studies, and transparent, outcome-specific evidence grades.',icons:{icon:[{url:'/brand/pepsanon-icon.png',type:'image/png'}],shortcut:'/brand/pepsanon-icon.png',apple:'/brand/pepsanon-icon.png'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const user=await getChatGPTUser();return <html lang="en"><body><StructuredData data={[{'@context':'https://schema.org','@type':'Organization','@id':`${SITE_ORIGIN}/#organization`,name:'Peptides Anonymous',alternateName:'Pepsanon',url:SITE_ORIGIN,logo:`${SITE_ORIGIN}/brand/pepsanon-logo.png`},{'@context':'https://schema.org','@type':'WebSite','@id':`${SITE_ORIGIN}/#website`,name:'Peptides Anonymous',alternateName:'Pepsanon',url:SITE_ORIGIN,inLanguage:'en'}]}/><AccountProvider initialUser={user?{email:user.email,displayName:user.displayName,bio:''}:null} signOutHref={chatGPTSignOutPath('/')}><Shell>{children}</Shell></AccountProvider></body></html>}
