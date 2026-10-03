export type FavoriteKind = 'peptide' | 'study';
export type Favorite = {kind:FavoriteKind; itemId:string; savedAt:number};
export type AccountUser = {email:string; displayName:string; bio:string};
export type AccountData = {user:AccountUser|null; favorites:Favorite[]};
export const favoriteKey = (kind:FavoriteKind, itemId:string) => `${kind}:${itemId}`;
