<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Button from '../ui/button/button.svelte';
	import Check from '@lucide/svelte/icons/check';

	interface Props {
		text: string;
	}
	let { text }: Props = $props();

	let copied = $state(false);
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={async () => {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}}
>
	{#if copied}
		<Check />
	{:else}
		<Copy />
	{/if}
</Button>
