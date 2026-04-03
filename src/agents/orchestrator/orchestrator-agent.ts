import { ASSISTANT_STATE_MESSAGES } from '../../messages.js';
import type { AssistantState } from '../../state.js';
import type { AssistantResponseMode } from '../../types.js';

export interface AssistantPlan {
  mode: AssistantResponseMode;
  useWebSearch: boolean;
  useRag: boolean;
  webSearchQuery: string;
  ragQuery: string;
  planningNotes: string;
}

export function orchestratorAgent(
  state: AssistantState,
): Partial<AssistantState> {
  const plan = buildAssistantPlan(state.prompt);

  return {
    ...plan,
    phaseLabel: ASSISTANT_STATE_MESSAGES.GATHERING_CONTEXT,
  };
}

export function buildAssistantPlan(prompt: string): AssistantPlan {
  const normalized = prompt.trim().toLowerCase();
  const mode = detectResponseMode(normalized);
  const useRag = shouldUseRag(normalized);
  const useWebSearch = shouldUseWebSearch(normalized);

  return {
    mode,
    useWebSearch,
    useRag,
    webSearchQuery: useWebSearch ? prompt.trim() : '',
    ragQuery: useRag ? prompt.trim() : '',
    planningNotes: buildPlanningNotes(mode, { useWebSearch, useRag }),
  };
}

function detectResponseMode(prompt: string): AssistantResponseMode {
  if (
    /\b(rewrite|revise|edit|polish|shorten|expand|improve|tighten|fix grammar|proofread)\b/.test(
      prompt,
    )
  ) {
    return 'edit';
  }

  if (
    /\b(write|draft|compose|create|generate|outline|story|article|essay|email|post|copy)\b/.test(
      prompt,
    )
  ) {
    return 'write';
  }

  return 'answer';
}

function shouldUseWebSearch(prompt: string): boolean {
  return /\b(search the web|web search|browse|look up|latest|current|today|news|recent)\b/.test(
    prompt,
  );
}

function shouldUseRag(prompt: string): boolean {
  return [
    'this project',
    'this repo',
    'this repository',
    'this codebase',
    'this workspace',
    'in the code',
    'in the repo',
    'in the project',
    'these files',
    'the docs',
    'our docs',
    'nodes',
    'agents',
    'graph',
    'workflow',
  ].some((term) => prompt.includes(term));
}

function buildPlanningNotes(
  mode: AssistantResponseMode,
  tools: { useWebSearch: boolean; useRag: boolean },
): string {
  const modeInstruction =
    mode === 'write'
      ? 'Produce the requested deliverable directly and keep the prose polished.'
      : mode === 'edit'
        ? 'Return a revision-focused answer that preserves intent unless the user asks for a deeper rewrite.'
        : 'Answer directly, prioritize clarity, and avoid unnecessary filler.';

  const sourceInstruction = [
    tools.useWebSearch
      ? 'Use web-search findings for live or external context.'
      : '',
    tools.useRag
      ? 'Use workspace retrieval findings for project-specific context.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return [modeInstruction, sourceInstruction].filter(Boolean).join(' ');
}
