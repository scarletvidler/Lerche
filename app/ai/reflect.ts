import Anthropic from "@anthropic-ai/sdk";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { messages } from "../db/schema.js";
import { saveMemory } from "./memory.js";
import { updatePersonality } from "./personality.js";

let _client: Anthropic | undefined;
const getClient = () =>
  (_client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));
const getModel = () => process.env.MODEL ?? "claude-sonnet-4-6";

interface ReflectionResult {
  memories: Array<{ content: string; tags: string[] }>;
  personality_updates: Record<string, number>;
}

export async function reflect(conversationId: string): Promise<{
  memoriesSaved: number;
  traitsUpdated: string[];
}> {
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .all();

  if (history.length === 0) return { memoriesSaved: 0, traitsUpdated: [] };

  const transcript = history
    .map((m) => `${m.role === "user" ? "User" : "Companion"}: ${m.content}`)
    .join("\n");

  const response = await getClient().messages.create({
    model: getModel(),
    max_tokens: 1024,
    system: `You are a reflection engine for a personal AI companion. Analyse a conversation transcript and return a JSON object with two keys:

1. "memories" — facts worth remembering about the user. Each item: { "content": string, "tags": string[] }. Only lasting, useful facts (preferences, experiences, feelings, life details). Skip small talk.

2. "personality_updates" — small trait adjustments based on what resonated with this user. Trait names: warmth, curiosity, directness, playfulness, empathy. Values: -0.1 to +0.1. Only include traits that clearly warrant a change.

Respond with valid JSON only, no commentary.`,
    messages: [{ role: "user", content: `Transcript:\n${transcript}` }],
  });

  console.log("Reflection response:", response);

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  let result: ReflectionResult;
  try {
    result = JSON.parse(raw);
  } catch {
    console.error("Failed to parse reflection result as JSON:", raw);
    return { memoriesSaved: 0, traitsUpdated: [] };
  }

  console.log("Parsed reflection result:", result);

  const mems = result.memories ?? [];
  const updates = result.personality_updates ?? {};

  await Promise.all(mems.map((m) => saveMemory(m.content, m.tags ?? [])));
  await updatePersonality(updates);

  return { memoriesSaved: mems.length, traitsUpdated: Object.keys(updates) };
}
