import type {Metadata} from 'next';
import './globals.css';
import {Shell} from '@/components/peptide/shell';
export const metadata:Metadata={title:{default:'Peptide Evidence | Questions, studies, and evidence grades',template:'%s | Peptide Evidence'},description:'A question-led peptide research library with concise answers, primary studies, and transparent, outcome-specific evidence grades.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Shell>{children}</Shell></body></html>}
