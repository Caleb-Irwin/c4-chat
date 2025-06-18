export const CONF = {
	defaultModelId: 'google/gemini-2.5-flash-preview-05-20',
	freeModelIds: [
		'google/gemini-2.5-flash-preview-05-20',
		'google/gemini-2.0-flash-001',
		'openai/gpt-4o-mini',
		'x-ai/grok-3-mini-beta',
		'mistralai/mistral-small-3.1-24b-instruct',
		'meta-llama/llama-3.3-70b-instruct'
	],
	defaultPinnedModelIds: [
		'anthropic/claude-sonnet-4',
		'google/gemini-2.5-pro-preview',
		'google/gemini-2.5-flash-preview-05-20',
		'openai/chatgpt-4o-latest',
		'deepseek/deepseek-chat-v3-0324',
		'openai/o4-mini'
	],
	titleGenerationModelId: 'google/gemini-2.0-flash-lite-001',
	titleGenerationPrompt:
		'Generate a single, concise thread title (≤ 6 words, Title Case, no ending punctuation) that captures the main topic of the next message. • Use the same language as the message. Return only the title text. Here is the message:\n \n {message}',
	titleGenerationMaxTokens: 40,
	titleGenerationMessageCharacters: 300,
	systemPrompt: 'You are C4 Chat, a helpful AI assistant. You are powered by the model {model}.',
	systemModelChangePrompt: 'You are now powered by the model {model}.',
	maxMessageSizeCharacters: 8000,
	freeMessagesAnonymous: 10,
	freeMessagesRegistered: 50,
	monthlyCreditsInCentThousandthsRegistered: 1 * 100 * 1000,
	costPerMessageInCentThousandths: 100,
	costPerMbUploadInCentThousandths: 100
} as const;
