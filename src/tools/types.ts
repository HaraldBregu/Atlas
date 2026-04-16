import { z } from "zod";

export interface Tool<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  parameters: z.ZodType<TParams>;
  execute: (params: TParams) => Promise<TResult>;
}
