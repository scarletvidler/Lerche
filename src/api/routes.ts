import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { chat } from '../ai/claude.js';
import { listMemories, deleteMemory } from '../ai/memory.js';
import { getPersonality } from '../ai/personality.js';
import { reflect } from '../ai/reflect.js';

export const router = Router();

const ChatBody = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

const EndBody = z.object({
  conversationId: z.string(),
});

router.post('/chat', async (req, res) => {
  const parsed = ChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { message, conversationId = uuidv4() } = parsed.data;
  const result = await chat(message, conversationId);
  res.json(result);
});

router.post('/conversation/end', async (req, res) => {
  const parsed = EndBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const result = await reflect(parsed.data.conversationId);
  res.json(result);
});

router.get('/memories', async (_req, res) => {
  const all = await listMemories();
  res.json(all.map(m => ({ ...m, tags: JSON.parse(m.tags) })));
});

router.delete('/memories/:id', async (req, res) => {
  await deleteMemory(req.params.id);
  res.json({ success: true });
});

router.get('/personality', async (_req, res) => {
  const traits = await getPersonality();
  res.json(traits);
});
