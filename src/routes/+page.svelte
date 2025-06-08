<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	const query = useQuery(
		api.messages.helloWorld,
		{},
		{
			keepPreviousData: true
		}
	);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
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
