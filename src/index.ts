import { registerTool } from "./tools/index.js";
import { registerSkill } from "./skills/index.js";
import { calculatorTool } from "./tools/definitions/calculator.js";
import { webSearchTool } from "./tools/definitions/web-search.js";
import { summarizeSkill } from "./skills/definitions/summarize.js";
import { translateSkill } from "./skills/definitions/translate.js";

// Register tools
registerTool(calculatorTool);
registerTool(webSearchTool);

// Register skills
registerSkill(summarizeSkill);
registerSkill(translateSkill);

console.log("Atlas initialized");

// Example: start MCP server to expose tools
// import { startMcpServer } from "./mcp/index.js";
// startMcpServer();
