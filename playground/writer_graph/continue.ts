import dotenv from 'dotenv';
dotenv.config();

import { createWritingGraph } from '../../src/graph';
import { saveResult } from '../save-result';

async function main() {
  const graph = createWritingGraph();

  const inputText =
    'The ship had been drifting for three days. Supplies were low, and the crew had stopped speaking to one another.';

  const start = Date.now();
  const result = await graph.invoke(
    { inputText, instruction: '' },
    { configurable: { thread_id: 'continue-test' } },
  );

  console.log('INPUT:', result.inputText);
  console.log('\nOUTPUT:', result.generatedText);

  saveResult(import.meta.filename, {
    model: 'gpt-4o',
    temperature: 0.7,
    messages: [{ role: 'user', content: inputText }],
    response: result.generatedText,
  });
}

main().catch(console.error);
