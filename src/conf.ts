export const CONF = {
	defaultModelId: 'google/gemini-2.0-flash-001',
	freeModelIds: [
		'google/gemini-2.0-flash-001',
		'openai/gpt-4o-mini',
		'x-ai/grok-3-mini-beta',
		'mistralai/mistral-small-3.1-24b-instruct',
		'meta-llama/llama-3.3-70b-instruct'
	],
	titleGenerationModelId: 'google/gemini-2.0-flash-lite-001',
	titleGenerationPrompt: 'NAME THREAD. RETURN ONLY TITLE. FIRST MESSAGE: ',
	titleGenerationMaxTokens: 40,
	titleGenerationMessageCharacters: 300,
	systemPrompt:
		'You are C4 Chat, a helpful AI assistant. You are powered by the model {model}. If asked, humanize your model name.',
	systemModelChangePrompt: 'You are now powered by the model {model}.',
	maxMessageSizeCharacters: 8000,
	freeMessagesAnonymous: 10,
	freeMessagesRegistered: 25,
	monthlyCreditsInCentThousandthsRegistered: 1 * 100 * 1000,
	costPerMessageInCentThousandths: 100
} as const;
