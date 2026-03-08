import dotenv from 'dotenv';
dotenv.config();

import { parseArgs } from 'util';
import { ChatOpenAI } from '@langchain/openai';
import { saveResult } from '../save-result';

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', short: 'i' },
      temperature: { type: 'string', short: 't' },
      model: { type: 'string', short: 'm' },
      'max-tokens': { type: 'string' },
      stream: { type: 'boolean' },
    },
  });

  const input = values.input ?? '';
  const modelName = values.model ?? 'gpt-4o';
  const temperature = values.temperature ? parseFloat(values.temperature) : 0.7;
  const maxTokens = values['max-tokens']
    ? parseInt(values['max-tokens'])
    : undefined;

  if (!input) {
    console.error('Provide --input');
    process.exit(1);
  }

  const messages: { role: 'system' | 'user'; content: string }[] = [
    {
      role: 'system',
      content:
        'You are an autocomplete engine. The user will provide an incomplete text. Complete the text naturally from where it ends. Do not repeat the input. Respond only with the continuation.',
    },
    { role: 'user', content: input },
  ];

  const model = new ChatOpenAI({ model: modelName, temperature, maxTokens });

  const start = Date.now();
  let content = '';
  if (values.stream) {
    process.stdout.write(input);
    const stream = await model.stream(messages);
    for await (const chunk of stream) {
      const text = typeof chunk.content === 'string' ? chunk.content : '';
      process.stdout.write(text);
      content += text;
    }
    console.log();
  } else {
    const response = await model.invoke(messages);
    content = typeof response.content === 'string' ? response.content : '';
    console.log(input + content);
  }

  saveResult(import.meta.filename, {
    model: modelName,
    temperature,
    messages,
    response: content,
    durationMs: Date.now() - start,
    maxTokens,
  });
}

main().catch(console.error);
