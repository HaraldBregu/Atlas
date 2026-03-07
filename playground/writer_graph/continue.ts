import dotenv from 'dotenv';
dotenv.config();

import { createWritingGraph } from '@/graph';

async function main() {
  const graph = createWritingGraph();

  const result = await graph.invoke(
    {
      inputText:
        'The ship had been drifting for three days. Supplies were low, and the crew had stopped speaking to one another.',
      instruction: '',
    },
    { configurable: { thread_id: 'continue-test' } },
  );

  console.log('INPUT:', result.inputText);
  console.log('\nOUTPUT:', result.generatedText);
}

main().catch(console.error);
