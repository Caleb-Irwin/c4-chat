import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { RequestHandler, RequestEvent } from './$types';

const { getAuthState } = createConvexAuthHooks();

export const POST = (async (event: RequestEvent) => {
    // Get auth state safely
    const authState = await getAuthState(event);
    const token = authState?._state?.token;

    if (!token) {
        return new Response('Authentication required', { status: 401 });
    }

    // Construct the correct Convex HTTP URL
    const convexHttpUrl = PUBLIC_CONVEX_URL.replace('.cloud', '.site') + '/postMessage';
    console.log('Fetching:', convexHttpUrl);

    const requestBody = await event.request.text();
    console.log('Request body:', requestBody);

    const res = await fetch(convexHttpUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'SvelteKit-Server',
        },
        body: JSON.stringify(requestBody)
    });

    const responseText = await res.text();
    console.log('Response:', responseText);

    return new Response(responseText, {
        status: 200,
        headers: new Headers({
            "Content-Type": "text/plain",
        })
    });

}) satisfies RequestHandler;