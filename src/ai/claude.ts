import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { messages } from '../db/schema.js';
import { searchMemories } from './memory.js';
import { getPersonality, toSystemPrompt } from './personality.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.MODEL ?? 'claude-sonnet-4-6';

export async function chat(
  userMessage: string,
  conversationId: string
): Promise<{ reply: string; conversationId: string }> {
  await db.insert(messages).values({
    id: uuidv4(),
    conversationId,
    role: 'user',
    content: userMessage,
    createdAt: new Date(),
  }).run();

  const [relevantMemories, traits] = await Promise.all([
    searchMemories(userMessage, 5),
    getPersonality(),
  ]);

  const basePrompt = toSystemPrompt(traits);
  const memoryBlock = relevantMemories.length
    ? `\n\nThings you remember about this person:\n${relevantMemories.map(m => `- ${m}`).join('\n')}`
    : '';

  const history = (await db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .all())
    .map((m): MessageParam => ({ role: m.role, content: m.content }));

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [{ type: 'text', text: basePrompt + memoryBlock, cache_control: { type: 'ephemeral' } }],
    messages: history,
  });

  const reply = response.content[0].type === 'text' ? response.content[0].text : '';

  await db.insert(messages).values({
    id: uuidv4(),
    conversationId,
    role: 'assistant',
    content: reply,
    createdAt: new Date(),
  }).run();

  return { reply, conversationId };
}
