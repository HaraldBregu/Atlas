import { StateGraph } from '@langchain/langgraph';
import { WritingState } from '@/state';
import { writerNode } from '@/nodes/writer';

export function createWritingGraph() {
  const graph = new StateGraph(WritingState)
    .addNode('writer', writerNode)
    .addEdge('__start__', 'writer')
    .addEdge('writer', '__end__');

  return graph.compile();
}
