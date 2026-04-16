import { z } from "zod";
import type { Tool } from "../types.js";

export const calculatorTool: Tool<
  { expression: string },
  { result: number }
> = {
  name: "calculator",
  description: "Evaluate a mathematical expression",
  parameters: z.object({
    expression: z.string().describe("Math expression to evaluate"),
  }),
  async execute({ expression }) {
    const result = Function(`"use strict"; return (${expression})`)() as number;
    return { result };
  },
};
