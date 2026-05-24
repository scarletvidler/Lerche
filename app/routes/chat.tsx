import {
  useActionData,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
} from "react-router";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { chat } from "../ai/claude.js";
import { dbReady } from "../db/index.js";
import { Header } from "../components/header.js";
import { Section } from "../components/section.js";

const ChatBody = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    await dbReady;
    const data = await request.formData();
    const body = {
      message: data.get("message"),
      conversationId: data.get("conversationId") ?? undefined,
    };
    const parsed = ChatBody.parse(body);
    const { message, conversationId = uuidv4() } = parsed;
    const result = await chat(message, conversationId);
    console.log("Chat result:", result);
    return { ...result, conversationId };
  } catch (error) {
    console.error("Chat error:", error);
    return { reply: "Sorry, something went wrong.", conversationId: "" };
  }
}

export function loader() {
  return {};
}

export default function Chat() {
  const data = useActionData<typeof action>();
  const endFetcher = useFetcher();

  function handleConversationEnd() {
    endFetcher.submit(
      { conversationId: data?.conversationId ?? "" },
      { action: "/conversation/end", method: "post" },
    );
  }

  return (
    <div>
      <Header content="Chatting" />
      <Section className="max-w-2xl mx-auto text-center">
        <p className="text-left text-xs text-gray-300 font-extralight font-mono">
          Type to Lerche
        </p>
        <form method="post" className="flex gap-2 mt-2 flex-col">
          {data?.conversationId && (
            <>
              <label htmlFor="conversationId">Conversation ID:</label>
              <input
                type="text"
                name="conversationId"
                value={data.conversationId}
              />
            </>
          )}
          <input
            type="text"
            name="message"
            placeholder="Type your message..."
            className="flex-1 p-2 rounded bg-gray-700 text-white"
          />
          <button type="submit" className="px-4 py-2 bg-purple-600 rounded">
            Send
          </button>
        </form>
      </Section>
      {data && (
        <Section className="max-w-2xl mx-auto mt-4">
          <h2 className="text-lg font-bold mb-2">Response:</h2>
          <p>{data.reply}</p>
        </Section>
      )}
      {data?.conversationId && (
        <Section className="max-w-2xl mx-auto mt-4">
          <button
            onClick={handleConversationEnd}
            className="px-4 py-2 bg-red-600 rounded"
          >
            End Conversation
          </button>
        </Section>
      )}
    </div>
  );
}
