import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull(),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const memories = sqliteTable('memories', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  tags: text('tags').notNull(), // JSON-serialised string[]
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const personality = sqliteTable('personality', {
  trait: text('trait').primaryKey(),
  value: real('value').notNull(),
  description: text('description').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
