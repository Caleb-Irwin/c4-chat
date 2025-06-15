<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import ChatInput from '$lib/components/chat/chat-input.svelte';
	import Messages from '$lib/components/chat/messages.svelte';

	let { children } = $props();

	useChat();
</script>

{@render children?.()}
<div class="flex-grow w-full overflow- max:h-screen flex justify-center">
	<div class="flex-grow w-full overflow-hidden flex flex-col pb-0">
		<div class="flex-grow w-full flex justify-center max-h-screen overflow-x-scroll px-2">
			<div class="max-w-3xl w-full px-2">
				<Messages />
			</div>
		</div>
		<div class="w-full flex justify-center px-2">
			<div class="relative w-full max-w-3xl">
				<div class="absolute bottom-0 w-full">
					<ChatInput />
				</div>
			</div>
		</div>
	</div>
</div>
