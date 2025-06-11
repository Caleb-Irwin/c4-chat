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

	const sidebar = useSidebar();
</script>

<div class="fixed top-2 left-2 z-50 bg-sidebar rounded-sm pointer-events-auto">
	<Sidebar.Trigger class="h-9 w-9 bg-sidebar" />
	<Button
		variant="ghost"
		size="icon"
		class="bg-sidebar transition-[width] overflow-hidden {sidebar.open && !sidebar.isMobile
			? 'w-0 p-0'
			: 'w-9'}"
	>
		<Search />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class="bg-sidebar transition-[width] overflow-hidden {sidebar.open && !sidebar.isMobile
			? 'w-0 p-0'
			: 'w-9'}"
	>
		<Plus />
	</Button>
</div>
<div class="fixed top-2 right-2 z-50">
	<LightSwitch />
</div>
<Sidebar.Root>
	<Sidebar.Header>
		<h1 class="text-lg p-1 text-center">
			<span class="font-semibold">C4</span> Chat
		</h1>

		<div class="flex p-1 pt-0">
			<Button href="/" class="w-full">
				<MessageSquare />
				<span>New Chat</span>
			</Button>
		</div>

		<div class="flex items-center mx-1 pl-2 border-b-1">
			<Search size="16" />
			<Input
				type="text"
				placeholder="Search your threads..."
				class="w-full pl-4 p-2 border-0 bg-sidebar dark:bg-sidebar text-sm focus-visible:ring-0 focus-visible:border-0"
			/>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Today</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton class="px-4">
							{#snippet child({ props })}
								<a href={'/'} {...props}>
									<span>{'Hello'}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Account />

		<div class="text-xs text-center p-1 flex justify-center w-full">
			<a
				href="http://github.com/caleb-irwin/c4-chat"
				target="_blank"
				rel="noopener noreferrer"
				class="underline">GitHub</a
			>
			<p class="text-xs text-center pl-2">
				Made by <a href="https://calebirwin.ca" class="underline">Caleb</a> in 🇨🇦
			</p>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
