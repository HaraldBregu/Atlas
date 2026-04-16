import { config } from "dotenv";

config();

export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  MCP_SERVER_PORT: Number(process.env.MCP_SERVER_PORT ?? 3100),
} as const;
