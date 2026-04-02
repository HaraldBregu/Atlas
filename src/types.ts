import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

export type AssistantResponseMode = 'answer' | 'write' | 'edit';

export interface AgentHistoryMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface AgentModelConfig {
	providerId: string;
	modelId: string;
	temperature?: number;
	maxTokens?: number;
}

export type NodeModelMap = Record<string, BaseChatModel>;
export type AssistantGraphBuilder = (models: BaseChatModel | NodeModelMap) => unknown;

export interface WebSearchResult {
	title: string;
	snippet: string;
	url?: string;
	publishedAt?: string;
}

export interface WebSearchClient {
	search(query: string, options?: { limit?: number }): Promise<WebSearchResult[]>;
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
		context: AgentRuntimeContext
	) => AssistantGraphBuilder;
	buildGraphInput: (context: GraphInputContext) => Record<string, unknown>;
	extractGraphOutput: (state: Record<string, unknown>) => string;
	extractThinkingLabel?: (state: Record<string, unknown>) => string | undefined;
}
