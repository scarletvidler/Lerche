import { getPersonality } from '../ai/personality.js';
import { dbReady } from '../db/index.js';

export async function loader() {
  await dbReady;
  const traits = await getPersonality();
  return Response.json(traits);
}
