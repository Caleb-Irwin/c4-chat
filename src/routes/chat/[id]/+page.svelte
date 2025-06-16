<script lang="ts">
	import Messages from '$lib/components/chat/messages.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#key data.threadId}
	<Messages threadId={data.threadId} messages={data.messages} />
{/key}
