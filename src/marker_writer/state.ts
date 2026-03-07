import { Annotation } from '@langchain/langgraph';
import type {
  CursorInfo,
  Intent,
  DocumentState,
  StyleProfile,
  AssembledPrompt,
  DiffInfo,
} from '@/marker_writer/types';

export const WriterState = Annotation.Root({
  // Input
  rawInput: Annotation<string>,
  userInstruction: Annotation<string>,

  // Parsed
  cursorInfo: Annotation<CursorInfo>,
  intent: Annotation<Intent>,
  documentState: Annotation<DocumentState>,
  styleProfile: Annotation<StyleProfile>,
  targetLength: Annotation<number>,

  // Generated
  assembledPrompt: Annotation<AssembledPrompt>,
  generatedText: Annotation<string>,
  processedText: Annotation<string>,

  // Output
  finalDocument: Annotation<string>,
  diff: Annotation<DiffInfo>,
  changeDescription: Annotation<string>,
});

export type WriterStateValue = typeof WriterState.State;
