<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import MarkdownRenderer from './markdown-renderer.svelte';
	import { Root } from '../ui/card';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Separator from '../ui/separator/separator.svelte';
	import AttachmentList from './attachment-list.svelte';
	import Button from '../ui/button/button.svelte';
	import Edit from '@lucide/svelte/icons/edit';
	import { shortName } from './shortName';
	import Copy from './copy.svelte';
	import Retry from './retry.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';

	interface Props {
		message: Doc<'messages'>;
	}
	let { message }: Props = $props();

	const chat = useChat();

	let userMessageElement: HTMLDivElement;

	let hasScrolled = $state(false);

	let editMode = $state(false),
		newMessage = $derived(message.userMessage),
		selected = $state(false),
		started = $state(false),
		userGroupClicked = $state(false),
		aiGroupClicked = $state(false);

	let userGroupElement: HTMLDivElement;
	let aiGroupElement: HTMLDivElement;

	$effect(() => {
		if (!message.completed && userMessageElement && !hasScrolled) {
			hasScrolled = true;
			userMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		if (message.completed) {
			hasScrolled = false;
		}
	});

	$effect(() => {
		if (editMode && !selected) {
			const inputElement = document.getElementById(message._id) as HTMLTextAreaElement;
			if (!inputElement) return;
			inputElement.focus();
			inputElement.setSelectionRange(0, newMessage.length);
			selected = true;
		}
		if (!editMode) {
			selected = false;
		}
	});

	const handleClickOutside = (event: MouseEvent) => {
		const target = event.target as Node;

		if (userGroupElement && !userGroupElement.contains(target)) {
			userGroupClicked = false;
		}

		if (aiGroupElement && !aiGroupElement.contains(target)) {
			aiGroupClicked = false;
		}
	};

	$effect(() => {
		if (userGroupClicked || aiGroupClicked) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div
	bind:this={userGroupElement}
	class="flex flex-col items-end group/message w-full"
	role="button"
	tabindex="0"
	onclick={() => (userGroupClicked = true)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			userGroupClicked = true;
		}
	}}
>
	<div
		bind:this={userMessageElement}
		class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl flex flex-col {editMode
			? 'flex-grow'
			: ''}"
	>
		{#if !editMode}
			{message.userMessage}
		{:else}
			<Textarea
				id={message._id}
				bind:value={newMessage}
				class="w-full"
				disabled={started}
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						started = true;
						chat
							.editMessage(message._id, newMessage)
							.then(() => {
								editMode = false;
							})
							.finally(() => {
								started = false;
							});
					}
				}}
			/>
		{/if}

		{#if message.attachments && message.attachments.length > 0}
			<div class="flex flex-wrap gap-2 pt-2 justify-end w-full">
				<AttachmentList attachments={message.attachments} />
			</div>
		{/if}
	</div>

	<div
		class="flex w-full justify-end py-4 gap-1 opacity-0 {message.completed
			? 'group-hover/message:opacity-100'
			: ''} {userGroupClicked ? 'opacity-100' : ''} transition-opacity"
	>
		<Retry messageId={message._id} model={message.model} />

		<Button
			variant="ghost"
			size="icon"
			onclick={() => {
				editMode = !editMode;
			}}
		>
			<Edit class="h-3 w-3" />
		</Button>

		<Copy text={message.userMessage} />
	</div>
</div>

<div
	bind:this={aiGroupElement}
	class="min-h-10 group/message"
	role="button"
	tabindex="0"
	onclick={() => (aiGroupClicked = true)}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			aiGroupClicked = true;
		}
	}}
>
	{#if message.reasoning}
		<Accordion.Root type="single">
			<Accordion.Item value="item-1">
				<Accordion.Trigger class="justify-start gap-2 no-underline!">
					<div class="flex">
						{#if !message.message && !message.completed}
							<LoaderCircle class="animate-spin  text-primary mr-2 size-5!" />
						{/if}
						Reasoning
					</div>
				</Accordion.Trigger>
				<Accordion.Content>
					<MarkdownRenderer md={message.reasoning} />
					<Separator class="mt-4" />
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	{/if}

	{#if message.message.trim() !== ''}
		<MarkdownRenderer md={message.message} />
	{:else if !message.completed && !message.reasoning}
		<div class="flex justify-start">
			<LoaderCircle class="animate-spin size-10! text-primary" />
		</div>
	{:else if !message.reasoning && message.completed && message.completionStatus === 'completed'}
		<div class="text-left text-muted-foreground py-2">No response</div>
	{/if}
	{#if message.annotations && message.annotations.length > 0}
		<Accordion.Root type="single">
			<Accordion.Item value="item-1">
				<Accordion.Trigger class="justify-start gap-2 no-underline!">
					Search Grounding Details
				</Accordion.Trigger>
				<Accordion.Content>
					<div class="space-y-3">
						{#each message.annotations as annotation, index (index)}
							<div class="border rounded-lg p-3 bg-background">
								{#if annotation.title}
									<h4 class="font-medium text-sm mb-2">{annotation.title}</h4>
								{/if}
								{#if annotation.content}
									<p class="text-sm text-muted-foreground mb-2">{annotation.content}</p>
								{/if}
								{#if annotation.url}
									<a
										href={annotation.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-primary hover:underline inline-flex items-center gap-1"
									>
										View Source
										<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
											></path>
										</svg>
									</a>
								{/if}
								{#if annotation.startIndex && annotation.endIndex}
									<div class="text-xs text-muted-foreground mt-2">
										Reference: characters {annotation.startIndex}-{annotation.endIndex}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	{/if}

	{#if message.completed && message.completionStatus === 'error'}
		<Root class="mt-2 py-2 bg-red-200 border-red-700">
			<p class="pl-3 text-center text-red-700">
				<span class="font-semibold">Error</span> An error occurred while processing your request.
			</p>
		</Root>
	{:else if message.completed && message.completionStatus === 'stopped'}
		<Root class="mt-2 py-2 bg-accent">
			<p class="pl-3 text-center text-muted-foreground">
				<span class="font-semibold">Request Stopped</span>
			</p>
		</Root>
	{/if}

	<div
		class="flex w-full justify-start items-center py-3 gap-1 opacity-0 {message.completed
			? 'group-hover/message:opacity-100'
			: ''} {aiGroupClicked ? 'opacity-100' : ''} transition-opacity"
	>
		<Copy text={message.message} />
		<Retry messageId={message._id} model={message.model} />
		<p class="text-sm text-muted-foreground pl-1">
			{message.modelName ? shortName(message.modelName) : message.model}
		</p>
	</div>
</div>
