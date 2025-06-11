<script lang="ts">
	import { browser } from '$app/environment';
	import AppSidebar from '$lib/components/sidebar/main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import '../app.css';
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { ModeWatcher } from 'mode-watcher';

	let { children, data } = $props();

	setupConvexAuth({ getServerState: () => data.authState });

	const auth = useAuth(),
		isAuthenticated = $derived(auth.isAuthenticated),
		isLoading = $derived(auth.isLoading);

	$effect(() => {
		if (!browser) return;
		if (!isLoading && !isAuthenticated) {
			auth.signIn('anonymous');
		}
	});
</script>

<ModeWatcher />
<Sidebar.Provider class="h-full">
	<AppSidebar />
	<main class="w-full h-full flex flex-col">
		{@render children?.()}
	</main>
</Sidebar.Provider>
