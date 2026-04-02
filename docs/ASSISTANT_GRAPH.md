# Assistant Graph

The assistant now uses a simple multi-agent pipeline with clear ownership:

```text
START
  |
  v
orchestrator
  |
  +----> websearch
  |
  +----> rag
           \
            +----> writer ----> END
```

## Roles

- `orchestrator`: inspects the user request, decides whether web search or workspace retrieval is needed, and sets writing guidance.
- `websearch`: summarizes raw web-search results into an internal note for time-sensitive or external-information requests.
- `rag`: retrieves and summarizes relevant workspace snippets into an internal note for project-specific requests.
- `writer`: produces the final user-facing response using the orchestrator guidance plus any findings from web search and RAG.

## Layout

- Implementation is grouped under `src/agents/`.
- Each agent owns its prompt, execution logic, and any agent-specific helpers.
- The LangGraph file still wires graph nodes, but the filesystem is organized by agent responsibility rather than node type.

## Why this structure

- Retrieval agents gather context instead of writing final answers.
- The writer stays responsible for final tone and output quality.
- The orchestrator keeps routing logic in one place instead of scattering it across unrelated specialist nodes.
- Both `websearch` and `rag` degrade cleanly when their backing dependency is unavailable.
