<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import GoogleIcon from './GoogleIcon.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { useUser } from '$lib/user.svelte';
	import { Root } from '../ui/card';
	import Unlock from '@lucide/svelte/icons/unlock';

	const user = useUser(),
		avatarSrc = $derived(user.row?.image ? `/img/${encodeURIComponent(user.row.image)}` : null);
</script>

<div class="flex flex-col items-center justify-center">
	<div class="p-1 w-full">
		{#if user.row?.freeRequestsLeft && user.row?.freeRequestsLeft <= 9}
			<p
				class="text-xs text-center p-0.5 {user.isAnonymous ? 'py-2' : 'py-1'} text-muted-foreground"
			>
				You have <span class="font-semibold">{user.row?.freeRequestsLeft}</span> free requests left
			</p>
		{/if}

		{#if user.row?.freeRequestsLeft === 0 && !user.row.openRouterKey}
			<Root class="my-2 py-2 bg-red-200 border-red-700 text-sm">
				<p class="pl-3 text-center text-red-700">
					<span class="font-semibold">Zero</span> free requests left
				</p>
			</Root>
		{:else if !user.isAnonymous && user.row?.accountCreditsInCentThousandths !== undefined && user.row?.accountCreditsInCentThousandths <= 100}
			<Root class="my-2 py-2 bg-yellow-200 border-yellow-700 text-sm">
				<p class="pl-3 text-center text-yellow-700">
					<span class="font-semibold">{user.row?.accountCreditsInCentThousandths}</span> account credits
					left
				</p>
			</Root>
		{/if}

		{#if user.isAnonymous}
			<Root class="py-3 mb-2 px-3 text-sm">
				<div class="flex items-start space-x-2">
					<Unlock class="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
					<div class="text-primary">
						<p class="font-medium mb-1">Unlock More Features</p>
						<p class="text-xs text-primary">
							Sign in or create an account to access more features and credits
						</p>
					</div>
				</div>
			</Root>

			<Button
				class="w-full cursor-pointer dark:border-border dark:hover:bg-accent shadow-xs"
				variant="outline"
				onclick={() => {
					user.signInGoogle();
				}}
			>
				<GoogleIcon />
				Sign in with Google
			</Button>
		{/if}

		{#if !user.isAnonymous && user.row}
			{#if !user.row.openRouterKey}
				<Root class="py-3 mb-2 px-3 text-sm">
					<a class="flex items-start space-x-2" href="/settings">
						<Unlock class="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
						<div class="text-primary">
							<p class="font-medium mb-1">Unlock Premium Features</p>
							<p class="text-xs text-primary">
								Connect to OpenRouter to access hundreds of models, search, and attachments
							</p>
						</div>
					</a>
				</Root>
			{/if}

			<a
				href={user.row ? '/settings' : '/'}
				class="flex items-center min-h-9 p-3 rounded-sm hover:bg-accent"
			>
				<Avatar.Root>
					{#if avatarSrc}
						<Avatar.Image src={avatarSrc} alt="User Avatar" />
					{/if}
					<Avatar.Fallback>{user.row?.name?.[0] ?? ''}</Avatar.Fallback>
				</Avatar.Root>
				<p class="flex-grow px-3 text-accent-foreground flex flex-col">
					<span class="truncate text-sm"> {user.row?.name}</span>
					<span class="text-xs text-muted-foreground">
						{user.row?.openRouterKey ? 'Pro' : 'Basic'}</span
					>
				</p>
			</a>
		{/if}
	</div>
</div>
