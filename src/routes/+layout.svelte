<script lang="ts">
	import { browser } from '$app/environment';
	import AppSidebar from '$lib/components/sidebar/main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
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

<Sidebar.Provider>
	<AppSidebar />
	<main>
		{@render children?.()}
	</main>
</Sidebar.Provider>
