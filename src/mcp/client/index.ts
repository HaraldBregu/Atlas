import type { McpToolDefinition, McpToolCall, McpToolResult } from "../types.js";

export class McpClient {
  constructor(private baseUrl: string) {}

  async listTools(): Promise<McpToolDefinition[]> {
    const res = await fetch(`${this.baseUrl}/tools`);
    const data = (await res.json()) as { tools: McpToolDefinition[] };
    return data.tools;
  }

  async callTool(call: McpToolCall): Promise<McpToolResult> {
    const res = await fetch(`${this.baseUrl}/tools/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(call),
    });
    return (await res.json()) as McpToolResult;
  }
}
