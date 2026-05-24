import { useLoaderData } from "react-router";
import { listMemories } from "../ai/memory.js";
import { dbReady } from "../db/index.js";
import { Header } from "../components/header.js";
import { Section } from "../components/section.js";

export async function loader() {
  await dbReady;

  const all = await listMemories();

  return all;
}

export default function Memories() {
  const memories = useLoaderData<typeof loader>();
  return (
    <div>
      <Header content="Memories" />
      <Section className="max-w-2xl mx-auto">
        <ul>
          {memories.map((memory) => (
            <li key={memory.id}>{memory.content}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
