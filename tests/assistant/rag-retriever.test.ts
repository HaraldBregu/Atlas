import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { RagRetriever } from '@/agents/rag/rag-retriever';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('RagRetriever', () => {
  it('returns the most relevant workspace chunks', async () => {
    const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'atlas-rag-'));
    tempDirectories.push(workspacePath);

    await mkdir(path.join(workspacePath, 'src', 'assistant'), {
      recursive: true,
    });
    await writeFile(
      path.join(workspacePath, 'src', 'assistant', 'graph.ts'),
      'The assistant graph coordinates a websearch agent, a rag agent, and a writing agent.',
    );
    await writeFile(
      path.join(workspacePath, 'README.md'),
      'Atlas is a writing assistant for long-form content.',
    );

    const retriever = new RagRetriever({ workspacePath, topK: 2 });
    const results = await retriever.retrieve('websearch agent graph');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.metadata['source']).toBe(
      path.join('src', 'assistant', 'graph.ts'),
    );
    expect(results[0]?.pageContent).toContain('websearch agent');
  });

  it('returns an empty list when the query is blank', async () => {
    const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'atlas-rag-'));
    tempDirectories.push(workspacePath);

    await writeFile(path.join(workspacePath, 'README.md'), 'Atlas docs');

    const retriever = new RagRetriever({ workspacePath });
    await expect(retriever.retrieve('   ')).resolves.toEqual([]);
  });
});
