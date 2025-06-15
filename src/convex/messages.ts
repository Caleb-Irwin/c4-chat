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

    const { readable, writable } = new TransformStream<string, string>();
    const writer = writable.getWriter();

    const { res, controller } = await startResponse(process.env.OPENROUTER_API_KEY!) ?? { res: null, controller: null };

    if (res) {
        convertStream(res, writer);
    }

    return new Response(readable, {
        status: 200,
        headers: new Headers({
            "Access-Control-Allow-Origin": process.env.SITE_URL!,
            Vary: "origin",
        })
    });
});

async function startResponse(openRouterKey: string) {
    const controller = new AbortController();
    try {
        console.log('Starting response');

        const res = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${openRouterKey!}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.0-flash-001',
                    messages: [{ role: 'user', content: 'Write a 2 sentence story' }],
                    stream: true,
                }),
                signal: controller.signal,
            },
        );

        return { res, controller };
    } catch (error) {
        if ((error as any)?.name === 'AbortError') {
            console.log('Stream cancelled');
        } else {
            console.error('Error starting response:', error);
            throw error;
        }
    }
}

async function convertStream(res: Response, writer: WritableStreamDefaultWriter<string>) {
    const reader = res.body?.getReader();
    if (!reader) {
        throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Append new chunk to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines from buffer
            while (true) {
                const lineEnd = buffer.indexOf('\n');
                if (lineEnd === -1) break;

                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);

                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            await writer.write(content);
                            console.log(content);
                        }
                    } catch (e) {
                        // Ignore invalid JSON
                    }
                }
            }
        }
    } finally {
        reader.cancel();
        await writer.close();
    }

}