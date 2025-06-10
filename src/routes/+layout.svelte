<script lang="ts">
	import { browser } from '$app/environment';
	import Button from '$lib/components/ui/button/button.svelte';
	import '../app.css';
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	let { children, data } = $props();

	setupConvexAuth({ getServerState: () => data.authState });

	const auth = useAuth(),
		isAuthenticated = $derived(auth.isAuthenticated),
		isLoading = $derived(auth.isLoading);

	$effect(() => {
		if (!browser) return;
		if (!isLoading && !isAuthenticated) {
			console.log('User is not authenticated yet, waiting...');
			auth.signIn('anonymous');
		} else if (isAuthenticated) {
			console.log('User is authenticated');
		}
	});
</script>

<h1 class="text-2xl text-center p-2">C4 Chat</h1>

<div class="flex w-full h-full flex-col items-center justify-center">
	{#if isAuthenticated}
		<Button
			onclick={() => {
				auth.signOut();
			}}
		>
			Sign Out
		</Button>
	{:else}
		<Button
			onclick={() => {
				auth.signIn('anonymous');
			}}
		>
			Sign In
		</Button>
	{/if}

	{@render children()}
</div>
