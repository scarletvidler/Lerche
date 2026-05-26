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
      <Section className="max-w-3xl mx-auto">
        <ul>
          {memories.map((memory) => (
            <li
              className="my-4 py-5 space-x-1 border-y border-gray-200"
              key={memory.id}
            >
              {memory.content}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
