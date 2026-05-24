import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { personality } from '../db/schema.js';

export type Traits = Record<string, number>;

export async function getPersonality(): Promise<typeof personality.$inferSelect[]> {
  return db.select().from(personality).all();
}

export async function updatePersonality(deltas: Partial<Traits>): Promise<void> {
  const now = new Date();
  for (const [trait, delta] of Object.entries(deltas)) {
    const [row] = await db.select().from(personality).where(eq(personality.trait, trait)).all();
    if (!row) continue;
    const next = Math.max(0, Math.min(1, row.value + delta));
    await db.update(personality).set({ value: next, updatedAt: now }).where(eq(personality.trait, trait)).run();
  }
}

export function toSystemPrompt(traits: typeof personality.$inferSelect[]): string {
  const traitLines = traits
    .map(t => `  - ${t.trait} (${t.value.toFixed(2)}): ${t.description}`)
    .join('\n');

  return `You are a personal AI companion. Your personality traits (each on a 0–1 scale) shape how you speak:\n${traitLines}\n\nLet these values guide your tone naturally — don't announce them. Be present, warm, and genuine.`;
}
