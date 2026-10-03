import {sqliteTable, text, integer, primaryKey, index, check} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  bio: text('bio').notNull().default(''),
  updatedAt: integer('updated_at').notNull(),
});

export const favorites = sqliteTable('favorites', {
  userId: text('user_id').notNull(),
  kind: text('kind', {enum:['peptide','study']}).notNull(),
  itemId: text('item_id').notNull(),
  savedAt: integer('saved_at').notNull(),
}, table => [
  primaryKey({columns:[table.userId,table.kind,table.itemId]}),
  index('idx_favorites_user_saved').on(table.userId,table.savedAt),
  check('favorites_kind',sql`${table.kind} IN ('peptide', 'study')`),
]);
