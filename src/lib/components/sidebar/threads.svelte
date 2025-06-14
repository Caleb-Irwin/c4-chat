<script lang="ts">
	import { PAGE_SIZE, useThreads } from '$lib/threads.svelte';
	import ThreadGroup from './thread-group.svelte';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import { preloadData } from '$app/navigation';
	import { browser } from '$app/environment';
	import Button from '../ui/button/button.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const threads = useThreads();

	let searchRes: Doc<'threads'>[] | null = $state(null);
	$effect(() => {
		if (!threads.searchResultsIsLoading) {
			searchRes = threads.searchResults;
		}
	});

	const preloaded = new Set<string>();
	$effect(() => {
		if (!browser) return;
		const toPreload = [
			...threads.pinned.map((thread) => thread._id),
			...threads.all
				.slice(0, threads.pinned.length >= 20 ? 0 : 20 - threads.pinned.length)
				.map((thread) => thread._id)
		];
		for (const threadId of toPreload) {
			if (!preloaded.has(threadId)) {
				preloadData(`/chat/${threadId}`);
				preloaded.add(threadId);
			}
		}
	});

	const buckets = $derived.by(() => {
		const now = new Date(),
			todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
			yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime(),
			last7DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime(),
			last30DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).getTime();

		const result: {
			today: Doc<'threads'>[];
			yesterday: Doc<'threads'>[];
			last7Days: Doc<'threads'>[];
			last30Days: Doc<'threads'>[];
			older: Doc<'threads'>[];
		} = {
			today: [],
			yesterday: [],
			last7Days: [],
			last30Days: [],
			older: []
		};

		for (const thread of searchRes ?? threads.all) {
			const threadTime = thread.lastModified;
			if (threadTime >= todayStart) {
				result.today.push(thread);
			} else if (threadTime >= yesterdayStart) {
				result.yesterday.push(thread);
			} else if (threadTime >= last7DaysStart) {
				result.last7Days.push(thread);
			} else if (threadTime >= last30DaysStart) {
				result.last30Days.push(thread);
			} else {
				result.older.push(thread);
			}
		}

		return result;
	});
</script>

{#if !threads.searchResults}
	<ThreadGroup label="Pinned" threads={threads.pinned} />
{/if}
<ThreadGroup label="Today" threads={buckets.today} />
<ThreadGroup label="Yesterday" threads={buckets.yesterday} />
<ThreadGroup label="Last 7 Days" threads={buckets.last7Days} />
<ThreadGroup label="Last 30 Days" threads={buckets.last30Days} />
<ThreadGroup label="Older" threads={buckets.older} />

{#if (threads.all.length >= PAGE_SIZE || threads.pageNumber > 0) && !threads.searchResults}
	<div class="flex justify-center items-center mt-4">
		<Button
			class="mr-2"
			variant="ghost"
			onclick={() => threads.prevPage()}
			disabled={threads.pageNumber === 0}><ChevronLeft /></Button
		>
		<Button
			variant="ghost"
			onclick={() => threads.nextPage()}
			disabled={threads.all.length !== PAGE_SIZE}><ChevronRight /></Button
		>
	</div>
{/if}
