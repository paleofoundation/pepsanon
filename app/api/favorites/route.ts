import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getRawDb} from '@/db';
import {json,checkMutation,readBody,validFavorite,accountFailure} from '@/lib/account-server';
export const dynamic='force-dynamic';
async function mutate(request:Request,save:boolean) {
  const identity=await getChatGPTUser();
  if(!identity)return json({error:'Sign in to save items to your library.'},401);
  const invalid=checkMutation(request);if(invalid)return invalid;
  const body=await readBody(request);
  if(!body||!validFavorite(body.kind,body.itemId))return json({error:'That peptide or study is not in this library.'},400);
  try {
    const db=getRawDb();
    if(save)await db.prepare('INSERT INTO favorites (user_id, kind, item_id, saved_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id, kind, item_id) DO NOTHING').bind(identity.userId,body.kind,body.itemId,Date.now()).run();
    else await db.prepare('DELETE FROM favorites WHERE user_id = ? AND kind = ? AND item_id = ?').bind(identity.userId,body.kind,body.itemId).run();
    return json({saved:save});
  }catch(error){return accountFailure(error);}
}
export function PUT(request:Request){return mutate(request,true);}
export function DELETE(request:Request){return mutate(request,false);}
