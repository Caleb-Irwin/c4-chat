<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Expand from '@lucide/svelte/icons/expand';
	import Shrink from '@lucide/svelte/icons/shrink';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ModelSummary } from '../../../convex/models';
	import Logo from './logo.svelte';
	import { CONF } from '../../../conf';
	import { useUser } from '$lib/user.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import ModelSelectorRow from './model-selector-row.svelte';
	import { shortName } from './shortName';

	interface Props {
		models: ModelSummary[];
		setModelId: (id: string) => void;
		initModelId?: string;
	}

	let { models, setModelId, initModelId }: Props = $props();

	const user = useUser();
	let smallMode = $state(true);

	let freeModels = models.filter((model) => {
		return CONF.freeModelIds.includes(model.id as any);
	});

	let open = $state(false);
	let value: string = $state(initModelId ?? user.row?.lastModelUsed ?? CONF.defaultModelId);
	let triggerRef = $state<HTMLButtonElement>(null!);

	let pinnedModels = $derived(
		!user.row?.openRouterKey
			? freeModels
			: models.filter((model) => user.row?.pinnedModels?.includes(model.id) || false)
	);

	$effect(() => {
		setModelId(value);
	});

	const selectedValue = $derived(models.find((m) => m.id === value)?.name);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	const modelGroups: { name: string; models: ModelSummary[]; open: boolean }[] = $state([
		{ name: 'OpenAI', models: models.filter((m) => m.creator === 'openai'), open: false },
		{ name: 'Anthropic', models: models.filter((m) => m.creator === 'anthropic'), open: false },
		{ name: 'Google', models: models.filter((m) => m.creator === 'google'), open: false },
		{ name: 'xAI', models: models.filter((m) => m.creator === 'x-ai'), open: false },
		{ name: 'Meta', models: models.filter((m) => m.creator === 'meta-llama'), open: false },
		{ name: 'DeepSeek', models: models.filter((m) => m.creator === 'deepseek'), open: false },
		{ name: 'Qwen', models: models.filter((m) => m.creator === 'qwen'), open: false },
		{ name: 'Other', models: models.filter((m) => m.creator === null), open: false }
	]);

	let searchValue = $state('');
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				class="border-0 bg-transparent dark:bg-transparent shadow-none justify-between min-w-0 max-w-full overflow-hidden"
				role="combobox"
				aria-expanded={open}
				onclick={(e) => {
					searchValue = '';
					open = !open;
					smallMode = true;
				}}
			>
				<span class="truncate flex-1 text-left">
					{shortName(selectedValue || '') || 'Select a model...'}
				</span>
				<ChevronDown class="opacity-50 flex-shrink-0 ml-1" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[400px] max-w-screen p-0" align="start">
		<Command.Root>
			<Command.Input placeholder="Search models..." bind:value={searchValue} />
			<Command.List>
				{#if searchValue || smallMode}
					<Command.Empty>{searchValue ? 'No models found.' : 'No pinned models.'}</Command.Empty>
				{/if}
				{#if smallMode}
					<Command.Group>
						{#each pinnedModels as model (model.id)}
							<ModelSelectorRow
								{model}
								onSelect={() => {
									value = model.id;
									closeAndFocusTrigger();
								}}
							/>
						{/each}
						{#if !pinnedModels.find((model) => model.id === value)}
							<ModelSelectorRow
								model={models.find((m) => m.id === value) as any}
								onSelect={() => {
									closeAndFocusTrigger();
								}}
								selected
							/>
						{/if}
					</Command.Group>
				{:else}
					{#each modelGroups as group (group.name)}
						<Command.Group heading={group.name}>
							{#if !searchValue}
								<button
									class="cursor-pointer w-full aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
									onclick={() => {
										group.open = !group.open;
									}}
								>
									<Logo creator={group.models[0]?.creator} class="" />
									{group.name} Models
									<div class="flex-grow"></div>
									{#if group.open}
										<ChevronUp />
									{:else}
										<ChevronDown />
									{/if}
								</button>
							{/if}

							{#if group.open || searchValue}
								{#each group.models as model (model.id)}
									<ModelSelectorRow
										{model}
										onSelect={() => {
											value = model.id;
											closeAndFocusTrigger();
										}}
									/>
								{/each}
							{/if}
						</Command.Group>
					{/each}
				{/if}
			</Command.List>
		</Command.Root>
		<Separator />
		<button
			class="cursor-pointer w-full aria-selected:bg-accent aria-selected:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex select-none items-center gap-2 rounded-sm px-3 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
			onclick={() => {
				if (!smallMode) {
					searchValue = '';
				}
				smallMode = !smallMode;
			}}
		>
			{#if smallMode}
				<Expand />
				All Models
			{:else}
				<Shrink />
				Show {user.row?.openRouterKey ? 'Pinned' : 'Free'} Models Only
			{/if}
		</button>
	</Popover.Content>
</Popover.Root>
