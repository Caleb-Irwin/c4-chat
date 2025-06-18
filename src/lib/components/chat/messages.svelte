<script lang="ts">
	import { ChatClass, setChat } from '$lib/chats.svelte';
	import type { Doc, Id } from '../../../convex/_generated/dataModel';
	import Message from './message.svelte';

	interface Props {
		threadId: Id<'threads'>;
		messages: Promise<Doc<'messages'>[]>;
	}

	let { threadId, messages }: Props = $props();

	const chat = new ChatClass(threadId, messages);
	setChat(chat);
</script>

<div class="h-16"></div>

{#each chat.messages as message (message._id)}
	<Message {message} />
{/each}

<div class="h-[188px]"></div>
