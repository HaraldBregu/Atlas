import { Annotation } from '@langchain/langgraph';
import type { StyleProfile, AssembledPrompt } from '@/marker_writer/types';

export const WriterState = Annotation.Root({
  rawInput: Annotation<string>,
  userInstruction: Annotation<string>,

  styleProfile: Annotation<StyleProfile>,
  targetLength: Annotation<number>,
  assembledPrompt: Annotation<AssembledPrompt>,
  generatedText: Annotation<string>,
  finalDocument: Annotation<string>,
});

export type WriterStateValue = typeof WriterState.State;
