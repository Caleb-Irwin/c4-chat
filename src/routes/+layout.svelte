<script lang="ts">
	import { browser } from '$app/environment';
	import { useChat } from '$lib/chats.svelte';
	import AppSidebar from '$lib/components/sidebar/main.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useThreads } from '$lib/threads.svelte';
	import { useUser } from '$lib/user.svelte';
	import '../app.css';
	import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { ModeWatcher } from 'mode-watcher';

	let { children, data } = $props();

	setupConvexAuth({ getServerState: () => data.authState });

	const user = useUser();
	user._addInitialData(data.userRow);

	$effect(() => {
		if (browser && user.row && user._isAuthenticated) {
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

	const threads = useThreads();
	threads._addInitialData(data.threads);

	useChat();
</script>

<svelte:head>
	<title>Explosively Fast Chat</title>
</svelte:head>

<ModeWatcher />
<Sidebar.Provider class="h-full">
	<AppSidebar />
	<main class="w-full h-full">
		{@render children?.()}
	</main>
</Sidebar.Provider>
