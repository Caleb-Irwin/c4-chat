<script lang="ts">
	import { useUser } from '$lib/user.svelte';
	import { CONF } from '../../../conf';
	import type { ModelSummary } from '../../../convex/models';
	import { Item } from '../ui/command';
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
</Item>
