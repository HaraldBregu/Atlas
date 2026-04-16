import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { zodToJsonSchema } from "../utils/zod-to-json-schema.js";
import type { Tool } from "./types.js";

const tools = new Map<string, Tool>();

export function registerTool(tool: Tool): void {
  tools.set(tool.name, tool);
}

export function getTool(name: string): Tool | undefined {
  return tools.get(name);
}

export function getAllTools(): Tool[] {
  return Array.from(tools.values());
}

export function toolToFunction(tool: Tool): ChatCompletionTool {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters),
    },
  };
}
