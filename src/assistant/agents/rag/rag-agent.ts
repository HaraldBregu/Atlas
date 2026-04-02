import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { toLangChainHistoryMessages } from '../../history';
import { ASSISTANT_STATE_MESSAGES } from '../../messages';
import { loadPrompt } from '../../prompt-loader';
import type { AssistantState } from '../../state';
import { extractTextContent } from '../shared/text-content';
import type { RagRetriever, RetrievedDocument } from './rag-retriever';

const SYSTEM_PROMPT = loadPrompt('./RAG_SYSTEM.md', import.meta.url);
const NO_RAG_NEEDED = 'Workspace retrieval was not required for this request.';
const NO_RAG_CONTEXT = 'No relevant workspace context was found.';
const NO_RAG_RETRIEVER = 'Workspace retrieval is enabled in the workflow, but no retriever is configured.';

export async function ragAgent(
	state: typeof AssistantState.State,
	model: BaseChatModel,
	retriever?: RagRetriever
): Promise<Partial<typeof AssistantState.State>> {
	if (!state.useRag) {
		return {
			phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
			ragFindings: NO_RAG_NEEDED,
		};
	}

	if (retriever === undefined) {
		return {
			phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
			ragFindings: NO_RAG_RETRIEVER,
		};
	}

	const documents = await retriever.retrieve(state.ragQuery || state.prompt);
	if (documents.length === 0) {
		return {
			phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
			ragFindings: NO_RAG_CONTEXT,
		};
	}

	const response = await model.invoke([
		new SystemMessage(SYSTEM_PROMPT),
		...toLangChainHistoryMessages(state.history),
		new HumanMessage(buildHumanMessage(state.prompt, documents)),
	]);

	return {
		phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
		ragFindings: extractTextContent(response.content).trim() || NO_RAG_CONTEXT,
	};
}

function buildHumanMessage(prompt: string, documents: RetrievedDocument[]): string {
	const context = documents
		.map((document, index) =>
			[
				`Snippet ${index + 1}:`,
				`Source: ${getSourceLabel(document)}`,
				document.pageContent.trim(),
			].join('\n')
		)
		.join('\n\n---\n\n');

	return ['User request:', prompt, '', 'Workspace context:', context].join('\n');
}

function getSourceLabel(document: RetrievedDocument): string {
	if (typeof document.metadata['source'] === 'string' && document.metadata['source'].trim().length > 0) {
		return document.metadata['source'];
	}

	if (typeof document.metadata['fileName'] === 'string' && document.metadata['fileName'].trim().length > 0) {
		return document.metadata['fileName'];
	}

	return 'workspace-snippet';
}
