<script lang="ts">
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import type { Id } from '../../../convex/_generated/dataModel';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Button from '../ui/button/button.svelte';
	import ModelSelector from './model-selector.svelte';
	import { getContext } from 'svelte';
	import { useChat } from '$lib/chats.svelte';

	interface Props {
		messageId: Id<'messages'>;
		model: string;
	}
	let { messageId, model }: Props = $props();

	let open = $state(false);

	let chat = useChat();

	const models = getContext('models') as any;

	function retryMessage(model: string) {
		open = false;
		chat.retryMessage(model, messageId);
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<RotateCcw />
	</Popover.Trigger>
	<Popover.Content class="w-50" side="top">
		<div class="grid gap-4">
			<ModelSelector
				{models}
				setModelId={(id) => {
					if (id === model) {
						return;
					}
					retryMessage(id);
				}}
				initModelId={model}
			/>
			<Button onclick={() => retryMessage(model)}>
				<RotateCcw />
				Retry
			</Button>
		</div>
	</Popover.Content>
</Popover.Root>
