<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { useUser } from '$lib/user.svelte';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import LogOut from '@lucide/svelte/icons/log-out';

	let {} = $props();

	const user = useUser();

	let isSigningOut = $state(false);
	$effect(() => {
		if (user.isAuthenticated && user.row?.isAnonymous) {
			isSigningOut = false;
		}
	});
</script>

{#if user.isAnonymous}
	<div class="w-full h-full grid place-content-center">
		<h2>Please sign in to change settings.</h2>
	</div>
{:else if user.row}
	<div class="w-full h-full grid place-content-center">
		<Button
			disabled={isSigningOut}
			onclick={() => {
				isSigningOut = true;
				user.signOut();
			}}
			variant="secondary"
		>
			{#if isSigningOut}
				<Loader2Icon class="animate-spin" />
			{:else}
				<LogOut />
			{/if}

			Sign out
		</Button>
	</div>
{/if}
