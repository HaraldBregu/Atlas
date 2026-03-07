import { StateGraph, MemorySaver } from '@langchain/langgraph';
import { WriterState } from '@/marker_writer/state';
import { analyzerNode } from '@/marker_writer/nodes/analyzer';
import { generatorNode } from '@/marker_writer/nodes/generator';

export function createMarkerWriterGraph() {
  const graph = new StateGraph(WriterState)
    .addNode('analyzer', analyzerNode)
    .addNode('generator', generatorNode)
    .addEdge('__start__', 'analyzer')
    .addEdge('analyzer', 'generator')
    .addEdge('generator', '__end__');

  return graph.compile({ checkpointer: new MemorySaver() });
}
