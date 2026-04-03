import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

export const SETTINGS_DIRECTORY_NAME = 'settings';
export const API_TOKEN_FILE_NAME = 'api-token.json';
export const API_TOKEN_FILE_PATH = path.join(
  SETTINGS_DIRECTORY_NAME,
  API_TOKEN_FILE_NAME,
);

export const tokenSettingsInputSchema = z.object({
  apiToken: z
    .string()
    .trim()
    .min(1, 'API token is required.')
    .max(4096, 'API token is too long.'),
});

const persistedTokenSettingsSchema = z.object({
  apiToken: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export type TokenSettingsInput = z.infer<typeof tokenSettingsInputSchema>;
export type PersistedTokenSettings = z.infer<
  typeof persistedTokenSettingsSchema
>;

export class TokenSettingsStore {
  private readonly workspacePath: string;

  constructor(options: { workspacePath?: string } = {}) {
    this.workspacePath = options.workspacePath ?? process.cwd();
  }

  async read(): Promise<PersistedTokenSettings | null> {
    try {
      const content = await readFile(this.tokenFilePath, 'utf8');

      return persistedTokenSettingsSchema.parse(JSON.parse(content));
    } catch (error) {
      if (isMissingFileError(error)) {
        return null;
      }

      throw error;
    }
  }

  async save(input: TokenSettingsInput): Promise<PersistedTokenSettings> {
    const payload = tokenSettingsInputSchema.parse(input);
    const persisted: PersistedTokenSettings = {
      apiToken: payload.apiToken,
      updatedAt: new Date().toISOString(),
    };

    await mkdir(this.settingsDirectoryPath, { recursive: true });
    await writeFile(
      this.tokenFilePath,
      `${JSON.stringify(persisted, null, 2)}\n`,
      'utf8',
    );

    return persisted;
  }

  get settingsDirectoryPath() {
    return path.join(this.workspacePath, SETTINGS_DIRECTORY_NAME);
  }

  get tokenFilePath() {
    return path.join(this.workspacePath, API_TOKEN_FILE_PATH);
  }
}

function isMissingFileError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
