import {
	AIMessage,
	HumanMessage,
	SystemMessage,
	type BaseMessage,
} from '@langchain/core/messages';
import type { AgentHistoryMessage } from './types.js';

export function toLangChainHistoryMessages(history: AgentHistoryMessage[]): BaseMessage[] {
	return history
		.filter((message) => message.content.trim().length > 0)
		.map((message) => {
			if (message.role === 'assistant') {
				return new AIMessage(message.content);
			}

			if (message.role === 'system') {
				return new SystemMessage(message.content);
			}

			return new HumanMessage(message.content);
		});
}
