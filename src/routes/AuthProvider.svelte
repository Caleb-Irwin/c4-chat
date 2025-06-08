<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		setupConvexAuth,
		useAuth,
		type ConvexAuthServerState
	} from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useConvexClient } from 'convex-svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { children, authState }: { children: Snippet; authState: ConvexAuthServerState } = $props();

	const client = useConvexClient();

	setupConvexAuth({
		getServerState: () => authState,
		client
	});
	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);
</script>

<div class="flex w-full h-full flex-col items-center justify-center">
	{#if isAuthenticated}
		<Button
			onclick={() => {
				auth.signOut();
			}}
		>
			Sign Out
		</Button>
		{@render children()}
	{:else}
		<Button
			onclick={() => {
				auth.signIn('anonymous');
			}}
		>
			Sign In
		</Button>
	{/if}
</div>
