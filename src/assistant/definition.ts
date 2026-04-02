import type { AgentDefinition } from './types';
import { buildGraph, ASSISTANT_NODE } from './graph';
import { ASSISTANT_STATE_MESSAGES } from './messages';
import { RagRetriever } from './agents/rag/rag-retriever';

const NODE_MODELS: AgentDefinition['nodeModels'] = {
	[ASSISTANT_NODE.WEBSEARCH]: {
		providerId: 'openai',
		modelId: 'gpt-4o',
		temperature: 0.1,
		maxTokens: 768,
	},
	[ASSISTANT_NODE.RAG]: {
		providerId: 'openai',
		modelId: 'gpt-4o',
		temperature: 0.1,
		maxTokens: 768,
	},
	[ASSISTANT_NODE.WRITER]: {
		providerId: 'openai',
		modelId: 'gpt-4o',
		temperature: 0.4,
		maxTokens: 1400,
	},
};

const definition: AgentDefinition = {
	id: 'assistant',
	name: 'Assistant',
	category: 'utility',
	nodeModels: NODE_MODELS,
	streamableNodes: [ASSISTANT_NODE.WRITER],
	buildGraph,

	prepareGraph(baseBuildGraph, context) {
		const retriever = context.workspacePath
			? new RagRetriever({ workspacePath: context.workspacePath })
			: undefined;

		return (models) =>
			buildGraph(models, {
				retriever,
				webSearchClient: context.webSearchClient,
			});
	},

	buildGraphInput(ctx) {
		return {
			prompt: ctx.prompt,
			history: ctx.history ?? [],
			mode: 'answer',
			useWebSearch: false,
			useRag: false,
			webSearchQuery: '',
			ragQuery: '',
			planningNotes: '',
			webSearchFindings: '',
			ragFindings: '',
			phaseLabel: ASSISTANT_STATE_MESSAGES.ORCHESTRATING,
			response: '',
		};
	},

	extractGraphOutput(state) {
		return typeof state['response'] === 'string' ? state['response'] : '';
	},

	extractThinkingLabel(state) {
		return typeof state['phaseLabel'] === 'string' ? state['phaseLabel'] : undefined;
	},
};

export { definition as AssistantAgent };
