import {getAccount,json,accountFailure} from '@/lib/account-server';
export const dynamic='force-dynamic';
export async function GET(){try{return json(await getAccount());}catch(error){return accountFailure(error);}}
