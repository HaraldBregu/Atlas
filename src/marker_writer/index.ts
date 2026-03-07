import dotenv from 'dotenv';
dotenv.config();

import { createMarkerWriterGraph } from '@/marker_writer/graph';

async function main() {
  const app = createMarkerWriterGraph();

  // 1. Continue — "keep writing"
  console.log('\n=== CONTINUE: "keep writing" ===');
  const r1 = await app.invoke(
    {
      rawInput:
        'The village sat at the edge of a vast forest that no one dared enter after dark. For generations, parents had warned their children about the sounds that came from between the trees — not animal sounds, but something closer to whispers.',
      userInstruction: 'keep writing',
    },
    { configurable: { thread_id: 'continue' } },
  );
  console.log('Intent:', r1.intent.type, `(${r1.intent.detail})`);
  console.log('Style:', r1.styleProfile.tone, '/', r1.styleProfile.genre);
  console.log('Target:', `~${r1.targetLength} words`);
  console.log('\n' + r1.finalDocument);

  // 2. Expand — "make this paragraph longer"
  console.log('\n\n=== EXPAND: "make this paragraph longer" ===');
  const r2 = await app.invoke(
    {
      rawInput:
        'Coffee originated in Ethiopia. A herder noticed his goats became energetic after eating certain berries. The practice of brewing the beans spread across the Arabian Peninsula.',
      userInstruction: 'make this paragraph longer',
    },
    { configurable: { thread_id: 'expand' } },
  );
  console.log('Intent:', r2.intent.type, `(${r2.intent.detail})`);
  console.log('Target:', `~${r2.targetLength} words`);
  console.log('\n' + r2.finalDocument);

  // 3. Rewrite — "rewrite this section to sound more professional"
  console.log(
    '\n\n=== REWRITE: "rewrite this section to sound more professional" ===',
  );
  const r3 = await app.invoke(
    {
      rawInput:
        "So basically AI is like super cool and it's changing everything. Companies are using it for all sorts of stuff and it's gonna be huge in the future. Everyone should learn about it because it's the next big thing.",
      userInstruction: 'rewrite this section to sound more professional',
    },
    { configurable: { thread_id: 'rewrite' } },
  );
  console.log('Intent:', r3.intent.type, `(${r3.intent.detail})`);
  console.log('Target:', `~${r3.targetLength} words`);
  console.log('\n' + r3.finalDocument);
}

main().catch(console.error);
