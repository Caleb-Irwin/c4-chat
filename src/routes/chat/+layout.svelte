<script lang="ts">
	import ChatInput from '$lib/components/chat/chat-input.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex-grow w-full overflow- max:h-screen flex justify-center">
	<div class="flex-grow w-full overflow-hidden flex flex-col pb-0">
		<div class="flex-grow w-full flex justify-center max-h-screen overflow-x-scroll px-2">
			<div class="max-w-3xl w-full px-2">
				<div class="h-8"></div>
				{@render children?.()}
				<div class="h-[188px]"></div>
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
