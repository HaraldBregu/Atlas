import type { AgentHistoryMessage, AssistantResponseMode } from './types.js';

export interface AssistantState {
  prompt: string;
  history: AgentHistoryMessage[];
  mode: AssistantResponseMode;
  useWebSearch: boolean;
  useRag: boolean;
  webSearchQuery: string;
  ragQuery: string;
  planningNotes: string;
  webSearchFindings: string;
  ragFindings: string;
  phaseLabel: string;
  response: string;
}

export const DEFAULT_ASSISTANT_STATE: AssistantState = {
  prompt: '',
  history: [],
  mode: 'answer',
  useWebSearch: false,
  useRag: false,
  webSearchQuery: '',
  ragQuery: '',
  planningNotes: '',
  webSearchFindings: '',
  ragFindings: '',
  phaseLabel: '',
  response: '',
};

export function createAssistantState(
  state: Partial<AssistantState> = {},
): AssistantState {
  return {
    ...DEFAULT_ASSISTANT_STATE,
    ...state,
    history: state.history ?? [],
    prompt: state.prompt ?? '',
  };
}
