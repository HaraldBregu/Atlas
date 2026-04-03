import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_TOP_K = 4;
const MAX_CHUNK_LENGTH = 1200;
const CHUNK_OVERLAP = 200;
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'build',
]);
const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.java',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdx',
  '.mjs',
  '.py',
  '.rb',
  '.rs',
  '.sh',
  '.sql',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.xml',
  '.yaml',
  '.yml',
]);

export interface RagRetrieverOptions {
  workspacePath: string;
  topK?: number;
}

export interface RetrievedDocument {
  pageContent: string;
  metadata: Record<string, unknown>;
  score: number;
}

interface IndexedChunk {
  content: string;
  source: string;
  fileName: string;
}

export class RagRetriever {
  private chunksPromise: Promise<IndexedChunk[]> | null = null;

  constructor(private readonly options: RagRetrieverOptions) {}

  async retrieve(query: string): Promise<RetrievedDocument[]> {
    const normalizedQuery = normalizeText(query);
    if (normalizedQuery.length === 0) {
      return [];
    }

    const chunks = await this.loadChunks();
    if (chunks.length === 0) {
      return [];
    }

    const queryTerms = buildQueryTerms(normalizedQuery);
    const matches = chunks
      .map((chunk) => ({
        chunk,
        score: scoreChunk(chunk, queryTerms),
      }))
      .filter((match) => match.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, this.options.topK ?? DEFAULT_TOP_K);

    return matches.map(({ chunk, score }) => ({
      pageContent: chunk.content,
      metadata: {
        source: chunk.source,
        fileName: chunk.fileName,
      },
      score,
    }));
  }

  private loadChunks(): Promise<IndexedChunk[]> {
    if (this.chunksPromise === null) {
      this.chunksPromise = indexWorkspace(this.options.workspacePath);
    }

    return this.chunksPromise;
  }
}

async function indexWorkspace(workspacePath: string): Promise<IndexedChunk[]> {
  const filePaths = await collectFilePaths(workspacePath);
  const chunks: IndexedChunk[] = [];

  for (const filePath of filePaths) {
    const content = await readTextFile(filePath);
    if (content === null) {
      continue;
    }

    const relativePath =
      path.relative(workspacePath, filePath) || path.basename(filePath);
    const fileName = path.basename(filePath);
    for (const chunk of chunkText(content)) {
      chunks.push({
        content: chunk,
        source: relativePath,
        fileName,
      });
    }
  }

  return chunks;
}

async function collectFilePaths(directoryPath: string): Promise<string[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') {
      if (entry.isDirectory()) {
        continue;
      }
    }

    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      filePaths.push(...(await collectFilePaths(fullPath)));
      continue;
    }

    if (!TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    filePaths.push(fullPath);
  }

  return filePaths;
}

async function readTextFile(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    if (content.includes('\u0000')) {
      return null;
    }

    return content;
  } catch {
    return null;
  }
}

function chunkText(content: string): string[] {
  const normalized = content.replace(/\r\n/g, '\n').trim();
  if (normalized.length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + MAX_CHUNK_LENGTH, normalized.length);
    const slice = normalized.slice(start, end).trim();
    if (slice.length > 0) {
      chunks.push(slice);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }

  return chunks;
}

function scoreChunk(chunk: IndexedChunk, queryTerms: string[]): number {
  const haystack = normalizeText(
    [chunk.source, chunk.fileName, chunk.content].join(' '),
  );
  return queryTerms.reduce((score, term) => {
    if (!haystack.includes(term)) {
      return score;
    }

    const inSource = normalizeText(chunk.source).includes(term) ? 1 : 0;
    return score + 1 + inSource;
  }, 0);
}

function buildQueryTerms(query: string): string[] {
  return Array.from(
    new Set(
      query
        .split(/[^a-z0-9]+/i)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3),
    ),
  );
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}
