import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { RequestHandler, RequestEvent } from './$types';

const { getAuthState } = createConvexAuthHooks();

export const POST = (async (event: RequestEvent) => {
    return fetch(PUBLIC_CONVEX_URL.replace('.cloud', '.site') + '/postMessage',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${(await getAuthState(event))._state.token}`
            },
            body: JSON.stringify(await event.request.json())
        })
}) satisfies RequestHandler;