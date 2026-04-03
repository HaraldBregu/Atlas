import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function saveAssistantResponse(
  fileName: string,
  prompt: string,
  response: string,
) {
  const outputDirectory = path.resolve('tests/assistant/results');
  const outputPath = path.join(outputDirectory, fileName);

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, formatSavedResponse(prompt, response), 'utf8');

  return outputPath;
}

function formatSavedResponse(prompt: string, response: string): string {
  return [`Prompt: ${prompt}`, '', 'Response:', response.trimEnd(), ''].join(
    '\n',
  );
}
