import { buildConversation } from '../../history.js';
import type { AgentHistoryMessage, TextGenerationModel } from '../../types.js';

interface CreateTextAgentOptions<TContext> {
  systemPrompt: string;
  buildUserPrompt: (context: TContext) => string;
  mode?: 'generate' | 'stream';
}

type AgentContextWithHistory = {
  history: AgentHistoryMessage[];
};

export function createTextAgent<TContext extends AgentContextWithHistory>(
  options: CreateTextAgentOptions<TContext>,
) {
  return async (
    context: TContext,
    model: TextGenerationModel,
  ): Promise<string> => {
    const messages = buildConversation({
      systemPrompt: options.systemPrompt,
      history: context.history,
      userPrompt: options.buildUserPrompt(context),
    });

    if (options.mode === 'stream') {
      return collectStream(model.streamText(messages));
    }

    return model.generateText(messages);
  };
}

async function collectStream(stream: AsyncIterable<string>): Promise<string> {
  let text = '';

  for await (const chunk of stream) {
    if (chunk.length > 0) {
      text += chunk;
    }
  }

  return text;
}
