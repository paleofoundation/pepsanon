import {chatGPTSignInPath,getChatGPTUser,safeRelativeReturnPath} from '@/app/chatgpt-auth';
import {Bookmark,BookOpen,UserRound} from 'lucide-react';
export const dynamic='force-dynamic';
export const metadata={title:'Log in',robots:{index:false,follow:false}};
async function LoginContent({returnTo}:{returnTo:string}){
 const user=await getChatGPTUser();
 return <section className="login-page"><div className="login-card"><span className="member-avatar"><Bookmark size={27}/></span><p className="section-kicker">YOUR PEPTIDE EVIDENCE LIBRARY</p><h1>{user?'Your account is ready':'Keep your research together.'}</h1><p>{user?'You are signed in. Open your library to save peptides, revisit studies, and edit your profile.':'Sign in to save peptides and studies, then find them in your personal library on any device.'}</p><div className="login-benefits"><span><BookOpen size={19}/>Favorite peptides</span><span><Bookmark size={19}/>Saved studies</span><span><UserRound size={19}/>Your research profile</span></div>{user?<a className="primary-action" href={returnTo}>Continue to your library</a>:<a className="primary-action" href={chatGPTSignInPath(returnTo)} target="_top">Continue with ChatGPT</a>}<p className="login-note">{user?`Signed in as ${user.email}`:'Sign in with your existing ChatGPT account. Your saved items remain private.'}</p><a className="quiet-link" href="/peptides">Explore the peptide library</a></div></section>;
}
export default async function Page({searchParams}:{searchParams:Promise<{returnTo?:string}>}){const params=await searchParams;return <LoginContent returnTo={safeRelativeReturnPath(typeof params.returnTo==='string'?params.returnTo:'/profile')}/>;}
