<script lang="ts">
	import { useThreads } from '$lib/threads.svelte';
	import ThreadGroup from './thread-group.svelte';
	import type { Doc } from '../../../convex/_generated/dataModel';

	const threads = useThreads();

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

		for (const thread of threads.all) {
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

<ThreadGroup label="Pinned" threads={threads.pinned} />
<ThreadGroup label="Today" threads={buckets.today} />
<ThreadGroup label="Yesterday" threads={buckets.yesterday} />
<ThreadGroup label="Last 7 Days" threads={buckets.last7Days} />
<ThreadGroup label="Last 30 Days" threads={buckets.last30Days} />
<ThreadGroup label="Older" threads={buckets.older} />
