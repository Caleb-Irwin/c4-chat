<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import MarkdownRenderer from './markdown-renderer.svelte';

	interface Props {
		message: Doc<'messages'>;
	}
	let { message }: Props = $props();

	const chat = useChat();
</script>

<div class="flex justify-end pt-8">
	<div class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl">
		{message.userMessage}
	</div>
</div>
<div class="pt-8">
	<MarkdownRenderer md={message.message} />
</div>
