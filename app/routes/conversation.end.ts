import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { reflect } from "../ai/reflect.js";
import { dbReady } from "../db/index.js";

const EndBody = z.object({
  conversationId: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await dbReady;
  const body = await request.json();
  const parsed = EndBody.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = await reflect(parsed.data.conversationId);
  return Response.json(result);
}
