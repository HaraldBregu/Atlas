import dotenv from 'dotenv';
dotenv.config();

import { createWritingGraph } from '../../src/graph';

async function main() {
  const graph = createWritingGraph();

  const result = await graph.invoke(
    {
      inputText: 'Coffee originated in Ethiopia.',
      instruction: 'expand this into a full paragraph',
    },
    { configurable: { thread_id: 'instruction-test' } },
  );

  console.log('INPUT:', result.inputText);
  console.log('\nOUTPUT:', result.generatedText);
}

main().catch(console.error);
