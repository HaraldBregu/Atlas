import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { toLangChainHistoryMessages } from '../../history';
import { ASSISTANT_STATE_MESSAGES } from '../../messages';
import { loadPrompt } from '../../prompt-loader';
import type { AssistantState } from '../../state';
import { extractTextContent } from '../shared/text-content';

const SYSTEM_PROMPT = loadPrompt('./WRITER_SYSTEM.md', import.meta.url);

export async function writerAgent(
	state: typeof AssistantState.State,
	model: BaseChatModel
): Promise<Partial<typeof AssistantState.State>> {
	const messages = [
		new SystemMessage(SYSTEM_PROMPT),
		...toLangChainHistoryMessages(state.history),
		new HumanMessage(buildHumanMessage(state)),
	];

	let response = '';
	const stream = await model.stream(messages);
	for await (const chunk of stream) {
		const token = extractTextContent(chunk.content);
		if (token.length > 0) {
			response += token;
		}
	}

	return {
		phaseLabel: ASSISTANT_STATE_MESSAGES.WRITING,
		response,
	};
}

function buildHumanMessage(state: typeof AssistantState.State): string {
	return [
		`Response mode: ${state.mode}`,
		'',
		'User request:',
		state.prompt,
		'',
		'Orchestrator notes:',
		`<planning_notes>\n${state.planningNotes || 'No planning notes.'}\n</planning_notes>`,
		'',
		'Web-search findings:',
		`<web_findings>\n${state.webSearchFindings || 'No web-search findings.'}\n</web_findings>`,
		'',
		'Workspace retrieval findings:',
		`<rag_findings>\n${state.ragFindings || 'No workspace findings.'}\n</rag_findings>`,
	].join('\n');
}
