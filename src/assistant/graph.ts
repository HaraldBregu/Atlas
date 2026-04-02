import { END, START, StateGraph } from '@langchain/langgraph';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AssistantState } from './state';
import type { NodeModelMap, WebSearchClient } from './types';
import { orchestratorAgent } from './agents/orchestrator/orchestrator-agent';
import { ragAgent } from './agents/rag/rag-agent';
import type { RagRetriever } from './agents/rag/rag-retriever';
import { webSearchAgent } from './agents/websearch/websearch-agent';
import { writerAgent } from './agents/writer/writer-agent';

export const ASSISTANT_NODE = {
	ORCHESTRATOR: 'orchestrator',
	WEBSEARCH: 'websearch',
	RAG: 'rag',
	WRITER: 'writer',
} as const;

export interface AssistantNodeModels {
	[ASSISTANT_NODE.WEBSEARCH]: BaseChatModel;
	[ASSISTANT_NODE.RAG]: BaseChatModel;
	[ASSISTANT_NODE.WRITER]: BaseChatModel;
}

export interface AssistantGraphDependencies {
	retriever?: RagRetriever;
	webSearchClient?: WebSearchClient;
}

export function buildGraph(
	models: BaseChatModel | NodeModelMap,
	dependencies: AssistantGraphDependencies = {}
) {
	return new StateGraph(AssistantState)
			.addNode(ASSISTANT_NODE.ORCHESTRATOR, (state: typeof AssistantState.State) =>
				orchestratorAgent(state)
			)
			.addNode(ASSISTANT_NODE.WEBSEARCH, (state: typeof AssistantState.State) =>
				webSearchAgent(
					state,
					resolveNodeModel(models, ASSISTANT_NODE.WEBSEARCH),
					dependencies.webSearchClient
				)
			)
			.addNode(ASSISTANT_NODE.RAG, (state: typeof AssistantState.State) =>
				ragAgent(state, resolveNodeModel(models, ASSISTANT_NODE.RAG), dependencies.retriever)
			)
			.addNode(ASSISTANT_NODE.WRITER, (state: typeof AssistantState.State) =>
				writerAgent(state, resolveNodeModel(models, ASSISTANT_NODE.WRITER))
			)
		.addEdge(START, ASSISTANT_NODE.ORCHESTRATOR)
		.addEdge(ASSISTANT_NODE.ORCHESTRATOR, ASSISTANT_NODE.WEBSEARCH)
		.addEdge(ASSISTANT_NODE.ORCHESTRATOR, ASSISTANT_NODE.RAG)
		.addEdge([ASSISTANT_NODE.WEBSEARCH, ASSISTANT_NODE.RAG], ASSISTANT_NODE.WRITER)
		.addEdge(ASSISTANT_NODE.WRITER, END)
		.compile();
}

function resolveNodeModel(models: BaseChatModel | NodeModelMap, nodeName: string): BaseChatModel {
	if (isBaseChatModel(models)) {
		return models;
	}

	const model = models[nodeName];
	if (model === undefined) {
		throw new Error(`Missing model for assistant node "${nodeName}".`);
	}

	return model;
}

function isBaseChatModel(models: BaseChatModel | NodeModelMap): models is BaseChatModel {
	return typeof (models as BaseChatModel).invoke === 'function';
}
