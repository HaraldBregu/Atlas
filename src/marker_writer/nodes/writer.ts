import { ChatOpenAI } from '@langchain/openai';
import type { WriterStateValue } from '@/marker_writer/state';

export async function writerNode(
  state: WriterStateValue,
): Promise<Partial<WriterStateValue>> {
  const model = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7 });

  const response = await model.invoke([
    { role: 'user', content: state.inputText },
  ]);

  const generatedText =
    typeof response.content === 'string' ? response.content.trim() : '';

  return { generatedText };
}
