import {getChatGPTUser} from '@/app/chatgpt-auth';
import {getRawDb} from '@/db';
import {json,checkMutation,readBody,accountFailure} from '@/lib/account-server';
export const dynamic='force-dynamic';
export async function PATCH(request:Request){
 const identity=await getChatGPTUser();
 if(!identity)return json({error:'Sign in to edit your profile.'},401);
 const invalid=checkMutation(request);if(invalid)return invalid;
 const body=await readBody(request);
 if(!body||typeof body.displayName!=='string'||!body.displayName.trim()||body.displayName.trim().length>80||typeof body.bio!=='string'||body.bio.length>500)return json({error:'Use a name of 1–80 characters and a bio of up to 500 characters.'},400);
 try {
  const displayName=body.displayName.trim();const bio=body.bio.trim();
  await getRawDb().prepare('INSERT INTO profiles (user_id, display_name, bio, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (user_id) DO UPDATE SET display_name = excluded.display_name, bio = excluded.bio, updated_at = excluded.updated_at').bind(identity.userId,displayName,bio,Date.now()).run();
  return json({user:{email:identity.email,displayName,bio}});
 }catch(error){return accountFailure(error);}
}
