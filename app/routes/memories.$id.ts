import type { ActionFunctionArgs } from 'react-router';
import { deleteMemory } from '../ai/memory.js';
import { dbReady } from '../db/index.js';

export async function action({ request, params }: ActionFunctionArgs) {
  await dbReady;
  if (request.method !== 'DELETE') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  await deleteMemory(params.id!);
  return Response.json({ success: true });
}
