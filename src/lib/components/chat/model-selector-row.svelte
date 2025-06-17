<script lang="ts">
	import { useUser } from '$lib/user.svelte';
	import { CONF } from '../../../conf';
	import type { ModelSummary } from '../../../convex/models';
	import { Item } from '../ui/command';
	import { Button } from '../ui/button';
	import * as Tooltip from '../ui/tooltip';
	import Info from '@lucide/svelte/icons/info';
	import Eye from '@lucide/svelte/icons/eye';
	import FileText from '@lucide/svelte/icons/file-text';
	import Brain from '@lucide/svelte/icons/brain';
	import Logo from './logo.svelte';
	import { shortName } from './shortName';

	interface Props {
		model: ModelSummary;
		onSelect: () => void;
	}

	let { model, onSelect }: Props = $props();

	let user = useUser();
</script>

<Item
	value={model.id}
	{onSelect}
	class={!user.row?.openRouterKey && !CONF.freeModelIds.includes(model.id as any)
		? 'cursor-not-allowed opacity-50'
		: ''}
	disabled={!user.row?.openRouterKey && !CONF.freeModelIds.includes(model.id as any)}
>
	<Logo creator={model.creator} class="" />
	{shortName(model.name)}
	<div class="flex-grow"></div>

	{#if model.supportsFiles}
		<FileText class="h-4 w-4 text-muted-foreground" />
	{/if}
	{#if model.supportsImages}
		<Eye class="h-4 w-4 text-muted-foreground" />
	{/if}
	{#if model.supportsReasoning}
		<Brain class="h-4 w-4 text-muted-foreground" />
	{/if}

	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="icon"
					class="h-6 w-6 hover:bg-muted"
					onclick={(e) => {
						e.stopPropagation();
						window.open('https://openrouter.ai/models/' + model.id, '_blank');
					}}
				>
					<Info class="h-3 w-3" />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>View model details on OpenRouter</Tooltip.Content>
	</Tooltip.Root>
</Item>
