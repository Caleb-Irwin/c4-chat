export async function streamedOpenRouterRequest({
	body,
	openRouterApiKey,
	outputWriter,
	onChunkUpdate
}: {
	body: {};
	openRouterApiKey: string;
	outputWriter: WritableStreamDefaultWriter<Uint8Array>;
	onChunkUpdate: (
		fullResponseSoFar: string,
		fullReasoning: string,
		abort: () => void
	) => Promise<void>;
}): Promise<{ message: string; reasoning: string }> {
	const controller = new AbortController(),
		resObj = { buffer: '', completeString: '', completeReasoning: '' },
		decoder = new TextDecoder(),
		encoder = new TextEncoder();

	try {
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: { Authorization: `Bearer ${openRouterApiKey}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: controller.signal
		});

		const resReader = response.body?.getReader();
		if (!resReader) {
			throw new Error('Response body is not readable');
		}

		try {
			while (true) {
				const { done, value } = await resReader.read();
				if (done) break;
				resObj.buffer += decoder.decode(value, { stream: true });
				await processLines();
			}
		} finally {
			resReader.cancel();
		}

		async function processLines(): Promise<void> {
			while (true) {
				const lineEnd = resObj.buffer.indexOf('\n');
				if (lineEnd === -1) break;

				const line = resObj.buffer.slice(0, lineEnd).trim();
				resObj.buffer = resObj.buffer.slice(lineEnd + 1);

				if (line.startsWith('data: ')) {
					const data = line.slice(6);
					if (data === '[DONE]') return;

					try {
						const parsed = JSON.parse(data);
						console.log('Parsed response:', parsed);
						const content = parsed.choices[0].delta.content;
						const reasoning = parsed.choices[0].delta.reasoning;
						if (content) {
							resObj.completeString += content;
							outputWriter.write(encoder.encode(content));
						}
						if (reasoning) {
							resObj.completeReasoning += reasoning;
						}
						if (content || reasoning) {
							await onChunkUpdate(resObj.completeString, resObj.completeReasoning, () =>
								controller.abort()
							);
						}
					} catch (e) {
						// Ignore invalid JSON
					}
				} else {
					console.warn('Unexpected line format:', line);
				}
			}
		}
	} catch (error) {
		if (controller.signal.aborted) {
			console.log('Request aborted');
		} else {
			throw error;
		}
	}
	return { message: resObj.completeString, reasoning: resObj.completeReasoning };
}
