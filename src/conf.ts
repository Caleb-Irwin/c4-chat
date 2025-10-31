export const CONF = {
	defaultModelId: 'openai/gpt-5-nano',
	freeModelIds: [
		'google/gemini-2.5-flash-preview-05-20',
		'google/gemini-2.0-flash-001',
		'openai/gpt-5-nano',
		'x-ai/grok-4-fast',
		'openai/gpt-4o-mini',
		'openai/gpt-oss-120b',
		'mistralai/mistral-small-3.1-24b-instruct',
		'meta-llama/llama-3.3-70b-instruct',
		'qwen/qwen-2.5-72b-instruct',
		'google/gemma-3-12b-it'
	],
	defaultPinnedModelIds: [
		'openai/gpt-5',
		'x-ai/grok-4-fast',
		'anthropic/claude-sonnet-4.5',
		'google/gemini-2.5-pro',
		'deepseek/deepseek-chat-v3-0324'
	],
	titleGenerationModelId: 'google/gemini-2.0-flash-lite-001',
	titleGenerationPrompt:
		'Generate a single, concise thread title (≤ 4 words, Title Case, no ending punctuation) that captures the main topic of the next message. • Use the same language as the message. Return only the title text. Here is the message:\n\n{message}',
	titleGenerationMaxTokens: 40,
	titleGenerationMessageCharacters: 300,
	systemPrompt: 'You are C4 Chat, a helpful AI assistant. You are powered by the model {model}.',
	systemModelChangePrompt: 'You are now powered by the model {model}.',
	maxMessageSizeCharacters: 10000,
	freeMessagesAnonymous: 10,
	freeMessagesRegistered: 50,
	monthlyCreditsInCentThousandthsRegistered: 1 * 100 * 1000,
	costPerMessageInCentThousandths: 100,
	costPerMbUploadInCentThousandths: 300
} as const;
