import type { ActionFunctionArgs } from 'react-router';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { chat } from '../ai/claude.js';
import { dbReady } from '../db/index.js';

const ChatBody = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  await dbReady;
  const body = await request.json();
  const parsed = ChatBody.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { message, conversationId = uuidv4() } = parsed.data;
  const result = await chat(message, conversationId);
  return Response.json(result);
}

export function loader() {
  return Response.json({ message: 'Chat endpoint' });
}