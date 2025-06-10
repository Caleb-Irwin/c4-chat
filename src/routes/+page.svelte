<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';

	const query = useQuery(
		api.models.allNames,
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
		{/if}
	</p>

	<p>
		{auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
	</p>

	<ul class="list-disc">
		{#each query.data ?? [] as name}
			<li>{name}</li>
		{/each}
	</ul>
</main>
