import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { LayoutServerLoad } from './$types';
import { api } from '../convex/_generated/api';

// Create auth handlers - convexUrl is automatically detected from environment 
const { getAuthState } = createConvexAuthHandlers();

// Export load function to provide auth state to layout
export const load: LayoutServerLoad = async (event) => {
    async function getUserRow() {
        const { createConvexHttpClient } = createConvexAuthHandlers();
        const client = await createConvexHttpClient(event);
        return await client.query(api.users.getRow, {})
    }

    return { authState: await getAuthState(event), userRow: getUserRow() };
};