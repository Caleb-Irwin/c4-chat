<script lang="ts">
	import { useChatRegistry } from '$lib/chats.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const threadId = data.threadId;

	const chatRegistry = useChatRegistry();
	chatRegistry.get(threadId as any);
	chatRegistry.setCurrent(threadId as any);
</script>

{#each Array(2) as _}
	<div class="flex justify-end pt-8">
		<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Hello World</div>
	</div>
	<div>
		<p>Hello World from AI</p>
	</div>
	<div class="flex justify-end pt-8">
		<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">Who are you?</div>
	</div>
	<div>
		<p>I'm C4 Chat.</p>
	</div>
{/each}
