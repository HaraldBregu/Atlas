import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from '@langchain/openai';

async function main() {
  const prompt = 'Write one sentence about the ocean.';

  console.log('=== Temperature 0 (deterministic) ===');
  const cold = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });
  const r1 = await cold.invoke([{ role: 'user', content: prompt }]);
  console.log(r1.content);

  console.log('\n=== Temperature 1 (creative) ===');
  const hot = new ChatOpenAI({ model: 'gpt-4o', temperature: 1 });
  const r2 = await hot.invoke([{ role: 'user', content: prompt }]);
  console.log(r2.content);
}

main().catch(console.error);
