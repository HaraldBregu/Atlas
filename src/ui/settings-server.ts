import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import {
  API_TOKEN_FILE_PATH,
  SETTINGS_DIRECTORY_NAME,
  TokenSettingsStore,
  tokenSettingsInputSchema,
} from '../storage/token-settings-store';

const DEFAULT_PORT = 3010;
const DEFAULT_HOST = '127.0.0.1';
const host = process.env.ATLAS_UI_API_HOST ?? DEFAULT_HOST;
const port = readPort(process.env.ATLAS_UI_API_PORT);
const store = new TokenSettingsStore();

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.url !== '/api/settings/token') {
    writeJson(response, 404, {
      error: `Unknown route: ${request.url ?? ''}`,
    });
    return;
  }

  try {
    if (request.method === 'GET') {
      const settings = await store.read();

      writeJson(response, 200, createResponsePayload(settings));
      return;
    }

    if (request.method === 'POST') {
      const payload = await readJsonBody(request);
      const input = tokenSettingsInputSchema.parse(payload);
      const savedSettings = await store.save(input);

      writeJson(response, 200, createResponsePayload(savedSettings));
      return;
    }

    writeJson(response, 405, {
      error: `Method ${request.method ?? 'UNKNOWN'} is not allowed.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected server error.';

    writeJson(response, 400, { error: message });
  }
});

server.listen(port, host, () => {
  console.log(
    `Atlas settings API listening on http://${host}:${port}/api/settings/token`,
  );
  console.log(
    `Settings files will be written into ${SETTINGS_DIRECTORY_NAME}/`,
  );
});

function createResponsePayload(
  settings: Awaited<ReturnType<TokenSettingsStore['read']>>,
) {
  return {
    apiToken: settings?.apiToken ?? '',
    hasToken: Boolean(settings?.apiToken),
    updatedAt: settings?.updatedAt ?? null,
    settingsDirectory: SETTINGS_DIRECTORY_NAME,
    settingsFile: API_TOKEN_FILE_PATH,
  };
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let bodySize = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

    bodySize += buffer.byteLength;
    if (bodySize > 1024 * 1024) {
      throw new Error('Request body is too large.');
    }

    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (rawBody.trim().length === 0) {
    return {};
  }

  return JSON.parse(rawBody) as unknown;
}

function readPort(value: string | undefined) {
  const parsed = Number.parseInt(value ?? `${DEFAULT_PORT}`, 10);

  return Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
}

function setCorsHeaders(response: ServerResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function writeJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>,
) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(`${JSON.stringify(payload)}\n`);
}
