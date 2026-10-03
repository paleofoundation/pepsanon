import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getRawDb} from '@/db';
import {peptides} from './peptides';
import {studies} from './studies';
import type {AccountData,Favorite,FavoriteKind} from './account-types';

export function json(data:unknown,status=200) {
  return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie'}});
}
export async function getAccount():Promise<AccountData> {
  const identity=await getChatGPTUser();
  if(!identity)return {user:null,favorites:[]};
  const db=getRawDb();
  const [profile,saved]=await Promise.all([
    db.prepare('SELECT display_name AS displayName, bio FROM profiles WHERE user_id = ?').bind(identity.userId).first<{displayName:string;bio:string}>(),
    db.prepare('SELECT kind, item_id AS itemId, saved_at AS savedAt FROM favorites WHERE user_id = ? ORDER BY saved_at DESC').bind(identity.userId).all<Favorite>(),
  ]);
  return {user:{email:identity.email,displayName:profile?.displayName||identity.displayName,bio:profile?.bio||''},favorites:saved.results};
}
export function validFavorite(kind:unknown,itemId:unknown):kind is FavoriteKind {
  if(typeof itemId!=='string')return false;
  return kind==='peptide'?peptides.some(p=>p.id===itemId):kind==='study'&&studies.some(s=>s.id===itemId);
}
export function checkMutation(request:Request) {
  const origin=request.headers.get('Origin');
  if(!origin||origin!==new URL(request.url).origin)return json({error:'This request must come from Peptide Evidence.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'Send a JSON request.'},415);
  if(Number(request.headers.get('Content-Length')||0)>10000)return json({error:'The submitted data is too long.'},413);
  return null;
}
export async function readBody(request:Request):Promise<Record<string,unknown>|null> {
  const text=await request.text();
  if(text.length>10000)return null;
  try {const value=JSON.parse(text);return value&&typeof value==='object'&&!Array.isArray(value)?value:null;} catch {return null;}
}
export function accountFailure(error:unknown) {
  console.error('Account storage request failed',error);
  return json({error:'Your library is temporarily unavailable. Please try again.'},503);
}
