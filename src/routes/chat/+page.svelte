<script lang="ts">
	import { browser } from '$app/environment';
	import { preloadCode } from '$app/navigation';
	import { useChatManager } from '$lib/chats.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { useUser } from '$lib/user.svelte';
	import { onMount } from 'svelte';

	let {} = $props();

	const user = useUser();
	const chatManager = useChatManager();
	$effect(() => {
		if (chatManager.threadId !== null) chatManager.setup(null, null);
	});

	onMount(() => {
		if (browser) preloadCode('/chat/*');
	});

	const examplePrompts = [
		'How does AI work?',
		'How many Rs are in the word "strawberry"?',
		'What is the meaning of life?',
		'Countries ranked by number of corgis'
	];
</script>

<div class="h-full grid place-content-center">
	{#if !chatManager.hasText}
		<h2 class="text-3xl font-semibold mt-8">
			How can I help you{user.row?.name ? `, ${user.row.name.split(' ')[0]}` : ''}?
		</h2>
		<div class="flex flex-col pt-4 md:min-w-lg lg:min-w-xl xl:min-w-2xl">
			{#each examplePrompts as item, i}
				<button
					class="py-3 text-left text-muted-foreground hover:text-foreground {i > 0
						? 'border-t'
						: ''} border-muted-foreground/20"
					onclick={() => (chatManager.firstMessage = item)}
				>
					{item}
				</button>
			{/each}
		</div>
	{/if}
</div>
