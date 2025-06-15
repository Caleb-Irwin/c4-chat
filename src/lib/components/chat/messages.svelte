<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import { useUser } from '$lib/user.svelte';
	import Message from './message.svelte';

	const chat = useChat();
	const user = useUser();
</script>

{#if chat.isEmpty}
	<div class="h-full grid place-content-center">
		<h2 class="text-center text-3xl font-semibold mt-8">
			How can I help you{user.row?.name ? `, ${user.row.name.split(' ')[0]}` : ''}?
		</h2>
	</div>
{:else if chat.messages}
	<div class="h-8"></div>

	{#each chat.messages as message (message._id)}
		<Message {message} />
	{/each}

	<div class="h-[188px]"></div>
{/if}
