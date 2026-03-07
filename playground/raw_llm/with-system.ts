import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';

async function main() {
  const model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7 });

  const response = await model.invoke([
    { role: 'system', content: 'You are a pirate. Respond in pirate speak.' },
    { role: 'user', content: 'Tell me about the weather today.' },
  ]);

  console.log(response.content);
}

main().catch(console.error);
