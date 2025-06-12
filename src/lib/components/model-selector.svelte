<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';

	const frameworks = [
		{
			value: 'chatgpt/o3',
			label: 'o3'
		},
		{
			value: 'anthropic/claude-4',
			label: 'Claude 4'
		},
		{
			value: 'google/gemini-2.5-flash',
			label: 'Gemini 2.5 Flash'
		},
		{
			value: 'custom/who-knows',
			label: 'Who knows? What a long name for a model!'
		}
	];

	let open = $state(false);
	let value = $state('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(frameworks.find((f) => f.value === value)?.label);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
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
			>
				<span class="truncate flex-1 text-left">
					{selectedValue || 'Select a model...'}
				</span>
				<ChevronsUpDownIcon class="opacity-50 flex-shrink-0 ml-1" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search models..." />
			<Command.List>
				<Command.Empty>No framework found.</Command.Empty>
				<Command.Group value="frameworks">
					{#each frameworks as framework (framework.value)}
						<Command.Item
							value={framework.value}
							onSelect={() => {
								value = framework.value;
								closeAndFocusTrigger();
							}}
						>
							<CheckIcon class={cn(value !== framework.value && 'text-transparent')} />
							{framework.label}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
