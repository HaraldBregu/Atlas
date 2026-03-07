import { ChatOpenAI } from '@langchain/openai';
import type { WriterStateValue } from '@/marker_writer/state';

export async function writerNode(
  state: WriterStateValue,
): Promise<Partial<WriterStateValue>> {
  const model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7 });

  const system =
    `You are a skilled writer.\n` +
    `Rules:\n` +
    `- Output ONLY the new text, do NOT repeat the original\n` +
    `- No explanations or meta-commentary`;

  let user = '';
  if (state.inputText) {
    user += `### TEXT\n<text>\n${state.inputText}\n</text>\n\n`;
    user += `Continue naturally from where the text left off.`;
  }
  if (state.instruction) {
    user += `\n\nInstruction: ${state.instruction}`;
  }

  const response = await model.invoke([
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]);

  const generatedText =
    typeof response.content === 'string' ? response.content.trim() : '';

  return { generatedText };
}
