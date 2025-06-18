export const prerender = true;

import type { RequestHandler, RequestEvent } from './$types';
import { json } from '@sveltejs/kit';
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { api } from '../../convex/_generated/api';

export const GET = (async (event: RequestEvent) => {
	const { createConvexHttpClient } = createConvexAuthHandlers();
	const client = await createConvexHttpClient(event);

	try {
		const models = await client.action(api.models.initAndGetModelSummaries, {
			forceRefresh: true && !import.meta.env.DEV
		});
		return json(models);
	} catch (error) {
		console.error('Error fetching models:', error);
		throw error;
	}
}) satisfies RequestHandler;
