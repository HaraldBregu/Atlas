# Repository Guidelines

## Project Direction

`Atlas` is evolving from a small CLI assistant into a TypeScript multi-agent AI
framework. New work should push the repo toward four first-class capabilities:

- multi-agent orchestration and graph-based execution
- durable storage for state, history, and retrieved context
- MCP integration plus internal/external tool execution
- multi-provider model access through a shared OpenAI-compatible SDK layer

Keep those concerns decoupled. Agents should not know provider-specific client
details, tools should not embed storage logic, and provider adapters should be
swappable without changing orchestration code.

## Project Structure & Module Organization

Core runtime code lives in `src/`. Today, graph wiring is centered in
`src/graph.ts`, CLI entrypoints live in `src/index.ts` and
`src/run-assistant.ts`, and shared runtime types/state live in files such as
`src/types.ts`, `src/state.ts`, and `src/history.ts`. Agent implementations and
their prompt files live under `src/agents/<agent>/`, for example
`src/agents/orchestrator/orchestrator-agent.ts` and
`src/agents/rag/RAG_SYSTEM.md`.

As the framework expands, keep code grouped by responsibility:

- `src/agents/`: orchestrators, specialists, shared agent contracts
- `src/providers/`: provider adapters built on the OpenAI-compatible common SDK
- `src/storage/`: checkpoints, chat history, retrieval stores, persistence
- `src/mcp/`: MCP transports, client/server glue, capability discovery
- `src/tools/`: tool definitions, schemas, registries, execution helpers
- `src/shared/`: cross-cutting types, config, validation, utility helpers

If a new area does not fit those boundaries, add a focused module instead of
growing `graph.ts` or agent files into catch-alls. Treat `dist/` as generated
output.

## Build, Test, and Development Commands

Use the existing npm scripts for local work.

- `npm install`: install dependencies.
- `npm run dev`: run the CLI from source with file watching.
- `npm run writer -- --prompt "Explain the workflow"`: run the assistant from source.
- `npm run build`: compile TypeScript and copy agent prompt markdown into `dist/`.
- `npm start -- --dry-run --prompt "Explain the workflow"`: run the built CLI without live model calls.
- `npm run check`: run type-checking plus the assistant-focused test suite.
- `npm test` or `npm run test:assistant`: run Vitest tests.
- `yarn format`: format the repo with Prettier after edits.

When adding new framework surfaces such as storage backends, tool registries, or
provider adapters, keep the same script style and prefer deterministic dry-run
paths for local development.

## Coding Style & Naming Conventions

This repo uses strict TypeScript, ES modules, and the `@/` path alias for
`src/*`. The configured style is 2-space indentation, single quotes, semicolons,
trailing commas, and `printWidth: 80`. Follow existing naming patterns:
kebab-case filenames, `*-agent.ts` for agent modules, and `.test.ts` for tests.
Keep prompt markdown next to the agent that consumes it.

Prefer explicit interfaces around framework boundaries:

- provider adapters should expose a common model client contract
- storage modules should own persistence and serialization concerns
- MCP and tool modules should use typed schemas and clear execution contracts
- agent modules should focus on reasoning, routing, and state transitions

Use `zod` or equivalent runtime validation at API boundaries, especially for
tool inputs, MCP payloads, and provider configuration. Avoid leaking
provider-specific response shapes across the codebase.

## Testing Guidelines

Vitest is configured in `vitest.config.ts` with a Node test environment and V8
coverage support. Add tests under `tests/assistant/` using `*.test.ts`. Prefer
dry-run coverage for graph behavior so tests stay deterministic.

New framework behavior should ship with focused tests for the changed boundary:

- orchestration and routing changes
- tool registration and execution
- MCP integration and transport behavior
- storage read/write and recovery flows
- provider adapter normalization and fallback behavior

If a feature depends on live provider access, isolate that path behind mocks or
explicit smoke coverage instead of making the main suite network-dependent.

## Commit & Pull Request Guidelines

Recent history favors concise, imperative commit subjects, usually Conventional
Commit style such as `feat: add agent-based assistant workflow` or
`refactor: flatten assistant runtime and add smoke scripts`. Follow that format
when possible.

PRs should describe:

- the behavior or architectural change
- the framework boundary affected, such as agents, storage, MCP, tools, or providers
- the commands you ran, for example `npm run check`, `npm test`, or smoke scripts
- any new environment variables, configuration, or migration notes

After completing work, stage all current changes, create a commit with a clear
message, and push the branch to the remote. The default Git flow is:

- `git add .`
- `git commit -m "feat: describe the change"`
- `git push`

Include CLI output or concise notes when a change affects prompts, routing,
provider selection, or tool execution.

## Configuration Tips

Copy `.env.example` to `.env` and set provider credentials for live runs. Keep
credentials out of source control. Default to dry-run or mocked execution while
developing features that do not require live model calls.

Multi-provider support should be added through the shared OpenAI-compatible SDK
layer, not by scattering direct provider clients through agents. If you add a
new provider, document:

- required environment variables
- model naming and capability assumptions
- retry, timeout, and fallback behavior
- any differences from the common provider contract
