<script lang="ts">
	import ChatInput from '$lib/components/chat/chat-input.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Models are now available in this variable
	const models = data.models;
</script>

<div class="flex-grow h-full flex justify-center">
	<div class="flex-grow w-full overflow-hidden flex flex-col">
		<div class="flex-grow w-full flex justify-center overflow-y-scroll px-2">
			<div class="max-w-3xl w-full px-2">
				{@render children?.()}
			</div>
		</div>
		<div class="w-full flex justify-center px-2">
			<div class="relative w-full max-w-3xl">
				<div class="absolute bottom-0 w-full">
					<ChatInput {models} />
				</div>
			</div>
		</div>
	</div>
</div>
