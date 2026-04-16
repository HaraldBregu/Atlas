import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { env } from "../../config/index.js";
import { getAllTools, getTool } from "../../tools/index.js";
import { toolToFunction } from "../../tools/registry.js";
import type { McpToolCall, McpToolResult } from "../types.js";

function handleListTools(_req: IncomingMessage, res: ServerResponse) {
  const tools = getAllTools().map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: toolToFunction(t).function.parameters,
  }));

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ tools }));
}

async function handleCallTool(req: IncomingMessage, res: ServerResponse) {
  const body = await readBody(req);
  const { name, arguments: args } = JSON.parse(body) as McpToolCall;

  const tool = getTool(name);
  if (!tool) {
    const result: McpToolResult = {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  const output = await tool.execute(args);
  const result: McpToolResult = {
    content: [{ type: "text", text: JSON.stringify(output) }],
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(result));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export function startMcpServer(port = env.MCP_SERVER_PORT) {
  const server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/tools") {
      handleListTools(req, res);
    } else if (req.method === "POST" && req.url === "/tools/call") {
      await handleCallTool(req, res);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  server.listen(port, () => {
    console.log(`MCP server listening on port ${port}`);
  });

  return server;
}
