import { createUnderstandingModel } from '@/marker_writer/models';
import type { WriterStateValue } from '@/marker_writer/state';
import type { Intent, IntentType, StyleProfile } from '@/marker_writer/types';
import { countWords } from '@/marker_writer/helpers';

// ─── Intent Classification ─────────────────────────────────

function buildIntentPrompt(text: string, instruction: string): string {
  let prompt = `Classify the user's writing intent.\n\n`;
  prompt += `### TEXT\n<text>\n${text}\n</text>\n\n`;
  prompt += `### USER_INSTRUCTION\n<instruction>\n${instruction}\n</instruction>\n\n`;
  prompt += `## Instructions\n\n`;
  prompt += `Based on the USER_INSTRUCTION and TEXT, determine the intent. `;
  prompt += `Respond with ONLY a JSON object (no markdown fences) with these fields:\n`;
  prompt += `- "type": one of "continue", "expand", or "rewrite"\n`;
  prompt += `  - "continue": the user wants new text added after the existing text (e.g. "keep writing", "continue the story", "write the next paragraph")\n`;
  prompt += `  - "expand": the user wants the existing text made longer or more detailed (e.g. "make this longer", "add more detail", "elaborate on this")\n`;
  prompt += `  - "rewrite": the user wants the existing text rewritten differently (e.g. "rewrite this", "make it more professional", "change the tone")\n`;
  prompt += `- "detail": a brief summary of what specifically the user wants`;

  return prompt;
}

function parseIntentResponse(content: string): Intent {
  const fallback: Intent = { type: 'continue', detail: '' };

  try {
    const parsed = JSON.parse(content);
    const type = ['continue', 'expand', 'rewrite'].includes(parsed.type)
      ? (parsed.type as IntentType)
      : 'continue';
    return { type, detail: parsed.detail || '' };
  } catch {
    return fallback;
  }
}

async function classifyIntent(
  text: string,
  instruction: string,
): Promise<Intent> {
  if (!instruction) {
    return { type: 'continue', detail: '' };
  }

  const prompt = buildIntentPrompt(text, instruction);
  const model = createUnderstandingModel();
  const response = await model.invoke([{ role: 'user', content: prompt }]);
  const content = typeof response.content === 'string' ? response.content : '';
  return parseIntentResponse(content);
}

// ─── Style Analysis ─────────────────────────────────────────

function buildAnalysisPrompt(text: string, targetLength: number): string {
  let prompt = `Analyze the writing style of the following text.\n\n`;
  prompt += `## Inputs\n\n`;
  prompt += `### TEXT\n<text>\n${text}\n</text>\n\n`;
  prompt += `### GENERATION TARGET\n`;
  prompt += `- Requested length: ${targetLength} words\n\n`;
  prompt += `## Instructions\n\n`;
  prompt += `Based on the TEXT, extract the writing style. `;
  prompt += `Respond with ONLY a JSON object (no markdown fences) with these fields:\n`;
  prompt += `- "tense": the narrative tense (e.g. "past", "present")\n`;
  prompt += `- "pointOfView": the narrative POV (e.g. "third person limited (Elena)", "first person")\n`;
  prompt += `- "tone": comma-separated tone descriptors (e.g. "suspenseful, atmospheric")\n`;
  prompt += `- "formality": the writing register (e.g. "literary fiction", "casual", "academic")\n`;
  prompt += `- "genre": the genre (e.g. "dark fantasy", "sci-fi", "memoir")\n`;
  prompt += `- "notablePatterns": array of notable stylistic patterns (e.g. ["short punchy sentences", "heavy use of metaphor"])`;

  return prompt;
}

function parseStyleResponse(content: string): StyleProfile {
  const fallback: StyleProfile = {
    tense: 'past',
    pointOfView: 'third person',
    tone: 'neutral',
    formality: 'standard',
    genre: 'general',
    notablePatterns: [],
  };

  try {
    const parsed = JSON.parse(content);
    return {
      tense: parsed.tense || fallback.tense,
      pointOfView: parsed.pointOfView || fallback.pointOfView,
      tone: parsed.tone || fallback.tone,
      formality: parsed.formality || fallback.formality,
      genre: parsed.genre || fallback.genre,
      notablePatterns: parsed.notablePatterns || fallback.notablePatterns,
    };
  } catch {
    return fallback;
  }
}

async function analyzeStyle(
  text: string,
  targetLength: number,
): Promise<StyleProfile> {
  const prompt = buildAnalysisPrompt(text, targetLength);
  const model = createUnderstandingModel();
  const response = await model.invoke([{ role: 'user', content: prompt }]);
  const content = typeof response.content === 'string' ? response.content : '';
  return parseStyleResponse(content);
}

// ─── Node ───────────────────────────────────────────────────

function estimateTargetLength(text: string, intent: Intent): number {
  const existingWords = countWords(text);

  switch (intent.type) {
    case 'expand':
      return Math.max(existingWords * 2, 100);
    case 'rewrite':
      return existingWords;
    default: {
      if (existingWords < 50) return 50;
      if (existingWords < 200) return 100;
      return 200;
    }
  }
}

export async function analyzerNode(
  state: WriterStateValue,
): Promise<Partial<WriterStateValue>> {
  const { rawInput, userInstruction } = state;

  const intent = await classifyIntent(rawInput, userInstruction);
  const targetLength = estimateTargetLength(rawInput, intent);

  const styleProfile: StyleProfile = rawInput
    ? await analyzeStyle(rawInput, targetLength)
    : {
        tense: '',
        pointOfView: '',
        tone: '',
        formality: '',
        genre: '',
        notablePatterns: [],
      };

  return {
    intent,
    styleProfile,
    targetLength,
  };
}
