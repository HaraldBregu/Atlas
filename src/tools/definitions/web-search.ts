import { z } from "zod";
import type { Tool } from "../types.js";

export const webSearchTool: Tool<
  { query: string },
  { results: string[] }
> = {
  name: "web_search",
  description: "Search the web for information",
  parameters: z.object({
    query: z.string().describe("Search query"),
  }),
  async execute({ query }) {
    // TODO: wire up real search API
    return { results: [`Placeholder result for: ${query}`] };
  },
};
