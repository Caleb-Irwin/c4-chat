<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import GoogleIcon from './GoogleIcon.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import OpenRouterIcon from './OpenRouter.svelte';
	import { useUser } from '$lib/user.svelte';
	import { Root } from '../ui/card';

	const user = useUser(),
		avatarSrc = $derived(user.row?.image ? `/img/${encodeURIComponent(user.row.image)}` : null);
</script>

<div class="flex flex-col items-center justify-center">
	<div class="p-1 w-full">
		{#if user.row?.freeRequestsLeft && user.row?.freeRequestsLeft <= 10}
			<p
				class="text-xs text-center p-0.5 {user.isAnonymous ? 'py-2' : 'py-1'} text-muted-foreground"
			>
				You have <span class="font-semibold">{user.row?.freeRequestsLeft}</span> free requests left
			</p>
		{/if}

		{#if user.row?.accountCreditsInCentThousandths && user.row?.accountCreditsInCentThousandths <= 10 * 1000}
			<p
				class="text-xs text-center p-0.5 {user.isAnonymous ? 'py-2' : 'py-1'} text-muted-foreground"
			>
				You have <span class="font-semibold"
					>¢{(user.row?.accountCreditsInCentThousandths ?? 0) / 1000}</span
				> in credits left
			</p>
		{/if}

		{#if user.row?.freeRequestsLeft === 0 && !user.row.openRouterKey}
			<Root class="mt-2 py-2 bg-red-200 border-red-700 text-sm mb-2">
				<p class="pl-3 text-center text-red-700">
					<span class="font-semibold">Zero</span> free requests left
				</p>
			</Root>
		{:else if user.row?.accountCreditsInCentThousandths !== undefined && user.row?.accountCreditsInCentThousandths <= 100}
			<Root class="mt-2 py-2 bg-yellow-200 border-yellow-700 text-sm mb-2">
				<p class="pl-3 text-center text-yellow-700">
					<span class="font-semibold">{user.row?.accountCreditsInCentThousandths}</span> account credits
					left
				</p>
			</Root>
		{/if}

		{#if user.isAnonymous}
			<Button
				class="w-full cursor-pointer"
				onclick={() => {
					user.signInGoogle();
				}}
			>
				<GoogleIcon />
				Sign in with Google
			</Button>

			<Button
				class="w-full cursor-pointer my-2"
				onclick={() => {
					user.signInOpenRouter();
				}}
			>
				<OpenRouterIcon />
				Sign in with OpenRouter
			</Button>
		{/if}

		{#if !user.isAnonymous && user.row}
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
						{user.row?.openRouterConnected === true ? 'Pro' : 'Basic'}</span
					>
				</p>
			</a>
		{/if}
	</div>
</div>
