<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ModelSelector from './model-selector.svelte';
	import Brain from '@lucide/svelte/icons/brain';
	import Globe from '@lucide/svelte/icons/globe';
	import Paperclip from '@lucide/svelte/icons/paperclip';
	import Square from '@lucide/svelte/icons/square';
	import { useChatManager } from '$lib/chats.svelte';
	import { browser } from '$app/environment';
	import type { ModelSummary } from '../../../convex/models';

	interface Props {
		models: ModelSummary[];
	}

	let { models }: Props = $props();

	const chatManager = useChatManager();
	let text = $state(''),
		lastThreadId = $state<string | null>('x');

	$effect(() => {
		if (browser && chatManager.threadId !== lastThreadId) {
			setTimeout(() => {
				document.getElementById('chat-input')?.focus();
			}, 100);
			lastThreadId = chatManager.threadId;
		}
	});
</script>

<div class="px-2 pt-2 rounded-xl rounded-b-none bg-accent/80 shadow-sm backdrop-blur-xs">
	<form
		class="w-full bg-sidebar/50 text-card-foreground flex flex-col rounded-xl rounded-b-none shadow-sm"
		onsubmit={(e) => {
			e.preventDefault();
			if (chatManager.generating) {
				chatManager.chat?.stopGenerating();
			} else if (text.trim()) {
				chatManager.sendMessage({ message: text, model: 'todo' });
				text = '';
			}
		}}
	>
		<div class="p-3 pb-0">
			<Textarea
				name="chat-input"
				id="chat-input"
				class="p-0 rounded-none border-none bg-transparent dark:bg-transparent focus-visible:ring-0 resize-none max-h-60 min-h-12 shadow-none"
				placeholder="Type your message here..."
				bind:value={text}
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						if (text.trim()) {
							chatManager.sendMessage({ message: text, model: 'todo' });
							text = '';
						}
					}
				}}
			></Textarea>
		</div>
		<div class="flex align-middle items-end p-2 pt-1 overflow-hidden">
			<div class="min-w-8 max-w-80 flex-shrink">
				<ModelSelector {models} />
			</div>
			<Button
				variant="outline"
				size="sm"
				class="ml-1 rounded-full w-8 lg:w-auto flex-shrink-0 bg-transparent dark:bg-transparent"
			>
				<Brain />
				<span class="hidden lg:inline"> Medium </span>
			</Button>
			<Button
				variant="outline"
				size="sm"
				class="ml-1 rounded-full w-8 lg:w-auto flex-shrink-0 bg-transparent dark:bg-transparent"
			>
				<Globe />
				<span class="hidden lg:inline"> Search </span>
			</Button>
			<Button
				variant="outline"
				size="sm"
				class="ml-1 rounded-full w-8 lg:w-auto flex-shrink-0 bg-transparent dark:bg-transparent"
			>
				<Paperclip />
				<span class="hidden lg:inline"> Attach </span>
			</Button>
			<div class="flex-grow"></div>
			<Button
				size="icon"
				class="ml-1 flex-shrink-0"
				disabled={!text.trim() && !chatManager.chat?.hasGeneratingMessage}
				type="submit"
			>
				{#if chatManager.generating}
					<Square fill="currentColor" class="size-5" />
				{:else}
					<ArrowUp class="size-5" />
				{/if}
			</Button>
		</div>
	</form>
</div>
