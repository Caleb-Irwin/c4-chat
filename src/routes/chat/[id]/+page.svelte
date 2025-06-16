<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import Messages from '$lib/components/chat/messages.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const chat = useChat();

	let lastThreadId = $state<string | undefined>(data.threadId);
	chat.setThreadId(data.threadId);
	chat._addInitialData(data.messages);

	$effect(() => {
		if (lastThreadId !== data.threadId) {
			lastThreadId = data.threadId;
			chat.setThreadId(data.threadId);
			chat._addInitialData(data.messages);
		}
	});
</script>

<Messages />
