# Atlas

Atlas is a small multi-agent assistant built on a custom workflow runtime and
OpenAI-compatible model clients.

The current workflow is:

```text
orchestrator -> websearch + rag -> writer
```

- `orchestrator` decides which supporting agents are needed.
- `websearch` summarizes external search results when a web-search client is wired in.
- `rag` retrieves project context from the local workspace.
- `writer` produces the final user-facing response.

More detail is in [`docs/ASSISTANT_GRAPH.md`](docs/ASSISTANT_GRAPH.md).

## Requirements

- Node.js 18+
- An OpenAI API key for live runs

## Setup

```bash
npm install
cp .env.example .env
```

Set `OPENAI_API_KEY` in `.env` for live model calls.

## Run

Source mode:

```bash
npm run writer -- --prompt "Explain the assistant workflow."
```

Built mode:

```bash
npm run build
npm start -- --prompt "Explain the assistant workflow."
```

Dry-run mode uses deterministic mock models and does not require network or an API key:

```bash
npm start -- --dry-run --prompt "Explain the assistant workflow."
```

CLI help:

```bash
npm run writer -- --help
npm start -- --help
```

## Test

```bash
npm run type-check
npm test
```

## Structure

```text
src/
├── agents/
│   ├── orchestrator/
│   ├── rag/
│   ├── websearch/
│   └── writer/
├── definition.ts
├── graph.ts
├── index.ts
├── run-assistant.ts
├── state.ts
└── types.ts
```
