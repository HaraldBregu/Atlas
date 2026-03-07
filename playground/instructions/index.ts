import dotenv from 'dotenv';
dotenv.config();

import { parseArgs } from 'util';
import { ChatOpenAI } from '@langchain/openai';
import { saveResult } from '../save-result';

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string', short: 'i' },
      instruction: { type: 'string' },
      temperature: { type: 'string', short: 't' },
      model: { type: 'string', short: 'm' },
      stream: { type: 'boolean' },
      'max-tokens': { type: 'string' },
    },
  });

  const modelName = values.model ?? 'gpt-4o';
  const temperature = values.temperature ? parseFloat(values.temperature) : 0.7;
  const input = values.input ?? '';
  const instruction = values.instruction ?? '';

  if (!input && !instruction) {
    console.error('Provide --input and/or --instruction');
    process.exit(1);
  }

  const prompt = [input, instruction ? `Instruction: ${instruction}` : '']
    .filter(Boolean)
    .join('\n\n');

  const messages: { role: 'system' | 'user'; content: string }[] = [
    {
      role: 'system',
      content:
        'You are a writing assistant. Follow the instruction to transform or extend the given text. Respond only with the result.',
    },
    { role: 'user', content: prompt },
  ];

  const maxTokens = values['max-tokens']
    ? parseInt(values['max-tokens'])
    : undefined;

  const model = new ChatOpenAI({ model: modelName, temperature, maxTokens });

  const start = Date.now();
  let content = '';
  if (values.stream) {
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
    console.log(content);
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
