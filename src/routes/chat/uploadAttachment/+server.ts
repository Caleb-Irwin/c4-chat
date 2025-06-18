import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { RequestHandler, RequestEvent } from './$types';

const { getAuthState } = createConvexAuthHandlers();

export const POST = (async (event: RequestEvent) => {
	const authState = await getAuthState(event);
	const token = authState?._state?.token;
	if (!token) {
		return new Response('Unauthorized', { status: 401 });
	}

	const convexHttpUrl = `${PUBLIC_CONVEX_URL.replace('.cloud', '.site')}/uploadAttachment?filename=${encodeURIComponent(event.url.searchParams.get('filename') ?? '')}`;

	const headers = new Headers(event.request.headers);
	headers.set('Authorization', `Bearer ${token}`);

	return await fetch(convexHttpUrl, {
		method: 'POST',
		headers: headers,
		body: event.request.body,
		duplex: 'half'
	} as RequestInit);
}) satisfies RequestHandler;
