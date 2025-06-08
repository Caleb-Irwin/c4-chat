<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';

	const query = useQuery(
		api.messages.helloWorld,
		{},
		{
			keepPreviousData: true
		}
	);

	const auth = $derived(useAuth());
</script>

<main class="p-2">
	<Button>Hello World!</Button>
	<p>
		{#if query.isLoading}
			Loading...
		{:else if query.error}
			Error: {query.error.message}
		{:else}
			{query.data}
		{/if}
	</p>

	<p>
		{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
	</p>
</main>
