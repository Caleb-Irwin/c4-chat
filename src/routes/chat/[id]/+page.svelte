<script lang="ts">
	import { useChat } from '$lib/chats.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const chat = useChat();
	chat.changeThread(data.threadId);

	$effect(() => {
		if (data.threadId === chat.threadId) chat._addInitialData(data.threadId, data.messages);
	});
</script>
