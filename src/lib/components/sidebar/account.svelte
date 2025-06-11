<script lang="ts">
	import { useAuth } from '@mmailaender/convex-auth-svelte/svelte';
	import Button from '../ui/button/button.svelte';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import GoogleIcon from './GoogleIcon.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Settings from '@lucide/svelte/icons/settings';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';

	const userInfo = useQuery(
		api.user.getInfo,
		{},
		{
			keepPreviousData: true
		}
	);

	const auth = useAuth(),
		isLoading = $derived(auth.isLoading),
		isAnonymous = $derived(userInfo.isLoading ? true : userInfo.data?.isAnonymous === true),
		isEitherLoading = $derived(isLoading || userInfo.isLoading);

	let isSigningOut = $state(false);
	$effect(() => {
		if (isSigningOut && !isEitherLoading && isAnonymous) {
			isSigningOut = false;
		}
	});
</script>

<div class="flex flex-col items-center justify-center">
	<Card.Root class="p-2 w-full">
		<div>
			{#if !isEitherLoading && isAnonymous}
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
					Sign in with OpenRouter
				</Button>
			{/if}
			<div class="flex items-center min-h-9">
				<Avatar.Root>
					<Avatar.Image src={userInfo?.data?.image} alt="User Avatar" />
					<Avatar.Fallback
						>{isEitherLoading ? '' : (userInfo.data?.name?.[0] ?? 'A')}</Avatar.Fallback
					>
				</Avatar.Root>
				<p class="flex-grow px-2 font-semibold text-accent-foreground">
					{isEitherLoading
						? ''
						: (userInfo?.data?.name ?? `Anonymous ${userInfo.data?._id?.slice(0, 4)}`)}
				</p>
				{#if !isAnonymous || isEitherLoading}
					<Button
						disabled={isEitherLoading}
						href="/settings"
						class="mr-1"
						variant="secondary"
						size="icon"
					>
						<Settings />
					</Button>
					<Button
						disabled={isEitherLoading || isSigningOut}
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
