import type { MessageContent } from '@langchain/core/messages';

export function extractTextContent(content: MessageContent): string {
	if (typeof content === 'string') {
		return content;
	}

	return content
		.map((part) => {
			if (typeof part === 'string') {
				return part;
			}

			if ('text' in part && typeof part.text === 'string') {
				return part.text;
			}

			return '';
		})
		.join('');
}
