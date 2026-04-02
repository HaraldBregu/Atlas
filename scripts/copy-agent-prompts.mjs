import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('src/agents');
const targetRoot = path.resolve('dist/agents');

await copyMarkdownTree(sourceRoot, targetRoot);

async function copyMarkdownTree(sourceDir, targetDir) {
	await mkdir(targetDir, { recursive: true });
	const entries = await readdir(sourceDir, { withFileTypes: true });

	for (const entry of entries) {
		const sourcePath = path.join(sourceDir, entry.name);
		const targetPath = path.join(targetDir, entry.name);

		if (entry.isDirectory()) {
			await copyMarkdownTree(sourcePath, targetPath);
			continue;
		}

		if (entry.isFile() && sourcePath.endsWith('.md')) {
			await cp(sourcePath, targetPath);
		}
	}
}
