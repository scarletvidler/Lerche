import { useLoaderData } from 'react-router';
import { listMemories } from '../ai/memory.js';
import { dbReady } from '../db/index.js';

export async function loader() {
  await dbReady;

  
  const all = await listMemories();
  return all;
}

export default function Memories() {
  const memories = useLoaderData<typeof loader>();
  return (
    <div>
      <h1 class>Memories</h1>
      <ul>
        {memories.map((memory) => (
          <li key={memory.id}>{memory.content}</li>
        ))}
      </ul>
    </div>
  );
}
