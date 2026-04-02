import { readFileSync } from 'node:fs';

export function loadPrompt(relativePath: string, metaUrl: string): string {
	return readFileSync(new URL(relativePath, metaUrl), 'utf8').trim();
}
