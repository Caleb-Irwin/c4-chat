<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import MarkdownRenderer from './markdown-renderer.svelte';
	import { Root } from '../ui/card';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Separator from '../ui/separator/separator.svelte';
	import AttachmentList from './attachment-list.svelte';

	interface Props {
		message: Doc<'messages'>;
	}
	let { message }: Props = $props();

	const chat = useChat();

	let userMessageElement: HTMLDivElement;

	let hasScrolled = false;

	$effect(() => {
		if (!message.completed && userMessageElement && !hasScrolled) {
			hasScrolled = true;
			userMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		if (message.completed) {
			hasScrolled = false;
		}
	});
</script>

<div class="flex justify-end">
	<div
		bind:this={userMessageElement}
		class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl mt-8 flex flex-col"
	>
		{message.userMessage}
		{#if message.attachments && message.attachments.length > 0}
			<div class="flex flex-wrap gap-2 pt-2 justify-end w-full">
				<AttachmentList attachments={message.attachments} />
			</div>
		{/if}
	</div>
</div>

<div class="min-h-10 pt-8">
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
</div>

<div class="h-8"></div>
