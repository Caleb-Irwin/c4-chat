<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import Message from './message.svelte';

	const chat = useChat();
</script>

<div class="h-8"></div>

{#each chat.messages as message (message._id)}
	<Message {message} />
{/each}

<div class="h-[188px]"></div>
