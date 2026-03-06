import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInvoke = vi.fn();

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn(function (this: any, opts: Record<string, unknown>) {
    this._opts = opts;
    this.invoke = mockInvoke;
  }),
}));

import { intentAnalyzerNode } from '@/marker_writer/nodes/intent-analyzer';
import type { WriterStateValue } from '@/marker_writer/state';
import type { ParsedInput } from '@/marker_writer/types';
import { ChatOpenAI } from '@langchain/openai';

function makeParsed(overrides: Partial<ParsedInput> = {}): ParsedInput {
  return {
    markerType: 'CONTINUE',
    markerPosition: 'END_OF_TEXT',
    operationType: 'CONTINUE',
    textBefore: '',
    textAfter: '',
    selectedRegion: '',
    immediateBefore: '',
    immediateAfter: '',
    lastSentenceBefore: '',
    firstSentenceAfter: '',
    isInsideParagraph: false,
    isInsideSentence: false,
    isAfterHeading: false,
    isBeforeHeading: false,
    currentHeading: '',
    previousHeading: '',
    nextHeading: '',
    totalCharsBefore: 0,
    totalCharsAfter: 0,
    documentWordCount: 0,
    markerCharIndex: 0,
    markerLineNumber: 1,
    markerColumnNumber: 1,
    ...overrides,
  };
}

function makeState(
  parsedOverrides: Partial<ParsedInput> = {},
  userInstruction = '',
): WriterStateValue {
  return {
    parsedInput: makeParsed(parsedOverrides),
    userInstruction,
  } as unknown as WriterStateValue;
}

const defaultIntentResponse = {
  contentType: 'BLOG_POST',
  writingIntent: 'inform',
  topic: 'coffee history',
  audience: 'general readers',
  desiredTone: 'conversational',
  desiredLength: '~200 words',
  keyMessage: 'coffee has a rich history',
  constraints: [],
};

describe('intentAnalyzerNode — fast path (no LLM)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns intentAnalysis without calling LLM for long CONTINUE with no instruction', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 150,
        textBefore: 'word '.repeat(150),
        currentHeading: 'My Section',
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis).toBeDefined();
    expect(result.intentAnalysis!.writingIntent).toBe('CONTINUE');
    expect(ChatOpenAI).not.toHaveBeenCalled();
  });

  it('sets topic from currentHeading when available', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 200,
        textBefore: 'word '.repeat(200),
        currentHeading: 'Coffee Origins',
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis!.topic).toBe('Coffee Origins');
  });

  it('falls back to generic topic when no currentHeading', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 200,
        textBefore: 'word '.repeat(200),
        currentHeading: '',
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis!.topic).toBe('continuation of existing text');
  });

  it('includes sentence-completion constraint when isInsideSentence is true', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 200,
        textBefore: 'word '.repeat(200),
        isInsideSentence: true,
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis!.constraints).toContain(
      'complete the current sentence first',
    );
  });

  it('omits sentence-completion constraint when not inside a sentence', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 200,
        textBefore: 'word '.repeat(200),
        isInsideSentence: false,
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis!.constraints).not.toContain(
      'complete the current sentence first',
    );
  });
});

describe('intentAnalyzerNode — LLM path', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({
      content: JSON.stringify(defaultIntentResponse),
    });
  });

  it('calls the LLM when documentWordCount <= 100', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 50,
        textBefore: 'Short text.',
      },
      '',
    );
    await intentAnalyzerNode(state);
    expect(ChatOpenAI).toHaveBeenCalled();
  });

  it('calls the LLM when a userInstruction is provided', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 200,
        textBefore: 'word '.repeat(200),
      },
      'write something funny',
    );
    await intentAnalyzerNode(state);
    expect(ChatOpenAI).toHaveBeenCalled();
  });

  it('calls the LLM when operationType is not CONTINUE', async () => {
    const state = makeState(
      {
        operationType: 'GENERATE',
        documentWordCount: 200,
        textBefore: 'word '.repeat(200),
      },
      '',
    );
    await intentAnalyzerNode(state);
    expect(ChatOpenAI).toHaveBeenCalled();
  });

  it('returns parsed intentAnalysis from LLM JSON response', async () => {
    const state = makeState(
      {
        operationType: 'GENERATE',
        documentWordCount: 0,
      },
      'write about coffee',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis).toBeDefined();
    expect(result.intentAnalysis!.contentType).toBe('BLOG_POST');
    expect(result.intentAnalysis!.topic).toBe('coffee history');
  });
});

describe('inferContentType (via fast-path)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns SOCIAL_POST for short text under 300 words', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 150,
        textBefore: 'word '.repeat(50),
        textAfter: 'word '.repeat(50),
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis!.contentType).toBe('SOCIAL_POST');
  });

  it('returns EMAIL when text starts with a greeting', async () => {
    const state = makeState(
      {
        operationType: 'CONTINUE',
        documentWordCount: 200,
        textBefore: 'Dear John,\n\nI am writing to you.',
        textAfter: 'word '.repeat(200),
      },
      '',
    );
    const result = await intentAnalyzerNode(state);
    expect(result.intentAnalysis!.contentType).toBe('EMAIL');
  });
});
