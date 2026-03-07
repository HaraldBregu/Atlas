import dotenv from 'dotenv';
dotenv.config();

import { createMarkerWriterGraph } from '@/marker_writer/graph';

async function main() {
  const args = process.argv.slice(2);
  const textFlag = args.indexOf('--text');
  const afterFlag = args.indexOf('--after');
  const instructionFlag = args.indexOf('--instruction');

  if (textFlag === -1 || !args[textFlag + 1]) {
    console.log(
      'Usage: tsx src/marker_writer/cli.ts --text "<text>" [--after "<text>"] [--instruction "<instruction>"]',
    );
    console.log('');
    console.log('Examples:');
    console.log('  --text "The sun was setting over the hills."');
    console.log(
      '  --text "First paragraph." --after "Last paragraph." --instruction "bridge these sections"',
    );
    console.log('  --text "" --instruction "write a poem about rain"');
    process.exit(1);
  }

  const rawInput = args[textFlag + 1];
  const afterText = afterFlag !== -1 ? args[afterFlag + 1] || '' : '';
  const instruction =
    instructionFlag !== -1 ? args[instructionFlag + 1] || '' : '';

  const app = createMarkerWriterGraph();

  const result = await app.invoke(
    { rawInput, afterText, userInstruction: instruction },
    { configurable: { thread_id: 'cli' } },
  );

  console.log('\n--- Result ---');
  console.log('Target:', `~${result.targetLength} words`);
  if (instruction) {
    console.log('Instruction:', instruction);
  }
  console.log('');
  console.log(result.finalDocument);
}

main().catch(console.error);
