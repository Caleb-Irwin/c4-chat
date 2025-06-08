<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		setupConvexAuth,
		type ConvexAuthServerState
	} from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useConvexClient } from 'convex-svelte';

	let { children, authState }: { children: Snippet; authState: ConvexAuthServerState } = $props();

	const client = useConvexClient();

	setupConvexAuth({ getServerState: () => authState, client });
</script>

<div>
	{@render children()}
</div>
