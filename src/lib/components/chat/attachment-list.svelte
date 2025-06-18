<script lang="ts">
	import type { AttachmentType } from '../../../convex/schema';
	import { badgeVariants } from '$lib/components/ui/badge/index.js';
	import X from '@lucide/svelte/icons/x';
	import Button from '../ui/button/button.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';

	interface Props {
		attachments: AttachmentType[];
		allowDelete?: boolean;
	}

	let { attachments, allowDelete }: Props = $props();

	let deleting = $state(false);

	const client = useConvexClient();
</script>

{#each attachments as item}
	<a
		href={item.url}
		class="{badgeVariants({ variant: 'outline' })} gap-0! p-0!"
		target="_blank"
		rel="noopener noreferrer"
	>
		<span class="px-3 py-1">
			{item.name || 'No Name'}
		</span>
		{#if allowDelete}
			<Button
				variant="ghost"
				size="icon"
				class="border-l-[1px] rounded-none cursor-pointer"
				disabled={deleting}
				onclick={(e) => {
					e.preventDefault();
					deleting = true;
					client
						.mutation(api.attachments.deleteUnsentAttachment, {
							id: item.id
						})
						.catch((error) => {
							console.error('Error deleting attachment:', error);
							alert(`Failed to delete attachment. Please try again. (Error: ${error.message})`);
						})
						.finally(() => {
							deleting = false;
						});
				}}
			>
				<X />
			</Button>
		{/if}
	</a>
{/each}
