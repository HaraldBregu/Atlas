import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { toLangChainHistoryMessages } from '../../history';
import { ASSISTANT_STATE_MESSAGES } from '../../messages';
import { loadPrompt } from '../../prompt-loader';
import type { AssistantState } from '../../state';
import type { WebSearchClient, WebSearchResult } from '../../types';
import { extractTextContent } from '../shared/text-content';

const SYSTEM_PROMPT = loadPrompt('./WEBSEARCH_SYSTEM.md', import.meta.url);
const NO_WEB_SEARCH_NEEDED = 'Web search was not required for this request.';
const NO_WEB_SEARCH_CLIENT = 'Web search is enabled in the workflow, but no web search client is configured.';
const NO_WEB_SEARCH_RESULTS = 'Web search ran but did not return relevant results.';

export async function webSearchAgent(
	state: typeof AssistantState.State,
	model: BaseChatModel,
	client?: WebSearchClient
): Promise<Partial<typeof AssistantState.State>> {
	if (!state.useWebSearch) {
		return {
			phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
			webSearchFindings: NO_WEB_SEARCH_NEEDED,
		};
	}

	if (client === undefined) {
		return {
			phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
			webSearchFindings: NO_WEB_SEARCH_CLIENT,
		};
	}

	const results = await client.search(state.webSearchQuery || state.prompt, { limit: 5 });
	if (results.length === 0) {
		return {
			phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
			webSearchFindings: NO_WEB_SEARCH_RESULTS,
		};
	}

	const response = await model.invoke([
		new SystemMessage(SYSTEM_PROMPT),
		...toLangChainHistoryMessages(state.history),
		new HumanMessage(buildHumanMessage(state.prompt, results)),
	]);

	return {
		phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
		webSearchFindings: extractTextContent(response.content).trim() || NO_WEB_SEARCH_RESULTS,
	};
}

function buildHumanMessage(prompt: string, results: WebSearchResult[]): string {
	const formattedResults = results
		.map((result, index) =>
			[
				`Result ${index + 1}:`,
				`Title: ${result.title}`,
				result.publishedAt ? `Published: ${result.publishedAt}` : '',
				result.url ? `URL: ${result.url}` : '',
				`Snippet: ${result.snippet}`,
			]
				.filter(Boolean)
				.join('\n')
		)
		.join('\n\n');

	return ['User request:', prompt, '', 'Search results:', formattedResults].join('\n');
}
