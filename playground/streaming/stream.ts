import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';
import { saveResult } from '../save-result';

async function main() {
  const modelName = 'gpt-4o';
  const temperature = 0.7;
  const messages = [
    {
      role: 'user' as const,
      content: 'Write a short paragraph about the moon.',
    },
  ];

  const model = new ChatOpenAI({ model: modelName, temperature });

  const start = Date.now();
  const stream = await model.stream(messages);

  let response = '';
  for await (const chunk of stream) {
    const text = typeof chunk.content === 'string' ? chunk.content : '';
    process.stdout.write(text);
    response += text;
  }
  console.log();

  saveResult(import.meta.filename, {
    model: modelName,
    temperature,
    messages,
    response,
  });
}

main().catch(console.error);
