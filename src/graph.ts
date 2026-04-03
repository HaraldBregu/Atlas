import { orchestratorAgent } from './agents/orchestrator/orchestrator-agent.js';
import { ragAgent } from './agents/rag/rag-agent.js';
import type { RagRetriever } from './agents/rag/rag-retriever.js';
import { webSearchAgent } from './agents/websearch/websearch-agent.js';
import { writerAgent } from './agents/writer/writer-agent.js';
import type { AssistantState } from './state.js';
import { createWorkflowRunner } from './runtime/workflow.js';
import type {
  NodeModelMap,
  TextGenerationModel,
  WebSearchClient,
} from './types.js';

export const ASSISTANT_NODE = {
  ORCHESTRATOR: 'orchestrator',
  WEBSEARCH: 'websearch',
  RAG: 'rag',
  WRITER: 'writer',
} as const;

export interface AssistantNodeModels {
  [ASSISTANT_NODE.WEBSEARCH]: TextGenerationModel;
  [ASSISTANT_NODE.RAG]: TextGenerationModel;
  [ASSISTANT_NODE.WRITER]: TextGenerationModel;
}

export interface AssistantGraphDependencies {
  retriever?: RagRetriever;
  webSearchClient?: WebSearchClient;
}

export function buildGraph(
  models: TextGenerationModel | NodeModelMap,
  dependencies: AssistantGraphDependencies = {},
) {
  return createWorkflowRunner<AssistantState>([
    {
      steps: [(state) => orchestratorAgent(state)],
    },
    {
      mode: 'parallel',
      steps: [
        (state) =>
          webSearchAgent(
            state,
            resolveNodeModel(models, ASSISTANT_NODE.WEBSEARCH),
            dependencies.webSearchClient,
          ),
        (state) =>
          ragAgent(
            state,
            resolveNodeModel(models, ASSISTANT_NODE.RAG),
            dependencies.retriever,
          ),
      ],
    },
    {
      steps: [
        (state) =>
          writerAgent(state, resolveNodeModel(models, ASSISTANT_NODE.WRITER)),
      ],
    },
  ]);
}

function resolveNodeModel(
  models: TextGenerationModel | NodeModelMap,
  nodeName: string,
): TextGenerationModel {
  if (isTextGenerationModel(models)) {
    return models;
  }

  const model = models[nodeName];
  if (model === undefined) {
    throw new Error(`Missing model for assistant node "${nodeName}".`);
  }

  return model;
}

function isTextGenerationModel(
  models: TextGenerationModel | NodeModelMap,
): models is TextGenerationModel {
  return (
    typeof (models as TextGenerationModel).generateText === 'function' &&
    typeof (models as TextGenerationModel).streamText === 'function'
  );
}
