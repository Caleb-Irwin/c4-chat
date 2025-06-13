<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Doc } from '../../../convex/_generated/dataModel';
	import Thread from './thread.svelte';
	import Pin from '@lucide/svelte/icons/pin';

	interface Props {
		label: string;
		threads: Doc<'threads'>[] | undefined;
	}
	let props: Props = $props();
</script>

{#if props.threads && props.threads.length > 0}
	<Sidebar.Group>
		<Sidebar.GroupLabel>
			{#if props.label === 'Pinned'}
				<Pin class="mr-1 size-3!" />
			{/if}
			{props.label}
		</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each props.threads as thread (thread._id)}
					<Thread {thread} />
				{/each}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
{/if}
