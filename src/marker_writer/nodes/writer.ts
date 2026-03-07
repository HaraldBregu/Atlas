import {
  createUnderstandingModel,
  createWriterModel,
} from '@/marker_writer/models';
import type { WriterStateValue } from '@/marker_writer/state';
import type { StyleProfile } from '@/marker_writer/types';
import {
  countWords,
  extractLastParagraph,
  extractFirstParagraph,
} from '@/marker_writer/helpers';

// ─── Style Analysis ─────────────────────────────────────────

function buildAnalysisPrompt(
  beforeText: string,
  afterText: string,
  targetLength: number,
): string {
  let prompt = `Analyze the writing style of the following text.\n\n`;
  prompt += `## Inputs\n\n`;
  prompt += `### BEFORE_TEXT\n<before_text>\n${beforeText}\n</before_text>\n\n`;
  prompt += `### AFTER_TEXT\n<after_text>\n${afterText}\n</after_text>\n\n`;
  prompt += `### GENERATION TARGET\n`;
  prompt += `- Requested length: ${targetLength} words\n`;
  prompt += `- Action type: INSERT\n\n`;
  prompt += `## Instructions\n\n`;
  prompt += `Based on the BEFORE_TEXT and AFTER_TEXT, extract the writing style. `;
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
  beforeText: string,
  afterText: string,
  targetLength: number,
): Promise<StyleProfile> {
  const prompt = buildAnalysisPrompt(beforeText, afterText, targetLength);
  const model = createUnderstandingModel();
  const response = await model.invoke([{ role: 'user', content: prompt }]);
  const content = typeof response.content === 'string' ? response.content : '';
  return parseStyleResponse(content);
}

// ─── Prompt Building ────────────────────────────────────────

function formatStyleNotes(style: StyleProfile): string {
  const lines = [];
  if (style.tense) lines.push(`- Tense: ${style.tense}`);
  if (style.pointOfView) lines.push(`- POV: ${style.pointOfView}`);
  if (style.tone) lines.push(`- Tone: ${style.tone}`);
  if (style.formality) lines.push(`- Formality: ${style.formality}`);
  if (style.genre) lines.push(`- Genre: ${style.genre}`);
  if (style.notablePatterns.length > 0) {
    lines.push(`- Patterns: ${style.notablePatterns.join(', ')}`);
  }
  return lines.join('\n');
}

function buildWriterPrompt(
  beforeParagraph: string,
  afterParagraph: string,
  styleProfile: StyleProfile,
  targetLength: number,
  instruction: string,
): { system: string; user: string } {
  const system =
    `You are a skilled writer. Generate text that seamlessly fits the surrounding context.\n` +
    `Rules:\n` +
    `- Match the tone, style, and vocabulary of the existing text\n` +
    `- Output ONLY the generated text, no explanations or meta-commentary\n` +
    `- Target approximately ${targetLength} words`;

  let user = `## Inputs\n\n`;

  user += `### BEFORE_TEXT\n<before_text>\n${beforeParagraph}\n</before_text>\n\n`;
  user += `### AFTER_TEXT\n<after_text>\n${afterParagraph}\n</after_text>\n\n`;

  const styleNotes = formatStyleNotes(styleProfile);
  if (styleNotes) {
    user += `### STYLE_NOTES\n<style_notes>\n${styleNotes}\n</style_notes>\n\n`;
  }

  user += `### GENERATION TARGET\n`;
  user += `- Requested length: ${targetLength} words\n`;
  user += `- Action type: INSERT\n\n`;

  if (afterParagraph) {
    user += `Continue naturally from where the BEFORE_TEXT left off. The text must flow into the AFTER_TEXT.`;
  } else {
    user += `Continue naturally from where the BEFORE_TEXT left off.`;
  }

  if (instruction) {
    user += `\n\nAdditional instruction: ${instruction}`;
  }

  return { system, user };
}

// ─── Node ───────────────────────────────────────────────────

function estimateTargetLength(beforeText: string, afterText: string): number {
  const existingWords = countWords(beforeText + afterText);
  if (existingWords < 50) return 50;
  if (existingWords < 200) return 100;
  return 200;
}

export async function writerNode(
  state: WriterStateValue,
): Promise<Partial<WriterStateValue>> {
  const { rawInput, afterText, userInstruction } = state;

  const beforeParagraph = extractLastParagraph(rawInput);
  const afterParagraph = extractFirstParagraph(afterText || '');
  const targetLength = estimateTargetLength(rawInput, afterText || '');

  const hasContext = beforeParagraph || afterParagraph;

  const styleProfile: StyleProfile = hasContext
    ? await analyzeStyle(beforeParagraph, afterParagraph, targetLength)
    : {
        tense: '',
        pointOfView: '',
        tone: '',
        formality: '',
        genre: '',
        notablePatterns: [],
      };

  const prompt = buildWriterPrompt(
    beforeParagraph,
    afterParagraph,
    styleProfile,
    targetLength,
    userInstruction,
  );

  const model = createWriterModel();
  const response = await model.invoke([
    { role: 'system', content: prompt.system },
    { role: 'user', content: prompt.user },
  ]);

  const generatedText =
    typeof response.content === 'string' ? response.content.trim() : '';

  let finalDocument = rawInput + generatedText;
  if (afterText) {
    finalDocument += afterText;
  }

  return {
    styleProfile,
    targetLength,
    assembledPrompt: prompt,
    generatedText,
    finalDocument,
  };
}
