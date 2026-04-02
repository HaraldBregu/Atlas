import { describe, expect, it } from 'vitest';
import { runAssistant } from '@/run-assistant';
import { saveAssistantResponse } from './save-response';

describe('runAssistant', () => {
	it('runs the full graph in dry-run mode', async () => {
		const prompt = 'Explain the assistant workflow in this project.';
		const result = await runAssistant({
			prompt,
			workspacePath: process.cwd(),
			dryRun: true,
		});
		await saveAssistantResponse('run-assistant-dry-run.txt', prompt, result);

		expect(result).toContain('Dry-run response for:');
		expect(result).toContain('Explain the assistant workflow');
	});
});
