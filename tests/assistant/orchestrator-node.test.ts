import { describe, expect, it } from 'vitest';
import { buildAssistantPlan } from '@/agents/orchestrator/orchestrator-agent';

describe('buildAssistantPlan', () => {
  it('routes direct drafting requests to the writer without extra retrieval', () => {
    const plan = buildAssistantPlan('Write a concise launch email for Atlas.');

    expect(plan.mode).toBe('write');
    expect(plan.useWebSearch).toBe(false);
    expect(plan.useRag).toBe(false);
  });

  it('uses workspace retrieval for project-structure questions', () => {
    const plan = buildAssistantPlan(
      'Refactor and improve the nodes and agents in this project to use a multi agent structure.',
    );

    expect(plan.useRag).toBe(true);
    expect(plan.useWebSearch).toBe(false);
  });

  it('enables web search for time-sensitive external questions', () => {
    const plan = buildAssistantPlan('What is the latest OpenAI pricing today?');

    expect(plan.mode).toBe('answer');
    expect(plan.useWebSearch).toBe(true);
    expect(plan.useRag).toBe(false);
  });
});
