import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runAssistant } from '../src/run-assistant.js';

const prompt = 'Explain the assistant workflow in this project.';
const response = await runAssistant({
  prompt,
  workspacePath: process.cwd(),
  dryRun: true,
});

const outputDirectory = path.resolve('tests/assistant/results');
const outputPath = path.join(outputDirectory, 'smoke-response.txt');

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, buildOutput(prompt, response), 'utf8');

process.stdout.write(`${outputPath}\n`);

function buildOutput(inputPrompt: string, output: string): string {
  return [`Prompt: ${inputPrompt}`, '', 'Response:', output.trimEnd(), ''].join(
    '\n',
  );
}
