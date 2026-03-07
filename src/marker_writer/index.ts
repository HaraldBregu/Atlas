import dotenv from 'dotenv';
dotenv.config();

import { createMarkerWriterGraph } from '@/marker_writer/graph';

async function main() {
  const app = createMarkerWriterGraph();

  console.log('\n=== Continue at end ===');
  const r1 = await app.invoke(
    {
      rawInput:
        'The history of coffee begins in Ethiopia, where legend says a goat herder named Kaldi noticed his goats dancing after eating berries from a certain tree.',
      afterText: '',
      userInstruction: '',
    },
    { configurable: { thread_id: 'p1' } },
  );
  console.log('Generated:', r1.generatedText.slice(0, 200) + '...');

  console.log('\n=== Insert between sections ===');
  const r2 = await app.invoke(
    {
      rawInput:
        '## Introduction\n\nAI has transformed how we process information.\n\n',
      afterText:
        '\n\n## Conclusion\n\nThe future depends on responsible development.',
      userInstruction: 'write the main body',
    },
    { configurable: { thread_id: 'p2' } },
  );
  console.log('Generated:', r2.generatedText.slice(0, 200) + '...');

  console.log('\n=== Generate from instruction ===');
  const r3 = await app.invoke(
    {
      rawInput: '',
      afterText: '',
      userInstruction: 'write a blog post about sustainable urban farming',
    },
    { configurable: { thread_id: 'p3' } },
  );
  console.log('Generated:', r3.generatedText.slice(0, 200) + '...');
}

main().catch(console.error);
