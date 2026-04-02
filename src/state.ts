import { Annotation } from '@langchain/langgraph';
import type { AgentHistoryMessage, AssistantResponseMode } from './types.js';

export const AssistantState = Annotation.Root({
	prompt: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	history: Annotation<AgentHistoryMessage[]>({
		reducer: (_current, next) => next,
		default: () => [],
	}),

	mode: Annotation<AssistantResponseMode>({
		reducer: (_current, next) => next,
		default: () => 'answer',
	}),

	useWebSearch: Annotation<boolean>({
		reducer: (_current, next) => next,
		default: () => false,
	}),

	useRag: Annotation<boolean>({
		reducer: (_current, next) => next,
		default: () => false,
	}),

	webSearchQuery: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	ragQuery: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	planningNotes: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	webSearchFindings: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	ragFindings: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	phaseLabel: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),

	response: Annotation<string>({
		reducer: (_current, next) => next,
		default: () => '',
	}),
});
