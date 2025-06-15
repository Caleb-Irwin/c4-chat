<script lang="ts">
	import { useChat } from '$lib/chats.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const threadId = data.threadId;

	const chat = useChat();
	chat._addInitialData(threadId, (async () => undefined)());
</script>
