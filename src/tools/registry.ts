import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { zodToJsonSchema } from "../utils/zod-to-json-schema.js";
import type { Tool } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tools = new Map<string, Tool<any, any>>();

export function registerTool(tool: Tool<any, any>): void {
  tools.set(tool.name, tool);
}

export function getTool(name: string): Tool<any, any> | undefined {
  return tools.get(name);
}

export function getAllTools(): Tool<any, any>[] {
  return Array.from(tools.values());
}

export function toolToFunction(tool: Tool<any, any>): ChatCompletionTool {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters),
    },
  };
}
