import { eq } from 'drizzle-orm';
import { LocalIndex } from 'vectra';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync } from 'fs';
import { db } from '../db/index.js';
import { memories } from '../db/schema.js';

mkdirSync('./data/vectors', { recursive: true });

const index = new LocalIndex<{ content: string }>('./data/vectors');

let _embedder: ((text: string) => Promise<number[]>) | null = null;

async function embed(text: string): Promise<number[]> {
  if (!_embedder) {
    const { pipeline } = await import('@xenova/transformers');
    const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    _embedder = async (t: string) => {
      const out = await pipe(t, { pooling: 'mean', normalize: true });
      return Array.from(out.data as Float32Array);
    };
  }
  return _embedder(text);
}

async function ensureIndex(): Promise<void> {
  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }
}

export async function saveMemory(content: string, tags: string[]): Promise<string> {
  await ensureIndex();
  const id = uuidv4();
  const vector = await embed(content);
  await index.insertItem({ id, vector, metadata: { content } });
  await db.insert(memories).values({
    id,
    content,
    tags: JSON.stringify(tags),
    createdAt: new Date(),
  }).run();
  return id;
}

export async function searchMemories(query: string, topK = 5): Promise<string[]> {
  await ensureIndex();
  const vector = await embed(query);
  const results = await index.queryItems(vector, query, topK);
  return results.map(r => r.item.metadata.content as string);
}

export async function listMemories(): Promise<typeof memories.$inferSelect[]> {
  return db.select().from(memories).all();
}

export async function deleteMemory(id: string): Promise<void> {
  await ensureIndex();
  await index.deleteItem(id);
  await db.delete(memories).where(eq(memories.id, id)).run();
}
