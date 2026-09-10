import {sqliteTable,text,integer,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const pieces=sqliteTable('pieces',{id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull(),body:text('body').notNull(),kind:text('kind').notNull(),media:text('media'),created:text('created').notNull() },t=>[index('pieces_owner').on(t.owner)]);
export const rooms=sqliteTable('rooms',{id:text('id').primaryKey(),owner:text('owner').notNull(),kind:text('kind').notNull(),inviteHash:text('invite_hash').notNull(),state:text('state').notNull(),rev:integer('rev').notNull().default(0),created:text('created').notNull()});
export const members=sqliteTable('members',{room:text('room').notNull(),user:text('user').notNull(),name:text('name').notNull()},t=>[primaryKey({columns:[t.room,t.user]}),index('members_user').on(t.user)]);
export const media=sqliteTable('media',{id:text('id').primaryKey(),owner:text('owner').notNull(),mime:text('mime').notNull(),name:text('name').notNull()});
export const budgets=sqliteTable('budgets',{user:text('user').primaryKey(),window:integer('window').notNull(),count:integer('count').notNull()});
export const joinRequests=sqliteTable('join_requests',{room:text('room').notNull(),user:text('user').notNull(),name:text('name').notNull()},t=>[primaryKey({columns:[t.room,t.user]})]);
