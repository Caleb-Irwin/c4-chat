import { sequence } from '@sveltejs/kit/hooks';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';

const { handleAuth } = createConvexAuthHooks();

// Apply hooks in sequence
export const handle = sequence(
    handleAuth
);