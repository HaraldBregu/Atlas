import 'dotenv/config';
import { Command } from 'commander';
import path from 'node:path';
import { runAssistant } from './run-assistant.js';

const program = new Command();

program
  .name('atlas')
  .description('Run the Atlas multi-agent assistant')
  .argument('[prompt...]', 'prompt text')
  .option('-p, --prompt <text>', 'prompt text')
  .option(
    '-w, --workspace <path>',
    'workspace path used by the RAG agent',
    process.cwd(),
  )
  .option(
    '--dry-run',
    'run with deterministic mock models instead of calling an API',
    false,
  )
  .action(
    async (
      promptParts: string[],
      options: { prompt?: string; workspace: string; dryRun: boolean },
    ) => {
      const prompt = resolvePrompt(promptParts, options.prompt);
      if (!prompt) {
        program.help({ error: true });
      }

      try {
        const output = await runAssistant({
          prompt,
          workspacePath: path.resolve(options.workspace),
          dryRun: options.dryRun,
        });

        process.stdout.write(`${output.trimEnd()}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`${message}\n`);
        process.exitCode = 1;
      }
    },
  );

await program.parseAsync(process.argv);

function resolvePrompt(promptParts: string[], flagPrompt?: string): string {
  const positionalPrompt = promptParts.join(' ').trim();

  if (flagPrompt && flagPrompt.trim().length > 0) {
    return flagPrompt.trim();
  }

  return positionalPrompt;
}
