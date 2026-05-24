import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { mkdirSync } from 'fs';
import * as schema from './schema.js';

mkdirSync('./data', { recursive: true });

const client = createClient({ url: 'file:./data/app.db' });
export const db = drizzle(client, { schema });

const DEFAULT_TRAITS = [
  { trait: 'warmth',      value: 0.7, description: 'How warm and nurturing the tone feels' },
  { trait: 'curiosity',   value: 0.7, description: "How curious and interested in the user's life" },
  { trait: 'directness',  value: 0.5, description: 'How direct vs gentle in responses' },
  { trait: 'playfulness', value: 0.5, description: 'How lighthearted vs serious' },
  { trait: 'empathy',     value: 0.8, description: 'How emotionally attuned and validating' },
];

async function setupDb(): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS personality (
      trait TEXT PRIMARY KEY,
      value REAL NOT NULL,
      description TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  const now = Math.floor(Date.now() / 1000);
  for (const t of DEFAULT_TRAITS) {
    await client.execute({
      sql: 'INSERT OR IGNORE INTO personality (trait, value, description, updated_at) VALUES (?, ?, ?, ?)',
      args: [t.trait, t.value, t.description, now],
    });
  }
}

export const dbReady = setupDb();
