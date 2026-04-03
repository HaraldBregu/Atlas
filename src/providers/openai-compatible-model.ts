import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type {
  AgentModelConfig,
  ChatMessage,
  TextGenerationModel,
} from '../types.js';

export function createOpenAICompatibleModel(
  config: AgentModelConfig,
): TextGenerationModel {
  const provider = resolveProviderConfiguration(config);
  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
  });

  return new OpenAICompatibleTextModel(client, config);
}

class OpenAICompatibleTextModel implements TextGenerationModel {
  constructor(
    private readonly client: OpenAI,
    private readonly config: AgentModelConfig,
  ) {}

  async generateText(messages: ChatMessage[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.config.modelId,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      messages: toChatCompletionMessages(messages),
    });

    return completion.choices
      .map((choice) => choice.message.content ?? '')
      .join('');
  }

  async *streamText(messages: ChatMessage[]): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: this.config.modelId,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      messages: toChatCompletionMessages(messages),
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (typeof token === 'string' && token.length > 0) {
        yield token;
      }
    }
  }
}

function toChatCompletionMessages(
  messages: ChatMessage[],
): ChatCompletionMessageParam[] {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      role: message.role,
      content: message.content,
    })) as ChatCompletionMessageParam[];
}

function resolveProviderConfiguration(config: AgentModelConfig): {
  apiKey: string;
  baseURL?: string;
} {
  const providerEnvKey = toProviderEnvKey(config.providerId);
  const apiKeyEnvVars = uniqueEnvVars([
    config.apiKeyEnvVar,
    `${providerEnvKey}_API_KEY`,
    config.providerId === 'openai' ? 'OPENAI_API_KEY' : undefined,
  ]);

  const apiKey = readFirstEnvValue(apiKeyEnvVars);
  if (!apiKey) {
    throw new Error(
      `Missing API key for provider "${config.providerId}". Set one of: ${apiKeyEnvVars.join(', ')}.`,
    );
  }

  const baseURL = config.baseURL
    ? config.baseURL.trim()
    : readFirstEnvValue(
        uniqueEnvVars([
          config.baseURLEnvVar,
          `${providerEnvKey}_BASE_URL`,
          config.providerId === 'openai' ? 'OPENAI_BASE_URL' : undefined,
        ]),
      );

  return {
    apiKey,
    baseURL: baseURL || undefined,
  };
}

function toProviderEnvKey(providerId: string): string {
  return providerId
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');
}

function uniqueEnvVars(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter(isNonEmptyString)));
}

function readFirstEnvValue(envVars: string[]): string | undefined {
  for (const envVar of envVars) {
    const value = process.env[envVar]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
