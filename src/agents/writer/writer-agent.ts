import { ASSISTANT_STATE_MESSAGES } from '../../messages.js';
import { loadPrompt } from '../../prompt-loader.js';
import type { AssistantState } from '../../state.js';
import type { TextGenerationModel } from '../../types.js';
import { createTextAgent } from '../shared/create-text-agent.js';

const SYSTEM_PROMPT = loadPrompt('./WRITER_SYSTEM.md', import.meta.url);

const generateWriterResponse = createTextAgent({
  systemPrompt: SYSTEM_PROMPT,
  mode: 'stream',
  buildUserPrompt: (state: AssistantState) => buildHumanMessage(state),
});

export async function writerAgent(
  state: AssistantState,
  model: TextGenerationModel,
): Promise<Partial<AssistantState>> {
  const response = await generateWriterResponse(state, model);

  return {
    phaseLabel: ASSISTANT_STATE_MESSAGES.WRITING,
    response,
  };
}

function buildHumanMessage(state: AssistantState): string {
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
