import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  API_TOKEN_FILE_PATH,
  TokenSettingsStore,
} from '@/storage/token-settings-store';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('TokenSettingsStore', () => {
  it('returns null when no token file has been written yet', async () => {
    const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'atlas-token-'));
    tempDirectories.push(workspacePath);

    const store = new TokenSettingsStore({ workspacePath });

    await expect(store.read()).resolves.toBeNull();
  });

  it('writes the token into the settings folder and reads it back', async () => {
    const workspacePath = await mkdtemp(path.join(os.tmpdir(), 'atlas-token-'));
    tempDirectories.push(workspacePath);

    const store = new TokenSettingsStore({ workspacePath });
    const savedSettings = await store.save({ apiToken: 'secret-token' });

    const rawFile = await readFile(
      path.join(workspacePath, API_TOKEN_FILE_PATH),
      'utf8',
    );

    expect(rawFile).toContain('secret-token');
    await expect(store.read()).resolves.toEqual(savedSettings);
  });
});
