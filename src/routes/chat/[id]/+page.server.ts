import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { Id } from '../../../convex/_generated/dataModel';
import type { PageServerLoad } from './$types';
import { api } from '../../../convex/_generated/api';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { createConvexHttpClient, getAuthState } = createConvexAuthHandlers();

	const auth = await getAuthState(event);

	async function getMessages() {
		const client = await createConvexHttpClient(event);
		const messages = await client.query(api.messages.getFinishedMessages, {
			threadId: event.params.id as Id<'threads'>
		});
		return messages;
	}

	if (!auth._state.token) {
		throw redirect(302, '/chat');
	}

	return {
		threadId: event.params.id as Id<'threads'>,
		messages: getMessages()
	};
};
