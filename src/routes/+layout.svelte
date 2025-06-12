<script lang="ts">
	import { browser } from '$app/environment';
	import AppSidebar from '$lib/components/sidebar/main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useUser } from '$lib/user.svelte';
	import '../app.css';
	import { setupConvexAuth, useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { ModeWatcher } from 'mode-watcher';

	let { children, data } = $props();

	setupConvexAuth({ getServerState: () => data.authState });

	const auth = useAuth(),
		isLoading = $derived(auth.isLoading),
		isAuthenticated = $derived(auth.isAuthenticated);

	$effect(() => {
		if (browser && !isLoading && !isAuthenticated) {
			auth.signIn('anonymous');
		}
	});

	const user = useUser();
	user.addInitialData(data.userRow);

	$effect(() => {
		if (browser && user.row) {
			localStorage.setItem('userRow', JSON.stringify(user.row));
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
