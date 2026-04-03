import { AssistantAgent } from './definition.js';
import { createOpenAICompatibleModel } from './providers/openai-compatible-model.js';
import type {
  AgentDefinition,
  AgentHistoryMessage,
  AgentRuntimeContext,
  ChatMessage,
  GraphRunner,
  NodeModelMap,
  TextGenerationModel,
} from './types.js';

export interface RunAssistantOptions {
  prompt: string;
  workspacePath?: string;
  history?: AgentHistoryMessage[];
  dryRun?: boolean;
}

export async function runAssistant(
  options: RunAssistantOptions,
): Promise<string> {
  const graph = createPreparedGraph({
    workspacePath: options.workspacePath,
    dryRun: options.dryRun,
  });

  const state = await graph.invoke(
    AssistantAgent.buildGraphInput({
      prompt: options.prompt,
      history: options.history,
    }),
  );

  return AssistantAgent.extractGraphOutput(state);
}

export function createPreparedGraph(options: {
  workspacePath?: string;
  dryRun?: boolean;
}): GraphRunner<Record<string, unknown>> {
  const context: AgentRuntimeContext = {
    workspacePath: options.workspacePath,
  };
  const buildGraph = AssistantAgent.prepareGraph
    ? AssistantAgent.prepareGraph(AssistantAgent.buildGraph, context)
    : AssistantAgent.buildGraph;

  const models = options.dryRun
    ? createMockNodeModels(AssistantAgent)
    : createRuntimeNodeModels(AssistantAgent);

  return buildGraph(models);
}

function createRuntimeNodeModels(definition: AgentDefinition): NodeModelMap {
  return Object.fromEntries(
    Object.entries(definition.nodeModels).map(([nodeName, config]) => [
      nodeName,
      createOpenAICompatibleModel(config),
    ]),
  ) as NodeModelMap;
}

function createMockNodeModels(definition: AgentDefinition): NodeModelMap {
  return Object.fromEntries(
    Object.keys(definition.nodeModels).map((nodeName) => [
      nodeName,
      createMockModel(nodeName),
    ]),
  ) as NodeModelMap;
}

function createMockModel(nodeName: string): TextGenerationModel {
  return {
    generateText: async (messages) => renderMockResponse(nodeName, messages),
    async *streamText(messages) {
      yield renderMockResponse(nodeName, messages);
    },
  };
}

function renderMockResponse(nodeName: string, messages: ChatMessage[]): string {
  const prompt = extractPromptFromMessages(messages);

  if (nodeName === 'websearch') {
    return 'Mock web-search note: no external web-search client is configured in dry-run mode.';
  }

  if (nodeName === 'rag') {
    return 'Mock workspace note: dry-run mode skips model-based retrieval summarization.';
  }

  if (nodeName === 'writer') {
    return `Dry-run response for: ${prompt}`;
  }

  return `Dry-run note for ${nodeName}: ${prompt}`;
}

function extractPromptFromMessages(messages: ChatMessage[]): string {
  const latestContent = messages.at(-1)?.content ?? '';
  const userRequestMatch = latestContent.match(
    /User request:\n([\s\S]*?)(?:\n\n|$)/,
  );
  if (userRequestMatch?.[1]) {
    return userRequestMatch[1].trim();
  }

  return latestContent.trim();
}
