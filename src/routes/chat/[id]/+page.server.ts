import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { Id } from '../../../convex/_generated/dataModel';
import type { PageServerLoad } from './$types';
import { api } from '../../../convex/_generated/api';

export const load: PageServerLoad = async (event) => {
	const { createConvexHttpClient } = createConvexAuthHandlers();
	const client = await createConvexHttpClient(event);
	const messages = await client.query(api.messages.getFinishedMessages, {
		threadId: event.params.id as Id<'threads'>
	});

	return {
		threadId: event.params.id as Id<'threads'>,
		messages
	};
};
