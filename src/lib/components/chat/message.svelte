<script lang="ts">
	import { useChat } from '$lib/chats.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import MarkdownRenderer from './markdown-renderer.svelte';
	import { Root } from '../ui/card';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Separator from '../ui/separator/separator.svelte';

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
		class="text-right bg-secondary/50 max-w-[80%] px-4 py-3 rounded-xl mt-8"
	>
		{message.userMessage}
	</div>
</div>

<div class="min-h-10 pt-8">
	{#if message.reasoning}
		<Accordion.Root type="single">
			<Accordion.Item value="item-1">
				<Accordion.Trigger class="justify-start gap-1 no-underline!">
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
</div>

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

<div class="h-8"></div>
