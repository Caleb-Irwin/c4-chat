import { AnnotationType } from '../schema';

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
		res: { completeString: string; completeReasoning: string },
		abort: () => void
	) => Promise<void>;
}): Promise<{ message: string; reasoning: string; annotations?: AnnotationType[] }> {
	const controller = new AbortController(),
		resObj = {
			buffer: '',
			completeString: '',
			completeReasoning: '',
			annotations: [] as AnnotationType[]
		},
		decoder = new TextDecoder(),
		encoder = new TextEncoder();

	try {
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${openRouterApiKey}`,
				'Content-Type': 'application/json',
				'HTTP-Referer': 'https://c4-chat.calebirwin.ca',
				'X-Title': 'C4 Chat'
			},
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
						const content = parsed.choices[0].delta.content;
						const reasoning = parsed.choices[0].delta.reasoning;
						const annotations = parsed.choices[0].delta?.annotations as
							| ResAnnotationType[]
							| undefined;
						if (content) {
							resObj.completeString += content;
							outputWriter.write(encoder.encode(content));
						}
						if (reasoning) {
							resObj.completeReasoning += reasoning;
						}
						if (annotations && Array.isArray(annotations)) {
							annotations.forEach((res) => {
								const annotation = res.url_citation;
								const newAnnotation: AnnotationType = {
									url: annotation.url,
									title: annotation.title,
									startIndex: annotation.start_index,
									endIndex: annotation.end_index,
									content: annotation.content
								};
								resObj.annotations.push(newAnnotation);
							});
						}

						if (content || reasoning) {
							await onChunkUpdate(resObj, () => controller.abort());
						}
					} catch (e) {
						// Ignore invalid JSON
					}
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
	return {
		message: resObj.completeString,
		reasoning: resObj.completeReasoning,
		annotations: resObj.annotations.length > 0 ? resObj.annotations : undefined
	};
}

interface ResAnnotationType {
	type: 'url_citation';
	url_citation: UrlCitation;
}

interface UrlCitation {
	url: string;
	title: string;
	start_index?: number;
	end_index?: number;
	content?: string;
}
