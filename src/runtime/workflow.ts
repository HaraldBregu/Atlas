import type { GraphRunner } from '../types.js';

export type WorkflowUpdate<State extends object> = Partial<State> | void;

export type WorkflowStep<State extends object> = (
  state: State,
) => Promise<WorkflowUpdate<State>> | WorkflowUpdate<State>;

export interface WorkflowStage<State extends object> {
  mode?: 'sequential' | 'parallel';
  steps: WorkflowStep<State>[];
}

export function createWorkflowRunner<State extends object>(
  stages: WorkflowStage<State>[],
): GraphRunner<State> {
  return {
    async invoke(input: State): Promise<State> {
      let state = { ...input };

      for (const stage of stages) {
        if (stage.mode === 'parallel') {
          const updates = await Promise.all(
            stage.steps.map((step) => step(state)),
          );
          state = applyUpdates(state, updates);
          continue;
        }

        for (const step of stage.steps) {
          state = applyUpdates(state, [await step(state)]);
        }
      }

      return state;
    },
  };
}

function applyUpdates<State extends object>(
  state: State,
  updates: WorkflowUpdate<State>[],
): State {
  let nextState = state;

  for (const update of updates) {
    if (update === undefined) {
      continue;
    }

    nextState = {
      ...nextState,
      ...update,
    };
  }

  return nextState;
}
