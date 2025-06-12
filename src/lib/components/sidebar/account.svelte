<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
	import Button from '../ui/button/button.svelte';
	import GoogleIcon from './GoogleIcon.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Settings from '@lucide/svelte/icons/settings';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import OpenRouterIcon from './OpenRouter.svelte';
	import { useUser } from '$lib/user.svelte';

	const user = useUser(),
		auth = useAuth();

	const isAnonymous = $derived(user.row ? user.row.isAnonymous : false);

	let isSigningOut = $state(false);
	$effect(() => {
		if (user.isAuthenticated && user.row?.isAnonymous) {
			isSigningOut = false;
		}
	});
</script>

<div class="flex flex-col items-center justify-center">
	<Card.Root class="p-2 w-full">
		<div>
			{#if !user.isAuthenticated || isAnonymous}
				<Button
					class="w-full"
					onclick={() => {
						auth.signIn('google');
					}}
				>
					<GoogleIcon />
					Sign in with Google
				</Button>

				<Button
					class="w-full my-2"
					disabled
					onclick={() => {
						// auth.signIn('google');
					}}
				>
					<OpenRouterIcon />
					Sign in with OpenRouter
				</Button>
			{/if}

			<div class="flex items-center min-h-9">
				<img
					src={user.row?.image ? `/img/${encodeURIComponent(user.row.image)}` : undefined}
					class="hidden"
					alt="User Avatar"
				/>
				<Avatar.Root>
					<Avatar.Image
						src={user.row?.image ? `/img/${encodeURIComponent(user.row.image)}` : undefined}
						alt="User Avatar"
					/>
					<Avatar.Fallback>{user.row ? (user.row?.name?.[0] ?? 'A') : ''}</Avatar.Fallback>
				</Avatar.Root>
				<p class="flex-grow px-2 font-semibold text-accent-foreground">
					{user.row ? (user.row?.name ?? `Anonymous ${user.row?._id?.slice(0, 4) ?? ''}`) : ''}
				</p>
				{#if !isAnonymous}
					<Button
						disabled={!user.row}
						href="/settings"
						class="mr-1"
						variant="secondary"
						size="icon"
					>
						<Settings />
					</Button>
					<Button
						disabled={!user.row}
						onclick={() => {
							isSigningOut = true;
							auth.signOut();
						}}
						variant="secondary"
						size="icon"
					>
						{#if isSigningOut}
							<Loader2Icon class="animate-spin" />
						{:else}
							<LogOut />
						{/if}
					</Button>
				{/if}
			</div>
		</div>
	</Card.Root>
</div>
