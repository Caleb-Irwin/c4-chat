import { getAuthUserId } from "@convex-dev/auth/server";
import { httpAction, query } from "./_generated/server";

export const helloWorld = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) {
            return 'Forbidden: User not authenticated';
        }
        return "Hello, world!";
    },
});

export const postMessageHandler = httpAction(async (ctx, request) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
        console.error('User not authenticated');
        return new Response('Forbidden: User not authenticated', { status: 403 });
    }

    const req = await request.json();
    console.log('Request:', req);

    const body = {
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: 'Write a 2 sentence story' }],
        stream: true,
    };
    const KEY = process.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    let { readable, writable } = new TransformStream();
    let writer = writable.getWriter();

    const resString = await processStream(reader, writer);
    console.log('Processed response:', resString);

    void writer.close();

    return new Response(readable, {
        status: 200,
        headers: new Headers({
            "Content-Type": "text/plain",
        })
    });
});

async function processStream(
    resReader: ReadableStreamDefaultReader<Uint8Array>,
    outputWriter: WritableStreamDefaultWriter<Uint8Array>
): Promise<string> {
    const resObj = { buffer: '', completeString: '' }, decoder = new TextDecoder(), encoder = new TextEncoder();
    try {
        while (true) {
            const { done, value } = await resReader.read();
            if (done) break;

            // Append new chunk to buffer
            resObj.buffer += decoder.decode(value, { stream: true });

            // Process complete lines from buffer
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
                    if (content) {
                        resObj.completeString += content;
                        outputWriter.write(encoder.encode(content));
                    }
                } catch (e) {
                    // Ignore invalid JSON
                }
            }
        }
    }

    return resObj.completeString;
}
