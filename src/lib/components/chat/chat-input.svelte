<script lang="ts">
	import Button from '../ui/button/button.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ModelSelector from './model-selector.svelte';
	import Globe from '@lucide/svelte/icons/globe';
	import Square from '@lucide/svelte/icons/square';
	import { useChatManager } from '$lib/chats.svelte';
	import { browser } from '$app/environment';
	import type { ModelSummary } from '../../../convex/models';
	import { CONF } from '../../../conf';
	import Brain from '@lucide/svelte/icons/brain';
	import * as Popover from '../ui/popover';
	import Check from '@lucide/svelte/icons/check';
	import { useUser } from '$lib/user.svelte';
	import AttachmentButton from './attachment-button.svelte';
	import AttachmentList from './attachment-list.svelte';

	interface Props {
		models: ModelSummary[];
	}

	let { models }: Props = $props();

	const chatManager = useChatManager();
	const user = useUser();

	let text = $state(''),
		modelId = $state(''),
		lastThreadId = $state<string | null>('x'),
		reasoningPower = $state<'default' | 'low' | 'medium' | 'high'>('default'),
		reasoningSelected = $derived(reasoningPower !== 'default'),
		searchSelected = $derived(false),
		isPremium = $derived(!!user.row?.openRouterKey),
		isUploading = $state(false);

	const hasImage = $derived(
			user.row?.unsentAttachments?.some((attachment) => attachment.type.startsWith('image/'))
		),
		imagesAllowed = $derived(models.find((model) => model.id === modelId)?.supportsImages ?? true),
		invalidAttachment = $derived(hasImage && !imagesAllowed);

	const reasoningOptions = [
		{ value: 'default', label: 'Default' },
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	] as const;

	$effect(() => {
		if (browser && chatManager.threadId !== lastThreadId) {
			setTimeout(() => {
				document.getElementById('chat-input')?.focus();
			}, 100);
			lastThreadId = chatManager.threadId;
		}
	});

	function sendMessage() {
		if (text.trim()) {
			chatManager.sendMessage({
				userMessage: text,
				model: modelId,
				reasoning: reasoningPower,
				search: searchSelected
			});
			text = '';
			searchSelected = false;
		}
	}
</script>

<div class="px-2 pt-2 rounded-xl rounded-b-none bg-accent/80 shadow-sm backdrop-blur-xs">
	<form
		class="w-full bg-sidebar/50 text-card-foreground flex flex-col rounded-xl rounded-b-none shadow-sm"
		onsubmit={(e) => {
			e.preventDefault();
			if (chatManager.generating) {
				chatManager.chat?.stopGenerating();
			} else {
				sendMessage();
			}
		}}
	>
		<div class="p-3 pb-0">
			{#if user.row?.unsentAttachments && user.row?.unsentAttachments.length > 0}
				<div class="flex flex-wrap gap-2 mb-3">
					<AttachmentList attachments={user.row.unsentAttachments} allowDelete />
				</div>
			{/if}

			<Textarea
				name="chat-input"
				id="chat-input"
				class="p-0 rounded-none border-none bg-transparent dark:bg-transparent focus-visible:ring-0 resize-none max-h-60 min-h-12 shadow-none"
				placeholder="Type your message here..."
				bind:value={text}
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						sendMessage();
					}
				}}
			></Textarea>
		</div>
		{#if text.length > CONF.maxMessageSizeCharacters}
			<div class="mx-3 my-1 p-1 px-3 rounded-sm bg-accent">
				<span class="font-semibold pr-2">Warning</span> Message too long
			</div>
		{/if}
		{#if invalidAttachment}
			<div class="mx-3 my-1 p-1 px-3 rounded-sm bg-accent">
				<span class="font-semibold pr-2">Warning</span> This model does not support images. Remove image
				attachments.
			</div>
		{/if}
		<div class="flex align-middle items-end p-2 pt-1 overflow-hidden">
			<div class="min-w-8 max-w-80 flex-shrink">
				<ModelSelector {models} setModelId={(id) => (modelId = id)} />
			</div>
			<Popover.Root>
				<Popover.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							size="sm"
							class="ml-1 rounded-full w-8 sm:w-auto flex-shrink-0 bg-transparent dark:bg-transparent border-accent-foreground/20 dark:border-accent-foreground/20 hover:bg-accent/80 dark:hover:bg-accent/80 {reasoningSelected
								? 'bg-accent dark:bg-accent'
								: ''}"
							disabled={!isPremium}
						>
							<Brain />
							<span class="hidden sm:inline">
								{reasoningOptions.find((option) => option.value === reasoningPower)?.label}
							</span>
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-48 p-2">
					<Popover.Close class="w-full">
						<div class="space-y-1 w-full">
							{#each reasoningOptions as option}
								<button
									type="button"
									class="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground transition-colors shadow-xs"
									onclick={() => (reasoningPower = option.value)}
								>
									<div class="flex flex-col justify-start">
										<span class="text-left">{option.label} </span>
										{#if option.value === 'default'}
											<span class="text-xs text-muted-foreground">May be disabled</span>
										{/if}
									</div>
									{#if reasoningPower === option.value}
										<Check class="size-4" />
									{/if}
								</button>
							{/each}
						</div>
					</Popover.Close>
				</Popover.Content>
			</Popover.Root>
			<Button
				variant="outline"
				size="sm"
				class="ml-1 rounded-full w-8 sm:w-auto flex-shrink-0 bg-transparent dark:bg-transparent border-accent-foreground/20 dark:border-accent-foreground/20 hover:bg-accent/80 dark:hover:bg-accent/80 {searchSelected
					? 'bg-accent dark:bg-accent'
					: ''}"
				{...searchSelected ? { 'aria-pressed': 'true' } : {}}
				disabled={!isPremium}
				onclick={() => (searchSelected = !searchSelected)}
			>
				<Globe />
				<span class="hidden sm:inline"> Search </span>
			</Button>
			<AttachmentButton
				disabled={!isPremium}
				setUploading={(uploading) => (isUploading = uploading)}
				acceptImages={imagesAllowed}
			/>
			<div class="flex-grow"></div>
			<Button
				size="icon"
				class="ml-1 flex-shrink-0"
				disabled={(!text.trim() || isUploading || invalidAttachment) &&
					!chatManager.chat?.hasGeneratingMessage}
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
