<script lang="ts">
	import { browser } from '$app/environment';
	import AppSidebar from '$lib/components/sidebar/main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useThreads } from '$lib/threads.svelte';
	import { USER_KEY, useUser } from '$lib/user.svelte';
	import '../app.css';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { ModeWatcher } from 'mode-watcher';

	let { children, data } = $props();

	setupConvexAuth({ getServerState: () => data.authState });

	const user = useUser();
	user._addInitialData(data.userRow);

	$effect(() => {
		if (browser && user.row && user._isAuthenticated) {
			localStorage.setItem(USER_KEY, JSON.stringify(user.row));
			if (user.row.isAnonymous === true) {
				localStorage.setItem('lastAnonymousUserId', user.row._id);
			} else {
				user._addAnonymousThreads();
			}
		}
	});

	$effect(() => {
		if (browser && !user.isAuthenticated && !user._isLoading) {
			user._ensureSession();
		}
	});

	$effect(() => {
		if (browser && user.row) {
		}
	});

	const threads = useThreads();
	threads._addInitialData(data.threads);

	$effect(() => {
		if (browser && threads.all && threads.pinned) {
			threads._store();
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
