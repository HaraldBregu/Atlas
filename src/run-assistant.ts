import { ChatOpenAI } from '@langchain/openai';
import { AssistantAgent } from './definition.js';
import type {
	AgentDefinition,
	AgentHistoryMessage,
	AgentRuntimeContext,
	NodeModelMap,
} from './types.js';

interface GraphRunner {
	invoke(input: Record<string, unknown>): Promise<Record<string, unknown>>;
}

export interface RunAssistantOptions {
	prompt: string;
	workspacePath?: string;
	history?: AgentHistoryMessage[];
	dryRun?: boolean;
}

export async function runAssistant(options: RunAssistantOptions): Promise<string> {
	const graph = createPreparedGraph({
		workspacePath: options.workspacePath,
		dryRun: options.dryRun,
	});

	const state = await graph.invoke(
		AssistantAgent.buildGraphInput({
			prompt: options.prompt,
			history: options.history,
		})
	);

	return AssistantAgent.extractGraphOutput(state);
}

export function createPreparedGraph(options: {
	workspacePath?: string;
	dryRun?: boolean;
}): GraphRunner {
	const context: AgentRuntimeContext = {
		workspacePath: options.workspacePath,
	};
	const buildGraph = AssistantAgent.prepareGraph
		? AssistantAgent.prepareGraph(AssistantAgent.buildGraph, context)
		: AssistantAgent.buildGraph;

	const models = options.dryRun
		? createMockNodeModels(AssistantAgent)
		: createRuntimeNodeModels(AssistantAgent);

	return buildGraph(models) as GraphRunner;
}

function createRuntimeNodeModels(definition: AgentDefinition): NodeModelMap {
	const apiKey = process.env.OPENAI_API_KEY?.trim();
	if (!apiKey) {
		throw new Error('OPENAI_API_KEY is required unless you run with --dry-run.');
	}

	return Object.fromEntries(
		Object.entries(definition.nodeModels).map(([nodeName, config]) => [
			nodeName,
			new ChatOpenAI({
				apiKey,
				model: config.modelId,
				temperature: config.temperature,
				maxTokens: config.maxTokens,
			}),
		])
	) as unknown as NodeModelMap;
}

function createMockNodeModels(definition: AgentDefinition): NodeModelMap {
	return Object.fromEntries(
		Object.keys(definition.nodeModels).map((nodeName) => [nodeName, createMockModel(nodeName)])
	) as unknown as NodeModelMap;
}

function createMockModel(nodeName: string) {
	return {
		invoke: async (messages: { content: unknown }[]) => ({
			content: renderMockResponse(nodeName, messages),
		}),
		stream: async function* (messages: { content: unknown }[]) {
			yield {
				content: renderMockResponse(nodeName, messages),
			};
		},
	} as unknown as NodeModelMap[string];
}

function renderMockResponse(nodeName: string, messages: { content: unknown }[]): string {
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

function extractPromptFromMessages(messages: { content: unknown }[]): string {
	const latestContent = messages.at(-1)?.content;
	const asText = normalizeContent(latestContent);
	const userRequestMatch = asText.match(/User request:\n([\s\S]*?)(?:\n\n|$)/);
	if (userRequestMatch?.[1]) {
		return userRequestMatch[1].trim();
	}

	return asText.trim();
}

function normalizeContent(content: unknown): string {
	if (typeof content === 'string') {
		return content;
	}

	if (Array.isArray(content)) {
		return content
			.map((part) => {
				if (typeof part === 'string') {
					return part;
				}

				if (
					typeof part === 'object' &&
					part !== null &&
					'text' in part &&
					typeof part.text === 'string'
				) {
					return part.text;
				}

				return '';
			})
			.join('');
	}

	return '';
}
