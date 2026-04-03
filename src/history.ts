import type { AgentHistoryMessage, ChatMessage } from './types.js';

export function toConversationHistory(
  history: AgentHistoryMessage[],
): ChatMessage[] {
  return history
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

export function buildConversation(options: {
  systemPrompt: string;
  history: AgentHistoryMessage[];
  userPrompt: string;
}): ChatMessage[] {
  return [
    {
      role: 'system',
      content: options.systemPrompt,
    },
    ...toConversationHistory(options.history),
    {
      role: 'user',
      content: options.userPrompt,
    },
  ];
}
