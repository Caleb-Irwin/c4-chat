import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { LayoutServerLoad } from './$types';
import { api } from '../convex/_generated/api';

// Create auth handlers - convexUrl is automatically detected from environment 
const { getAuthState } = createConvexAuthHandlers();

// Export load function to provide auth state to layout
export const load: LayoutServerLoad = async (event) => {
    const authState = await getAuthState(event);

    const { createConvexHttpClient } = createConvexAuthHandlers();
    const clientPromise = createConvexHttpClient(event);

    async function getUserRow() {
        const client = await clientPromise;
        return await client.query(api.users.getRow, {});
    }

    async function getThreads() {
        const client = await clientPromise;
        return await Promise.all([client.query(api.threads.get, { paginationOpts: { cursor: null, numItems: 200 } }), client.query(api.threads.pinned, {})]);
    }

    return { authState, ...(authState._state.token ? { userRow: getUserRow(), threads: getThreads() } : {}) };
};