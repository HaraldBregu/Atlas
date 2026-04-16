import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { openai } from "./client.js";
import type { Tool } from "../tools/types.js";
import { toolToFunction } from "../tools/registry.js";

export interface ChatOptions {
  model?: string;
  messages: ChatCompletionMessageParam[];
  tools?: Tool[];
  temperature?: number;
}

export async function chat(options: ChatOptions) {
  const { model = "gpt-4o", messages, tools, temperature } = options;

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    ...(tools?.length && {
      tools: tools.map(toolToFunction),
    }),
  });

  return response.choices[0];
}
