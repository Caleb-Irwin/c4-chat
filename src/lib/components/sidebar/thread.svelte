<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Button from '../ui/button/button.svelte';
	import X from '@lucide/svelte/icons/x';
	import Pin from '@lucide/svelte/icons/pin';
	import PinOff from '@lucide/svelte/icons/pin-off';
	import Pen from '@lucide/svelte/icons/pen';
	import { useThreads } from '$lib/threads.svelte';
	import Input from '../ui/input/input.svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { useChat } from '$lib/chats.svelte';
	import { browser } from '$app/environment';

	const sidebar = Sidebar.useSidebar();

	interface Props {
		thread: Doc<'threads'>;
	}

	let { thread }: Props = $props();

	const threads = useThreads();
	const chat = useChat();

	let delDialogOpen = $state(false),
		isEditing = $state(false),
		title = $derived(thread.title),
		menuOpen = $state(false);

	$effect(() => {
		if (isEditing) {
			const inputElement = document.querySelector('.t_' + thread._id) as HTMLInputElement;
			inputElement.focus();
		}
	});

	function saveTitle() {
		isEditing = false;
		if (title.trim() !== thread.title) {
			threads.rename(thread._id, title.trim()).then(() => {});
		}
	}
</script>

<Sidebar.MenuItem class="group/item">
	<Sidebar.MenuButton class="p-0 relative gap-0">
		{#if isEditing}
			<Input
				type="text"
				class="{'t_' +
					thread._id} ml-2 px-4 p-2 w-full border-0 bg-transparent dark:bg-transparent text-sm focus-visible:ring-0 focus-visible:border-0 shadow-none"
				placeholder="Thread Title"
				bind:value={title}
				onblur={saveTitle}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						saveTitle();
					}
				}}
			/>
			<Button
				class="m-0.5 w-7 h-7 bg-sidebar cursor-pointer"
				variant="ghost"
				size="icon"
				onclick={() => {
					saveTitle();
				}}
			>
				<Pen />
			</Button>
		{:else}
			<a
				href={`/chat/${thread._id}`}
				class="px-4 p-2 w-full block"
				onclick={() => {
					chat.changeThread(thread._id);
				}}
				onmousedown={(_) => {
					chat.changeThread(thread._id);
				}}
			>
				<span class="truncate block">{title}</span>
			</a>
		{/if}

		{#if browser}
			<div
				class="flex items-center justify-end absolute right-0.5 top-1/2 -translate-y-1/2 {isEditing
					? 'hidden'
					: ''}"
			>
				<div
					class="transition-[width] overflow-hidden w-0 h-7 animate-spin bg-sidebar inline-flex shrink-0 items-center justify-center rounded-full [&_svg:not([class*='size-'])]:size-4 {thread.generating
						? 'w-7'
						: ''}"
				>
					<LoaderCircle />
				</div>

				<Button
					class="transition-[width] overflow-hidden w-0 group-hover/item:w-7 group-hover/item:ml-0.5 h-7 bg-sidebar hover:bg-sidebar-accent dark:hover:bg-sidebar-accent cursor-pointer {menuOpen
						? 'w-7'
						: ''}"
					variant="ghost"
					size="icon"
					onclick={() => {
						isEditing = true;
					}}
				>
					<Pen />
				</Button>

				<Button
					class="transition-[width] overflow-hidden w-0 group-hover/item:w-7 group-hover/item:ml-0.5 h-7 bg-sidebar hover:bg-sidebar-accent dark:hover:bg-sidebar-accent cursor-pointer {menuOpen
						? 'w-7'
						: ''}"
					variant="ghost"
					size="icon"
					onclick={() => {
						threads.togglePin(thread._id, !thread.pinned);
					}}
				>
					{#if thread.pinned}
						<PinOff />
					{:else}
						<Pin />
					{/if}
				</Button>

				<Button
					class="transition-[width] overflow-hidden w-0 group-hover/item:w-7 group-hover/item:ml-0.5 h-7 bg-sidebar hover:bg-sidebar-accent dark:hover:bg-sidebar-accent cursor-pointer {menuOpen
						? 'w-7'
						: ''}"
					variant="ghost"
					size="icon"
					onclick={() => {
						delDialogOpen = true;
					}}
				>
					<X />
				</Button>

				{#if sidebar.isMobile}
					<Button
						class="w-7 h-7 ml-0.5 bg-sidebar hover:bg-sidebar-accent dark:hover:bg-sidebar-accent cursor-pointer"
						variant="ghost"
						size="icon"
						onclick={() => {
							menuOpen = !menuOpen;
						}}
					>
						{#if menuOpen}
							<ChevronRight />
						{:else}
							<ChevronLeft />
						{/if}
					</Button>
				{/if}
			</div>
		{/if}
	</Sidebar.MenuButton>
</Sidebar.MenuItem>

<AlertDialog.Root bind:open={delDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Thread</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{thread.title}"? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => threads.del(thread._id).then(() => (delDialogOpen = false))}
				>Delete</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
