import { ASSISTANT_STATE_MESSAGES } from '../../messages.js';
import { loadPrompt } from '../../prompt-loader.js';
import type { AssistantState } from '../../state.js';
import type {
  TextGenerationModel,
  WebSearchClient,
  WebSearchResult,
} from '../../types.js';
import { createTextAgent } from '../shared/create-text-agent.js';

const SYSTEM_PROMPT = loadPrompt('./WEBSEARCH_SYSTEM.md', import.meta.url);
const NO_WEB_SEARCH_NEEDED = 'Web search was not required for this request.';
const NO_WEB_SEARCH_CLIENT =
  'Web search is enabled in the workflow, but no web search client is configured.';
const NO_WEB_SEARCH_RESULTS =
  'Web search ran but did not return relevant results.';

const summarizeWebResults = createTextAgent({
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context: {
    history: AssistantState['history'];
    prompt: string;
    results: WebSearchResult[];
  }) => buildHumanMessage(context.prompt, context.results),
});

export async function webSearchAgent(
  state: AssistantState,
  model: TextGenerationModel,
  client?: WebSearchClient,
): Promise<Partial<AssistantState>> {
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

  const results = await client.search(state.webSearchQuery || state.prompt, {
    limit: 5,
  });
  if (results.length === 0) {
    return {
      phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
      webSearchFindings: NO_WEB_SEARCH_RESULTS,
    };
  }

  const webSearchFindings = (
    await summarizeWebResults(
      {
        history: state.history,
        prompt: state.prompt,
        results,
      },
      model,
    )
  ).trim();

  return {
    phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
    webSearchFindings: webSearchFindings || NO_WEB_SEARCH_RESULTS,
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
        .join('\n'),
    )
    .join('\n\n');

  return [
    'User request:',
    prompt,
    '',
    'Search results:',
    formattedResults,
  ].join('\n');
}
