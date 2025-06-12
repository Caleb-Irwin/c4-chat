<script lang="ts">
	import Button from './ui/button/button.svelte';
	import Textarea from './ui/textarea/textarea.svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ModelSelector from './model-selector.svelte';
	import Brain from '@lucide/svelte/icons/brain';
	import Globe from '@lucide/svelte/icons/globe';
	import Paperclip from '@lucide/svelte/icons/paperclip';

	let {}: {} = $props();
</script>

<div class="p-2 rounded-xl bg-sidebar shadow-sm">
	<div
		class="w-full bg-background/30 text-card-foreground flex flex-col rounded-xl pb-1.5 shadow-sm"
	>
		<div class="p-3 pb-0">
			<Textarea
				name="chat-input"
				id="chat-input"
				class="p-0 rounded-none border-none bg-transparent dark:bg-transparent focus-visible:ring-0 resize-none max-h-60 min-h-12 shadow-none"
				placeholder="Type your message here..."
			></Textarea>
		</div>
		<div class="flex align-middle items-end p-2 pt-1 overflow-hidden">
			<div class="min-w-8 max-w-80 flex-shrink">
				<ModelSelector />
			</div>
			<Button variant="outline" size="sm" class="ml-1 rounded-full w-8 lg:w-auto flex-shrink-0">
				<Brain />
				<span class="hidden lg:inline"> Medium </span>
			</Button>
			<Button variant="outline" size="sm" class="ml-1 rounded-full w-8 lg:w-auto flex-shrink-0">
				<Globe />
				<span class="hidden lg:inline"> Search </span>
			</Button>
			<Button variant="outline" size="sm" class="ml-1 rounded-full w-8 lg:w-auto flex-shrink-0">
				<Paperclip />
				<span class="hidden lg:inline"> Attach </span>
			</Button>
			<div class="flex-grow"></div>
			<Button size="icon" class="ml-1 flex-shrink-0"><ArrowUp width="24" height="24" /></Button>
		</div>
		<div class="h-2"></div>
	</div>
</div>
