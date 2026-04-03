import { ASSISTANT_STATE_MESSAGES } from '../../messages.js';
import { loadPrompt } from '../../prompt-loader.js';
import type { AssistantState } from '../../state.js';
import type { TextGenerationModel } from '../../types.js';
import { createTextAgent } from '../shared/create-text-agent.js';
import type { RagRetriever, RetrievedDocument } from './rag-retriever.js';

const SYSTEM_PROMPT = loadPrompt('./RAG_SYSTEM.md', import.meta.url);
const NO_RAG_NEEDED = 'Workspace retrieval was not required for this request.';
const NO_RAG_CONTEXT = 'No relevant workspace context was found.';
const NO_RAG_RETRIEVER =
  'Workspace retrieval is enabled in the workflow, but no retriever is configured.';

const summarizeRagContext = createTextAgent({
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (context: {
    history: AssistantState['history'];
    prompt: string;
    documents: RetrievedDocument[];
  }) => buildHumanMessage(context.prompt, context.documents),
});

export async function ragAgent(
  state: AssistantState,
  model: TextGenerationModel,
  retriever?: RagRetriever,
): Promise<Partial<AssistantState>> {
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

  const ragFindings = (
    await summarizeRagContext(
      {
        history: state.history,
        prompt: state.prompt,
        documents,
      },
      model,
    )
  ).trim();

  return {
    phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
    ragFindings: ragFindings || NO_RAG_CONTEXT,
  };
}

function buildHumanMessage(
  prompt: string,
  documents: RetrievedDocument[],
): string {
  const context = documents
    .map((document, index) =>
      [
        `Snippet ${index + 1}:`,
        `Source: ${getSourceLabel(document)}`,
        document.pageContent.trim(),
      ].join('\n'),
    )
    .join('\n\n---\n\n');

  return ['User request:', prompt, '', 'Workspace context:', context].join(
    '\n',
  );
}

function getSourceLabel(document: RetrievedDocument): string {
  if (
    typeof document.metadata['source'] === 'string' &&
    document.metadata['source'].trim().length > 0
  ) {
    return document.metadata['source'];
  }

  if (
    typeof document.metadata['fileName'] === 'string' &&
    document.metadata['fileName'].trim().length > 0
  ) {
    return document.metadata['fileName'];
  }

  return 'workspace-snippet';
}
