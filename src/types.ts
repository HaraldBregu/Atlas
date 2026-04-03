export type AssistantResponseMode = 'answer' | 'write' | 'edit';

export interface AgentHistoryMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatMessage {
  role: AgentHistoryMessage['role'];
  content: string;
}

export interface AgentModelConfig {
  providerId: string;
  modelId: string;
  temperature?: number;
  maxTokens?: number;
  apiKeyEnvVar?: string;
  baseURL?: string;
  baseURLEnvVar?: string;
}

export interface TextGenerationModel {
  generateText(messages: ChatMessage[]): Promise<string>;
  streamText(messages: ChatMessage[]): AsyncIterable<string>;
}

export interface GraphRunner<State = Record<string, unknown>> {
  invoke(input: State): Promise<State>;
}

export type NodeModelMap = Record<string, TextGenerationModel>;
export type AssistantGraphBuilder = (
  models: TextGenerationModel | NodeModelMap,
) => GraphRunner<any>;

export interface WebSearchResult {
  title: string;
  snippet: string;
  url?: string;
  publishedAt?: string;
}

export interface WebSearchClient {
  search(
    query: string,
    options?: { limit?: number },
  ): Promise<WebSearchResult[]>;
}

export interface AgentRuntimeContext {
  workspacePath?: string;
  webSearchClient?: WebSearchClient;
}

export interface GraphInputContext {
  prompt: string;
  history?: AgentHistoryMessage[];
}

export interface AgentDefinition {
  id: string;
  name: string;
  category: string;
  nodeModels: Record<string, AgentModelConfig>;
  streamableNodes?: string[];
  buildGraph: AssistantGraphBuilder;
  prepareGraph?: (
    baseBuildGraph: AssistantGraphBuilder,
    context: AgentRuntimeContext,
  ) => AssistantGraphBuilder;
  buildGraphInput: (context: GraphInputContext) => any;
  extractGraphOutput: (state: any) => string;
  extractThinkingLabel?: (state: any) => string | undefined;
}
