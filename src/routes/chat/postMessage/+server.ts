import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { RequestHandler, RequestEvent } from './$types';

const { getAuthState } = createConvexAuthHooks();

export const POST = (async (event: RequestEvent) => {
    const authState = await getAuthState(event);
    const token = authState?._state?.token;

    if (!token) {
        return new Response('Authentication required', { status: 401 });
    }

    const convexHttpUrl = PUBLIC_CONVEX_URL.replace('.cloud', '.site') + '/postMessage';

    const requestBody = await event.request.json();
    const res = await fetch(convexHttpUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        console.error('Error in response:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Response error text:', errorText);
        return new Response(errorText, { status: res.status });
    }

    if (!res.body) {
        return new Response('No response body', { status: 500 });
    }

    return new Response(res.body, {
        status: 200,
        headers: new Headers({
            "Content-Type": "text/plain",
            "messageId": res.headers.get("messageId")!
        })
    });
}) satisfies RequestHandler;