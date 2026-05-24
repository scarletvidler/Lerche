import { listMemories } from '../ai/memory.js';
import { dbReady } from '../db/index.js';

export async function loader() {
  await dbReady;
  const all = await listMemories();
  return Response.json(all.map(m => ({ ...m, tags: JSON.parse(m.tags) })));
}
