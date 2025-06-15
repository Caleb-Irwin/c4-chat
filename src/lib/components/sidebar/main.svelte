<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Account from './account.svelte';
	import LightSwitch from '../light-switch.svelte';
	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { afterNavigate } from '$app/navigation';
	import Threads from './threads.svelte';
	import { useThreads } from '$lib/threads.svelte';
	import { tick } from 'svelte';
	import { page } from '$app/state';

	const sidebar = useSidebar();

	afterNavigate(() => {
		if (sidebar.isMobile) {
			sidebar.setOpenMobile(false);
		}
	});

	let searchTabIndex = $state(-1);
	function openSearch() {
		searchTabIndex = 1;
		sidebar.toggle();
		tick().then(() => {
			if (!sidebar.isMobile) {
				const searchInput = document.getElementById('searchThreads') as HTMLInputElement;
				if (searchInput) searchInput.focus();
			}
			searchTabIndex = -1;
		});
	}

	const threads = useThreads();
</script>

<div class="fixed top-2 left-2 z-50 bg-sidebar rounded-sm cursor-default">
	<Sidebar.Trigger class="h-9 w-9 bg-sidebar cursor-pointer" />
	<Button
		variant="ghost"
		size="icon"
		class="bg-sidebar transition-[width] overflow-hidden cursor-pointer {sidebar.open &&
		!sidebar.isMobile
			? 'w-0 p-0'
			: 'w-9'}"
		onclick={openSearch}
	>
		<Search />
	</Button>
	<Button
		href="/chat"
		variant="ghost"
		size="icon"
		class="bg-sidebar transition-[width] overflow-hidden {sidebar.open && !sidebar.isMobile
			? 'w-0 p-0'
			: 'w-9'}"
		disabled={page.url.pathname === '/chat'}
	>
		<Plus />
	</Button>
</div>
<div class="fixed top-2 right-2 z-50">
	<LightSwitch />
</div>
<Sidebar.Root>
	<Sidebar.Header>
		<h1 class="text-lg p-1 text-center text-primary">
			<span class="font-semibold">C4</span> Chat
		</h1>

		<div class="flex p-1 pt-0">
			<Button href="/" class="w-full" data-sveltekit-preload-data="hover">
				<MessageSquare />
				<span>New Chat</span>
			</Button>
		</div>

		<div class="flex items-center mx-1 pl-2 border-b-1">
			<Search size="16" />
			<Input
				id="searchThreads"
				type="text"
				placeholder="Search your threads..."
				tabindex={searchTabIndex}
				bind:value={threads.searchQuery}
				class="w-full pl-4 p-2 border-0 bg-sidebar dark:bg-sidebar text-sm focus-visible:ring-0 focus-visible:border-0 shadow-none"
			/>
		</div>
	</Sidebar.Header>
	<Sidebar.Content class="gap-0 px-1">
		<Threads />
	</Sidebar.Content>
	<Sidebar.Footer class="gap-0">
		<Account />

		<div class="text-xs text-center p-0.5 px-3 flex justify-center w-full text-muted-foreground">
			<a
				href="http://github.com/caleb-irwin/c4-chat"
				target="_blank"
				rel="noopener noreferrer"
				class="font-semibold text-center flex-grow">GitHub</a
			>

			<p class="text-center flex-grow">
				Made by <a href="https://calebirwin.ca" class="font-semibold">Caleb</a> in 🇨🇦
			</p>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
