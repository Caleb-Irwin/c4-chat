<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
	import Button from '../ui/button/button.svelte';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Account from './account.svelte';
</script>

<div class="fixed top-4 left-4 z-50">
	<Sidebar.Trigger class="bg-background" />
</div>
<Sidebar.Root>
	<Sidebar.Header>
		<h1 class="text-xl p-2 text-center">C4 Chat</h1>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href={'/'} {...props}>
									<MessageSquare />
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
