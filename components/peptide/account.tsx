'use client';
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {Bookmark,Check,UserRound,LogOut} from 'lucide-react';
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {favoriteKey,type AccountData,type AccountUser,type FavoriteKind} from '@/lib/account-types';

type AccountContextValue=AccountData&{loading:boolean;error:string;pending:Set<string>;refresh:()=>Promise<void>;toggle:(kind:FavoriteKind,itemId:string)=>Promise<void>;updateProfile:(displayName:string,bio:string)=>Promise<void>;signOutHref:string};
const AccountContext=createContext<AccountContextValue|null>(null);
export function AccountProvider({initialUser,signOutHref,children}:{initialUser:AccountUser|null;signOutHref:string;children:ReactNode}) {
 const [data,setData]=useState<AccountData>({user:initialUser,favorites:[]});
 const [loading,setLoading]=useState(!!initialUser);
 const [error,setError]=useState('');
 const [pending,setPending]=useState<Set<string>>(new Set());
 const inFlight=useRef(new Set<string>());
 const refresh=useCallback(async()=>{
  setLoading(true);setError('');
  try {const response=await fetch('/api/account',{cache:'no-store'});const next=await response.json() as AccountData & {error?:string};if(!response.ok)throw new Error(next.error||'Unable to load your library.');setData(next);}
  catch(e){setError(e instanceof Error?e.message:'Unable to load your library.');}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function toggle(kind:FavoriteKind,itemId:string){
  const key=favoriteKey(kind,itemId);if(inFlight.current.has(key))return;
  const saved=data.favorites.some(f=>favoriteKey(f.kind,f.itemId)===key);
  inFlight.current.add(key);setPending(new Set(inFlight.current));
  try {
   const response=await fetch('/api/favorites',{method:saved?'DELETE':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,itemId})});
   const result=await response.json() as {error?:string;user:AccountUser};
   if(response.status===401){setData({user:null,favorites:[]});throw new Error('Your session ended. Sign in again to save this item.');}
   if(!response.ok)throw new Error(result.error||'Unable to save this item.');
   setData(current=>({...current,favorites:saved?current.favorites.filter(f=>favoriteKey(f.kind,f.itemId)!==key):[{kind,itemId,savedAt:Date.now()},...current.favorites.filter(f=>favoriteKey(f.kind,f.itemId)!==key)]}));
  }finally{inFlight.current.delete(key);setPending(new Set(inFlight.current));}
 }
 async function updateProfile(displayName:string,bio:string){
  const response=await fetch('/api/profile',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName,bio})});
  const result=await response.json() as {error?:string;user:AccountUser};if(!response.ok)throw new Error(result.error||'Unable to save your profile.');
  setData(current=>({...current,user:result.user}));
 }
 return <AccountContext.Provider value={{...data,loading,error,pending,refresh,toggle,updateProfile,signOutHref}}>{children}</AccountContext.Provider>;
}
export function useAccount(){const value=useContext(AccountContext);if(!value)throw new Error('AccountProvider is required.');return value;}

export function FavoriteButton({kind,itemId,title,hero=false}:{kind:FavoriteKind;itemId:string;title:string;hero?:boolean}){
 const account=useAccount();const [message,setMessage]=useState('');
 const key=favoriteKey(kind,itemId);const saved=account.favorites.some(f=>favoriteKey(f.kind,f.itemId)===key);const busy=account.pending.has(key);
 const className=`favorite-button${hero?' favorite-button-hero':''}${saved?' is-saved':''}`;
 async function onClick(){setMessage('');try{await account.toggle(kind,itemId);}catch(e){setMessage(e instanceof Error?e.message:'Please try again.');}}
 if(!account.user)return <a className={className} href={`/login?returnTo=${encodeURIComponent(kind==='peptide'?`/peptides/${itemId}`:'/sources')}`} aria-label={`Sign in to save ${title}`}><Bookmark size={16}/><span>Save {kind}</span></a>;
 if(account.error)return <span className="favorite-control"><button type="button" className={className} onClick={()=>void account.refresh()}><Bookmark size={16}/>Retry library</button><span className="favorite-error" role="status">{account.error}</span></span>;
 return <span className="favorite-control"><button type="button" className={className} aria-pressed={saved} aria-label={`${saved?'Remove':'Save'} ${title}${saved?' from':' to'} your library`} disabled={account.loading||busy} onClick={onClick}>{saved?<Check size={16}/>:<Bookmark size={16}/>}<span>{busy?'Saving…':saved?'Saved':`Save ${kind}`}</span></button>{message&&<span className="favorite-error" role="alert">{message}</span>}</span>;
}

export function AccountMenu(){
 const {user,favorites,signOutHref}=useAccount();
 if(!user)return <a className="account-sign-in" href="/login">Log in</a>;
 return <DropdownMenu><DropdownMenuTrigger asChild><button className="account-menu-trigger" aria-label="Open your account menu"><UserRound size={19}/><span>My account</span></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="account-dropdown"><p className="account-dropdown-name">{user.displayName}</p><DropdownMenuSeparator/><DropdownMenuItem asChild><a href="/profile"><Bookmark size={16}/>My library <span>{favorites.length}</span></a></DropdownMenuItem><DropdownMenuItem asChild><a href="/profile?tab=profile"><UserRound size={16}/>Edit profile</a></DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem asChild><a href={signOutHref} target="_top"><LogOut size={16}/>Log out</a></DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}
